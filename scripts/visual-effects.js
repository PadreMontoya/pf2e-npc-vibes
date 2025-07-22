/**
 * Visual Effects System
 * Handles colored aura effects that are visible only to specific PCs
 */

import { MODULE_ID } from './main.js';

export class VisualEffects {
  constructor() {
    this.moduleId = MODULE_ID;
    this.activeEffects = new Map(); // tokenId -> effect elements
    this.observerTargets = new Map(); // tokenId -> Set of observing user IDs
    
    this.setupHooks();
  }

  /**
   * Set up Foundry hooks for visual effects
   */
  setupHooks() {
    // Refresh effects when canvas is ready
    Hooks.on('canvasReady', () => {
      this.refreshAllEffects();
    });

    // Update effects when tokens are updated
    Hooks.on('updateToken', (token, changes) => {
      if ('x' in changes || 'y' in changes || 'width' in changes || 'height' in changes) {
        this.updateTokenEffectPosition(token.id);
      }
    });

    // Clean up effects when tokens are deleted
    Hooks.on('deleteToken', (token) => {
      this.removeTokenEffects(token.id);
    });

    // Update effects when user changes
    Hooks.on('userConnected', () => {
      this.refreshAllEffects();
    });
  }

  /**
   * Create or update a vibe aura for an NPC token
   * @param {string} npcTokenId - The NPC token ID
   * @param {string} vibeType - The vibe type (repulsed, curious, awestruck)
   * @param {Array} visibleToUsers - Array of user IDs who can see this aura
   */
  createVibeAura(npcTokenId, vibeType, visibleToUsers = []) {
    if (!game.settings.get(this.moduleId, 'enableVisualIndicators')) {
      return;
    }

    // Only show to users who should see it
    if (!visibleToUsers.includes(game.user.id) && !game.user.isGM) {
      return;
    }

    const token = canvas.tokens.get(npcTokenId);
    if (!token) return;

    // Remove existing effect for this token
    this.removeTokenEffects(npcTokenId);

    // Create the aura element
    const auraElement = this.createAuraElement(token, vibeType);
    if (!auraElement) return;

    // Add to canvas
    const effectsLayer = this.getEffectsLayer();
    effectsLayer.appendChild(auraElement);

    // Store reference
    this.activeEffects.set(npcTokenId, auraElement);
    this.observerTargets.set(npcTokenId, new Set(visibleToUsers));

    console.log(`PF2E NPC Vibes | Created ${vibeType} aura for ${token.name}`);
  }

  /**
   * Create the HTML element for a vibe aura
   * @param {Token} token - The token to create aura for
   * @param {string} vibeType - The vibe type
   * @returns {HTMLElement} - The aura element
   */
  createAuraElement(token, vibeType) {
    const auraElement = document.createElement('div');
    auraElement.className = `vibe-aura ${vibeType}`;
    auraElement.dataset.tokenId = token.id;
    auraElement.dataset.vibeType = vibeType;

    // Get settings
    const opacity = game.settings.get(this.moduleId, 'auraOpacity') / 100;
    const sizeMultiplier = game.settings.get(this.moduleId, 'auraSize');

    // Calculate size and position
    const tokenBounds = token.bounds;
    const auraSize = Math.max(tokenBounds.width, tokenBounds.height) * sizeMultiplier;
    
    // Position the aura
    const centerX = tokenBounds.x + tokenBounds.width / 2;
    const centerY = tokenBounds.y + tokenBounds.height / 2;
    
    auraElement.style.cssText = `
      position: absolute;
      left: ${centerX - auraSize / 2}px;
      top: ${centerY - auraSize / 2}px;
      width: ${auraSize}px;
      height: ${auraSize}px;
      opacity: ${opacity};
      pointer-events: none;
      z-index: 10;
    `;

    return auraElement;
  }

  /**
   * Update the position of an existing aura effect
   * @param {string} tokenId - The token ID
   */
  updateTokenEffectPosition(tokenId) {
    const auraElement = this.activeEffects.get(tokenId);
    if (!auraElement) return;

    const token = canvas.tokens.get(tokenId);
    if (!token) {
      this.removeTokenEffects(tokenId);
      return;
    }

    // Get current settings
    const sizeMultiplier = game.settings.get(this.moduleId, 'auraSize');
    
    // Recalculate position
    const tokenBounds = token.bounds;
    const auraSize = Math.max(tokenBounds.width, tokenBounds.height) * sizeMultiplier;
    const centerX = tokenBounds.x + tokenBounds.width / 2;
    const centerY = tokenBounds.y + tokenBounds.height / 2;

    auraElement.style.left = `${centerX - auraSize / 2}px`;
    auraElement.style.top = `${centerY - auraSize / 2}px`;
    auraElement.style.width = `${auraSize}px`;
    auraElement.style.height = `${auraSize}px`;
  }

