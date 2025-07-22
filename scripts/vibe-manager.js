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

    // Debug tracking
    this.debugLog = [];
    this.vibeChecks = [];

    console.log('🎭 PF2E NPC Vibes | VibeManager initialized');
  }

  /**
   * Initialize the canvas and start monitoring
   */
  async initializeCanvas() {
    if (!canvas.ready) {
      console.warn('🎭 PF2E NPC Vibes | Canvas not ready, skipping initialization');
      return;
    }

    console.log('🎭 PF2E NPC Vibes | Initializing canvas monitoring');

    // Register all existing tokens
    const allTokens = canvas.tokens.placeables;
    console.log(`🎭 PF2E NPC Vibes | Found ${allTokens.length} tokens on canvas`);

    for (const token of allTokens) {
      await this.registerToken(token);
    }

    // Perform initial sight check
    await this.refreshAllLineOfSight();

    console.log('🎭 PF2E NPC Vibes | Canvas initialization complete');
  }

  /**
   * Register a token for vibe tracking
   * @param {Token} token - The token to register
   */
  async registerToken(token) {
    if (!token.actor) {
      console.log(`🎭 PF2E NPC Vibes | Skipping token ${token.name} - no actor`);
      return;
    }

    const actorType = token.actor.type;
    if (actorType !== 'character' && actorType !== 'npc') {
      console.log(`🎭 PF2E NPC Vibes | Skipping token ${token.name} - type: ${actorType}`);
      return;
    }

    console.log(`🎭 PF2E NPC Vibes | Registering ${actorType}: ${token.name} (ID: ${token.id})`);

    if (actorType === 'npc') {
      // Register NPC in data manager
      const stableId = this.dataManager.getNPCStableId(token);
      console.log(`🎭 PF2E NPC Vibes | NPC ${token.name} stable ID: ${stableId}`);
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

    console.log(`🎭 PF2E NPC Vibes | Checking sight between ${pcToken.name} (${pcId}) and ${npcToken.name} (${npcId})`);

    if (!pcId || !npcId) {
      console.warn(`🎭 PF2E NPC Vibes | Missing stable IDs - PC: ${pcId}, NPC: ${npcId}`);
      return;
    }

    // Check if they can see each other
    const pcCanSeeNpc = this.lineOfSightDetector.canPCSeeNPC(pcToken, npcToken);
    const npcCanSeePc = this.lineOfSightDetector.canNPCSeePC(npcToken, pcToken);

    console.log(`🎭 PF2E NPC Vibes | Line of sight - PC can see NPC: ${pcCanSeeNpc}, NPC can see PC: ${npcCanSeePc}`);

    if (!pcCanSeeNpc && !npcCanSeePc) {
      console.log(`🎭 PF2E NPC Vibes | No line of sight between ${pcToken.name} and ${npcToken.name}`);
      return;
    }

    // Check if we've already processed this pair
    const pairKey = `${pcId}-${npcId}`;
    if (this.processedSightPairs.has(pairKey)) {
      console.log(`🎭 PF2E NPC Vibes | Already processed pair: ${pairKey}`);
      return;
    }

    // Check if vibes already exist
    const pcVibeExists = this.dataManager.hasVibe(pcId, npcId, 'pc');
    const npcVibeExists = this.dataManager.hasVibe(npcId, pcId, 'npc');

    console.log(`🎭 PF2E NPC Vibes | Existing vibes - PC: ${pcVibeExists}, NPC: ${npcVibeExists}`);

    if (pcVibeExists && npcVibeExists) {
      // Both vibes exist, just update visual effects
      console.log(`🎭 PF2E NPC Vibes | Both vibes exist, updating visual effects only`);
      await this.updateVisualEffects(pcToken, npcToken);
      return;
    }

    // First sight - roll for vibes
    console.log(`🎭 PF2E NPC Vibes | 🎲 FIRST SIGHT! Rolling vibes between ${pcToken.name} and ${npcToken.name}`);

    // Send first sight notification
    await this.messagingSystem.sendFirstSightNotification(pcToken, npcToken);

    // Roll vibes
    const vibeResults = await this.vibeRoller.rollVibes(pcToken, npcToken);

    // Log the results
    console.log(`🎭 PF2E NPC Vibes | 🎲 VIBE RESULTS:`, {
      pcToNpc: {
        roll: vibeResults.pcToNpc.roll,
        vibe: vibeResults.pcToNpc.vibeType,
        hasVibe: vibeResults.pcToNpc.hasVibe
      },
      npcToPc: {
        roll: vibeResults.npcToPc.roll,
        vibe: vibeResults.npcToPc.vibeType,
        hasVibe: vibeResults.npcToPc.hasVibe
      }
    });

    // Store debug info
    const debugEntry = {
      timestamp: Date.now(),
      pcName: pcToken.name,
      npcName: npcToken.name,
      pcId,
      npcId,
      pcCanSeeNpc,
      npcCanSeePc,
      vibeResults: {
        pcToNpc: {
          roll: vibeResults.pcToNpc.roll,
          vibe: vibeResults.pcToNpc.vibeType,
          hasVibe: vibeResults.pcToNpc.hasVibe
        },
        npcToPc: {
          roll: vibeResults.npcToPc.roll,
          vibe: vibeResults.npcToPc.vibeType,
          hasVibe: vibeResults.npcToPc.hasVibe
        }
      }
    };
    this.vibeChecks.push(debugEntry);

    // Store vibe results
    if (!pcVibeExists) {
      await this.dataManager.storeVibe(pcId, npcId, vibeResults.pcToNpc.vibeType, 'pc');
      console.log(`🎭 PF2E NPC Vibes | Stored PC vibe: ${vibeResults.pcToNpc.vibeType}`);

      // Send notification if significant
      if (vibeResults.pcToNpc.hasVibe) {
        await this.messagingSystem.sendVibeNotification(vibeResults.pcToNpc, true);
      }
    }

    if (!npcVibeExists) {
      await this.dataManager.storeVibe(npcId, pcId, vibeResults.npcToPc.vibeType, 'npc');
      console.log(`🎭 PF2E NPC Vibes | Stored NPC vibe: ${vibeResults.npcToPc.vibeType}`);

      // Send notification if significant
      if (vibeResults.npcToPc.hasVibe) {
        await this.messagingSystem.sendVibeNotification(vibeResults.npcToPc, true);
      }
    }

    // Update visual effects
    await this.updateVisualEffects(pcToken, npcToken);

    // Mark as processed
    this.processedSightPairs.add(pairKey);
    console.log(`🎭 PF2E NPC Vibes | Marked pair as processed: ${pairKey}`);

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
    console.log('🎭 PF2E NPC Vibes | 🔄 Refreshing all line of sight checks');

    // Clear processed pairs to allow re-checking
    this.processedSightPairs.clear();
    console.log('🎭 PF2E NPC Vibes | Cleared processed sight pairs');

    // Clear sight cache
    this.lineOfSightDetector.clearCache();
    console.log('🎭 PF2E NPC Vibes | Cleared sight cache');

    // Check all PC-NPC pairs
    const pcTokens = canvas.tokens.placeables.filter(t =>
      t.actor && t.actor.type === 'character'
    );
    const npcTokens = canvas.tokens.placeables.filter(t =>
      t.actor && t.actor.type === 'npc'
    );

    console.log(`🎭 PF2E NPC Vibes | Found ${pcTokens.length} PC tokens and ${npcTokens.length} NPC tokens`);

    for (const pcToken of pcTokens) {
      console.log(`🎭 PF2E NPC Vibes | Checking sight for PC: ${pcToken.name}`);
      await this.checkPCToNPCSight(pcToken);
    }

    console.log('🎭 PF2E NPC Vibes | ✅ Sight check refresh complete');
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
   * Get debug information about vibe checks
   * @returns {Object} - Debug information
   */
  getDebugInfo() {
    return {
      vibeChecks: this.vibeChecks,
      processedPairs: Array.from(this.processedSightPairs),
      totalChecks: this.vibeChecks.length,
      recentChecks: this.vibeChecks.slice(-10), // Last 10 checks
      stats: {
        totalVibes: this.vibeChecks.reduce((acc, check) => {
          if (check.vibeResults.pcToNpc.hasVibe) acc++;
          if (check.vibeResults.npcToPc.hasVibe) acc++;
          return acc;
        }, 0),
        repulsedCount: this.vibeChecks.reduce((acc, check) => {
          if (check.vibeResults.pcToNpc.vibe === 'repulsed') acc++;
          if (check.vibeResults.npcToPc.vibe === 'repulsed') acc++;
          return acc;
        }, 0),
        curiousCount: this.vibeChecks.reduce((acc, check) => {
          if (check.vibeResults.pcToNpc.vibe === 'curious') acc++;
          if (check.vibeResults.npcToPc.vibe === 'curious') acc++;
          return acc;
        }, 0),
        awestruckCount: this.vibeChecks.reduce((acc, check) => {
          if (check.vibeResults.pcToNpc.vibe === 'awestruck') acc++;
          if (check.vibeResults.npcToPc.vibe === 'awestruck') acc++;
          return acc;
        }, 0)
      }
    };
  }

  /**
   * Clear debug data
   */
  clearDebugData() {
    this.vibeChecks = [];
    this.debugLog = [];
    console.log('🎭 PF2E NPC Vibes | Debug data cleared');
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
