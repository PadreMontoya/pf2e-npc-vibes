/**
 * Vibe Manager
 * Coordinates all vibe-related functionality
 */

import { MODULE_ID } from './main.js';
import { LineOfSightDetector } from './line-of-sight.js';
import { VibeRoller } from './vibe-roller.js';
import { DataManager } from './data-manager.js';
import { MessagingSystem } from './messaging.js';

export class VibeManager {
  constructor() {
    this.moduleId = MODULE_ID;
    
    // Initialize subsystems
    this.lineOfSightDetector = new LineOfSightDetector();
    this.vibeRoller = new VibeRoller();
    this.dataManager = new DataManager();
    this.messagingSystem = new MessagingSystem();
    
    // Track processed sight pairs to avoid duplicate rolls
    this.processedSightPairs = new Set();
    
    // Debounce sight checks
    this.sightCheckTimeout = null;
    this.sightCheckDelay = 500; // ms
  }

  /**
   * Initialize the canvas and start monitoring
   */
  async initializeCanvas() {
    if (!canvas.ready) return;
    
    console.log('PF2E NPC Vibes | Initializing canvas monitoring');
    
    // Register all existing tokens
    const allTokens = canvas.tokens.placeables;
    for (const token of allTokens) {
      await this.registerToken(token);
    }
    
    // Perform initial sight check
    await this.refreshAllLineOfSight();
  }

  /**
   * Register a token for vibe tracking
   * @param {Token} token - The token to register
   */
  async registerToken(token) {
    if (!token.actor) return;
    
    const actorType = token.actor.type;
    if (actorType !== 'character' && actorType !== 'npc') return;
    
    if (actorType === 'npc') {
      // Register NPC in data manager
      this.dataManager.getNPCStableId(token);
    }
  }

  /**
   * Check line of sight for a specific token
   * @param {Token} token - The token to check
   */
  async checkLineOfSight(token) {
    // Debounce sight checks
    if (this.sightCheckTimeout) {
      clearTimeout(this.sightCheckTimeout);
    }
    
    this.sightCheckTimeout = setTimeout(async () => {
      await this.performSightCheck(token);
    }, this.sightCheckDelay);
  }

  /**
   * Perform the actual sight check for a token
   * @param {Token} token - The token to check
   */
  async performSightCheck(token) {
    if (!token.actor) return;
    
    const actorType = token.actor.type;
    
    if (actorType === 'character') {
      // PC token - check sight to all NPCs
      await this.checkPCToNPCSight(token);
    } else if (actorType === 'npc') {
      // NPC token - check sight to all PCs
      await this.checkNPCToPCSight(token);
    }
  }

  /**
   * Check sight from a PC to all NPCs
   * @param {Token} pcToken - The PC token
   */
  async checkPCToNPCSight(pcToken) {
    const npcTokens = canvas.tokens.placeables.filter(t => 
      t.actor && t.actor.type === 'npc'
    );

    for (const npcToken of npcTokens) {
      await this.checkSightBetweenTokens(pcToken, npcToken);
    }
  }

  /**
   * Check sight from an NPC to all PCs
   * @param {Token} npcToken - The NPC token
   */
  async checkNPCToPCSight(npcToken) {
    const pcTokens = canvas.tokens.placeables.filter(t => 
      t.actor && t.actor.type === 'character'
    );

    for (const pcToken of pcTokens) {
      await this.checkSightBetweenTokens(pcToken, npcToken);
    }
  }

  /**
   * Check sight between two specific tokens
   * @param {Token} pcToken - The PC token
   * @param {Token} npcToken - The NPC token
   */
  async checkSightBetweenTokens(pcToken, npcToken) {
    const pcId = this.dataManager.getPCStableId(pcToken);
    const npcId = this.dataManager.getNPCStableId(npcToken);
    
    if (!pcId || !npcId) return;

    // Check if they can see each other
    const pcCanSeeNpc = this.lineOfSightDetector.canPCSeeNPC(pcToken, npcToken);
    const npcCanSeePc = this.lineOfSightDetector.canNPCSeePC(npcToken, pcToken);

    if (!pcCanSeeNpc && !npcCanSeePc) return;

    // Check if we've already processed this pair
    const pairKey = `${pcId}-${npcId}`;
    if (this.processedSightPairs.has(pairKey)) return;

    // Check if vibes already exist
    const pcVibeExists = this.dataManager.hasVibe(pcId, npcId, 'pc');
    const npcVibeExists = this.dataManager.hasVibe(npcId, pcId, 'npc');

    if (pcVibeExists && npcVibeExists) {
      // Both vibes exist, just update visual effects
      await this.updateVisualEffects(pcToken, npcToken);
      return;
    }

    // First sight - roll for vibes
    console.log(`PF2E NPC Vibes | First sight between ${pcToken.name} and ${npcToken.name}`);
    
    // Send first sight notification
    await this.messagingSystem.sendFirstSightNotification(pcToken, npcToken);
    
    // Roll vibes
    const vibeResults = await this.vibeRoller.rollVibes(pcToken, npcToken);
    
    // Store vibe results
    if (!pcVibeExists) {
      await this.dataManager.storeVibe(pcId, npcId, vibeResults.pcToNpc.vibeType, 'pc');
      
      // Send notification if significant
      if (vibeResults.pcToNpc.hasVibe) {
        await this.messagingSystem.sendVibeNotification(vibeResults.pcToNpc, true);
      }
    }
    
    if (!npcVibeExists) {
      await this.dataManager.storeVibe(npcId, pcId, vibeResults.npcToPc.vibeType, 'npc');
      
      // Send notification if significant
      if (vibeResults.npcToPc.hasVibe) {
        await this.messagingSystem.sendVibeNotification(vibeResults.npcToPc, true);
      }
    }

    // Update visual effects
    await this.updateVisualEffects(pcToken, npcToken);
    
    // Mark as processed
    this.processedSightPairs.add(pairKey);
    
    // Broadcast to other clients
    this.broadcastVibeUpdate(pcId, npcId, vibeResults);
  }

