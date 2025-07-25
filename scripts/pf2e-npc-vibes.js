/**
 * Main PF2E NPC Vibes class
 * Handles core module functionality and coordination between components
 */

import { MODULE_ID } from './main.js';

export class PF2ENPCVibes {
  constructor() {
    this.moduleId = MODULE_ID;
    this.initialized = false;
    
    // Bind event handlers
    this.onTokenUpdate = this.onTokenUpdate.bind(this);
    this.onTokenCreate = this.onTokenCreate.bind(this);
    this.onTokenDelete = this.onTokenDelete.bind(this);
    this.onSightRefresh = this.onSightRefresh.bind(this);
    
    this.setupHooks();
  }

  /**
   * Set up Foundry hooks for token and vision events
   */
  setupHooks() {
    // Token lifecycle hooks
    Hooks.on('createToken', this.onTokenCreate);
    Hooks.on('updateToken', this.onTokenUpdate);
    Hooks.on('deleteToken', this.onTokenDelete);
    
    // Vision and sight hooks
    Hooks.on('sightRefresh', this.onSightRefresh);
    Hooks.on('canvasReady', () => this.onCanvasReady());
    
    // Combat hooks for potential future features
    Hooks.on('combatStart', () => this.onCombatStart());
    Hooks.on('combatEnd', () => this.onCombatEnd());
  }

  /**
   * Handle token creation
   */
  async onTokenCreate(token, options, userId) {
    if (!this.shouldProcessToken(token)) return;
    
    const vibeManager = game.modules.get(this.moduleId).vibeManager;
    if (vibeManager) {
      await vibeManager.registerToken(token);
    }
  }

  /**
   * Handle token updates (visibility changes only, not movement)
   */
  async onTokenUpdate(token, changes, options, userId) {
    if (!this.shouldProcessToken(token)) return;

    // Only check for visibility changes, not movement (performance optimization)
    const relevantChanges = ['hidden'];
    const hasRelevantChanges = relevantChanges.some(prop => prop in changes);

    if (hasRelevantChanges) {
      console.log(`🎭 PF2E NPC Vibes | Token ${token.name} visibility changed:`, Object.keys(changes));
      const vibeManager = game.modules.get(this.moduleId).vibeManager;
      if (vibeManager) {
        await vibeManager.checkLineOfSight(token, changes);
      }
    }
  }

  /**
   * Handle token deletion
   */
  async onTokenDelete(token, options, userId) {
    const visualEffects = game.modules.get(this.moduleId).visualEffects;
    if (visualEffects) {
      visualEffects.removeTokenEffects(token.id);
    }
  }

  /**
   * Handle sight refresh events
   */
  async onSightRefresh(vision) {
    const vibeManager = game.modules.get(this.moduleId).vibeManager;
    if (vibeManager) {
      await vibeManager.refreshAllLineOfSight();
    }
  }

  /**
   * Handle canvas ready event
   */
  async onCanvasReady() {
    const vibeManager = game.modules.get(this.moduleId).vibeManager;
    const visualEffects = game.modules.get(this.moduleId).visualEffects;
    
    if (vibeManager) {
      await vibeManager.initializeCanvas();
    }
    
    if (visualEffects) {
      visualEffects.refreshAllEffects();
    }
  }

  /**
   * Handle combat start
   */
  onCombatStart() {
    // Future: Could implement special vibe behaviors during combat
    console.log('PF2E NPC Vibes | Combat started');
  }

  /**
   * Handle combat end
   */
  onCombatEnd() {
    // Future: Could implement post-combat vibe adjustments
    console.log('PF2E NPC Vibes | Combat ended');
  }

  /**
   * Check if a token should be processed by the module
   */
  shouldProcessToken(token) {
    // Only process tokens that represent actors
    if (!token.actor) return false;

    // Skip if the token is hidden from all players (unless GM)
    if (token.hidden && !game.user.isGM) return false;

    // Only process PCs and NPCs
    const actorType = token.actor.type;
    if (actorType !== 'character' && actorType !== 'npc') return false;

    // Only process actors with the humanoid trait
    if (!this.hasHumanoidTrait(token.actor)) {
      console.log(`🎭 PF2E NPC Vibes | Skipping ${token.name} - not humanoid`);
      return false;
    }

    return true;
  }

  /**
   * Check if an actor has the humanoid trait
   * @param {Actor} actor - The actor to check
   * @returns {boolean} - True if the actor has the humanoid trait
   */
  hasHumanoidTrait(actor) {
    try {
      // For PF2E system, check traits
      const traits = actor.system?.traits?.value || [];
      const hasHumanoid = traits.includes('humanoid');

      if (hasHumanoid) {
        console.log(`🎭 PF2E NPC Vibes | ${actor.name} has humanoid trait`);
      }

      return hasHumanoid;
    } catch (error) {
      console.warn(`🎭 PF2E NPC Vibes | Error checking humanoid trait for ${actor.name}:`, error);
      // Default to true for PCs, false for NPCs if we can't check
      return actor.type === 'character';
    }
  }

  /**
   * Get module settings
   */
  getSetting(key) {
    return game.settings.get(this.moduleId, key);
  }

  /**
   * Set module settings
   */
  async setSetting(key, value) {
    return await game.settings.set(this.moduleId, key, value);
  }

  /**
   * Get vibe data from settings
   */
  getVibeData() {
    return this.getSetting('vibeData');
  }

  /**
   * Save vibe data to settings
   */
  async saveVibeData(data) {
    return await this.setSetting('vibeData', data);
  }

  /**
   * Utility method to check if user is GM
   */
  isGM() {
    return game.user.isGM;
  }

  /**
   * Utility method to get controlled tokens
   */
  getControlledTokens() {
    return canvas.tokens.controlled;
  }

  /**
   * Utility method to get all tokens on canvas
   */
  getAllTokens() {
    return canvas.tokens.placeables;
  }

  /**
   * Utility method to get PC tokens
   */
  getPCTokens() {
    return this.getAllTokens().filter(token => 
      token.actor && token.actor.type === 'character'
    );
  }

  /**
   * Utility method to get NPC tokens
   */
  getNPCTokens() {
    return this.getAllTokens().filter(token => 
      token.actor && token.actor.type === 'npc'
    );
  }
}