  /**
   * Remove all visual effects for a token
   * @param {string} tokenId - The token ID
   */
  removeTokenEffects(tokenId) {
    const auraElement = this.activeEffects.get(tokenId);
    if (auraElement && auraElement.parentNode) {
      auraElement.parentNode.removeChild(auraElement);
    }
    
    this.activeEffects.delete(tokenId);
    this.observerTargets.delete(tokenId);
  }

  /**
   * Refresh all visual effects based on current vibe data
   */
  refreshAllEffects() {
    if (!canvas.ready) return;

    // Clear existing effects
    this.clearAllEffects();

    // Get vibe data
    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    if (!dataManager) return;

    const allVibes = dataManager.getAllVibes();
    
    // Create effects for PC vibes towards NPCs
    this.refreshPCVibeEffects(allVibes.pcVibes);
  }

  /**
   * Refresh visual effects for PC vibes towards NPCs
   * @param {Object} pcVibes - PC vibe data
   */
  refreshPCVibeEffects(pcVibes) {
    for (const [pcUuid, npcVibes] of Object.entries(pcVibes)) {
      // Find the PC actor and their owners
      const pcActor = game.actors.find(actor => actor.uuid === pcUuid);
      if (!pcActor) continue;

      const pcOwners = this.getActorOwners(pcActor);
      
      for (const [npcUuid, vibeData] of Object.entries(npcVibes)) {
        if (vibeData.vibe === 'none') continue;

        // Find NPC tokens on current scene
        const npcTokens = canvas.tokens.placeables.filter(token => 
          token.actor && token.actor.uuid === npcUuid
        );

        for (const npcToken of npcTokens) {
          this.createVibeAura(npcToken.id, vibeData.vibe, pcOwners);
        }
      }
    }
  }

  /**
   * Get the owners of an actor
   * @param {Actor} actor - The actor
   * @returns {Array} - Array of user IDs
   */
  getActorOwners(actor) {
    const owners = [];
    const ownership = actor.ownership;
    
    for (const [userId, level] of Object.entries(ownership)) {
      if (level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER && userId !== 'default') {
        owners.push(userId);
      }
    }
    
    return owners;
  }

  /**
   * Get or create the effects layer
   * @returns {HTMLElement} - The effects container
   */
  getEffectsLayer() {
    let effectsLayer = document.getElementById('pf2e-npc-vibes-effects');
    
    if (!effectsLayer) {
      effectsLayer = document.createElement('div');
      effectsLayer.id = 'pf2e-npc-vibes-effects';
      effectsLayer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      `;
      
      // Add to canvas
      const canvasElement = document.getElementById('board');
      if (canvasElement) {
        canvasElement.appendChild(effectsLayer);
      }
    }
    
    return effectsLayer;
  }

  /**
   * Clear all visual effects
   */
  clearAllEffects() {
    const effectsLayer = document.getElementById('pf2e-npc-vibes-effects');
    if (effectsLayer) {
      effectsLayer.innerHTML = '';
    }
    
    this.activeEffects.clear();
    this.observerTargets.clear();
  }

  /**
   * Update aura settings and refresh effects
   */
  updateAuraSettings() {
    // Update opacity for all existing auras
    const opacity = game.settings.get(this.moduleId, 'auraOpacity') / 100;
    
    for (const auraElement of this.activeEffects.values()) {
      auraElement.style.opacity = opacity;
    }

    // Update sizes by refreshing all effects
    this.refreshAllEffects();
  }

  /**
   * Check if current user should see an aura for a token
   * @param {string} tokenId - The token ID
   * @returns {boolean} - True if user should see the aura
   */
  shouldShowAura(tokenId) {
    if (game.user.isGM) return true;
    
    const observers = this.observerTargets.get(tokenId);
    return observers && observers.has(game.user.id);
  }

  /**
   * Get debug information about active effects
   * @returns {Object} - Debug information
   */
  getDebugInfo() {
    return {
      activeEffectsCount: this.activeEffects.size,
      observerTargetsCount: this.observerTargets.size,
      effectsLayerExists: !!document.getElementById('pf2e-npc-vibes-effects'),
      canvasReady: canvas.ready,
      settings: {
        enableVisualIndicators: game.settings.get(this.moduleId, 'enableVisualIndicators'),
        auraOpacity: game.settings.get(this.moduleId, 'auraOpacity'),
        auraSize: game.settings.get(this.moduleId, 'auraSize')
      }
    };
  }
}