  /**
   * Update visual effects for a PC-NPC pair
   * @param {Token} pcToken - The PC token
   * @param {Token} npcToken - The NPC token
   */
  async updateVisualEffects(pcToken, npcToken) {
    const visualEffects = game.modules.get(this.moduleId).visualEffects;
    if (!visualEffects) return;

    const pcId = this.dataManager.getPCStableId(pcToken);
    const npcId = this.dataManager.getNPCStableId(npcToken);
    
    if (!pcId || !npcId) return;

    // Get PC's vibe towards NPC
    const pcVibe = this.dataManager.getVibe(pcId, npcId, 'pc');
    if (pcVibe && pcVibe.vibe !== 'none') {
      // Get PC owners
      const pcOwners = this.getTokenOwners(pcToken);
      
      // Create aura visible only to PC owners
      visualEffects.createVibeAura(npcToken.id, pcVibe.vibe, pcOwners);
    }
  }

  /**
   * Get the owners of a token
   * @param {Token} token - The token
   * @returns {Array} - Array of user IDs
   */
  getTokenOwners(token) {
    if (!token.actor) return [];
    
    const ownership = token.actor.ownership;
    const owners = [];
    
    for (const [userId, level] of Object.entries(ownership)) {
      if (level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER && userId !== 'default') {
        const user = game.users.get(userId);
        if (user && user.active) {
          owners.push(userId);
        }
      }
    }
    
    return owners;
  }

  /**
   * Refresh all line of sight checks
   */
  async refreshAllLineOfSight() {
    // Clear processed pairs to allow re-checking
    this.processedSightPairs.clear();
    
    // Clear sight cache
    this.lineOfSightDetector.clearCache();
    
    // Check all PC-NPC pairs
    const pcTokens = canvas.tokens.placeables.filter(t => 
      t.actor && t.actor.type === 'character'
    );
    
    for (const pcToken of pcTokens) {
      await this.checkPCToNPCSight(pcToken);
    }
  }

  /**
   * Broadcast vibe update to other clients
   * @param {string} pcId - PC stable ID
   * @param {string} npcId - NPC stable ID
   * @param {Object} vibeResults - Vibe roll results
   */
  broadcastVibeUpdate(pcId, npcId, vibeResults) {
    if (!game.user.isGM) return; // Only GM broadcasts
    
    game.socket.emit(`module.${this.moduleId}`, {
      type: 'vibeRoll',
      pcId,
      npcId,
      vibeResults
    });
  }

  /**
   * Handle vibe roll from socket
   * @param {Object} data - Socket data
   */
  async handleVibeRoll(data) {
    const { pcId, npcId, vibeResults } = data;
    
    // Update local visual effects
    const pcActor = game.actors.find(a => a.uuid === pcId);
    const npcActor = game.actors.find(a => a.uuid === npcId);
    
    if (pcActor && npcActor) {
      const pcToken = canvas.tokens.placeables.find(t => t.actor?.uuid === pcId);
      const npcToken = canvas.tokens.placeables.find(t => t.actor?.uuid === npcId);
      
      if (pcToken && npcToken) {
        await this.updateVisualEffects(pcToken, npcToken);
      }
    }
  }

  /**
   * Handle vibe update from socket
   * @param {Object} data - Socket data
   */
  async handleVibeUpdate(data) {
    // Refresh visual effects
    const visualEffects = game.modules.get(this.moduleId).visualEffects;
    if (visualEffects) {
      visualEffects.refreshAllEffects();
    }
  }

  /**
   * Handle connection update from socket
   * @param {Object} data - Socket data
   */
  async handleConnectionUpdate(data) {
    // Could trigger additional effects based on connection changes
    console.log('PF2E NPC Vibes | Connection updated:', data);
  }

  /**
   * Clean up when module is disabled
   */
  cleanup() {
    this.processedSightPairs.clear();
    this.lineOfSightDetector.clearCache();
    
    if (this.sightCheckTimeout) {
      clearTimeout(this.sightCheckTimeout);
    }
  }
}
