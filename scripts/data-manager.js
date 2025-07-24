/**
 * Data Storage and Persistence Manager
 * Handles persistent storage of vibe relationships and connections
 */

import { MODULE_ID } from './main.js';

export class DataManager {
  constructor() {
    this.moduleId = MODULE_ID;
    this.dataCache = null;
    this.saveTimeout = null;
    this.saveDelay = 1000; // Debounce saves by 1 second
  }

  /**
   * Get the current vibe data from settings
   * @returns {Object} - The vibe data object
   */
  getVibeData() {
    if (!this.dataCache) {
      this.dataCache = game.settings.get(this.moduleId, 'vibeData');
    }
    return this.dataCache;
  }

  /**
   * Save vibe data to settings (debounced)
   * @param {Object} data - The data to save
   */
  async saveVibeData(data = null) {
    if (data) {
      this.dataCache = data;
    }

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Debounce the save operation
    this.saveTimeout = setTimeout(async () => {
      try {
        await game.settings.set(this.moduleId, 'vibeData', this.dataCache);
        console.log('PF2E NPC Vibes | Data saved successfully');
      } catch (error) {
        console.error('PF2E NPC Vibes | Failed to save data:', error);
        ui.notifications.error('Failed to save vibe data');
      }
    }, this.saveDelay);
  }

  /**
   * Get a stable ID for an NPC that persists through token deletion
   * @param {Token} npcToken - The NPC token
   * @returns {string} - Stable NPC ID
   */
  getNPCStableId(npcToken) {
    if (!npcToken || !npcToken.actor) return null;
    
    // Use actor UUID as the primary stable identifier
    const actorUuid = npcToken.actor.uuid;
    
    // Register this NPC in our registry
    const data = this.getVibeData();
    if (!data.npcRegistry[actorUuid]) {
      data.npcRegistry[actorUuid] = {
        actorId: npcToken.actor.id,
        actorName: npcToken.actor.name,
        firstSeen: Date.now(),
        lastSeen: Date.now()
      };
      this.saveVibeData(data);
    } else {
      // Update last seen
      data.npcRegistry[actorUuid].lastSeen = Date.now();
      this.saveVibeData(data);
    }
    
    return actorUuid;
  }

  /**
   * Get a stable ID for a PC
   * @param {Token} pcToken - The PC token
   * @returns {string} - Stable PC ID
   */
  getPCStableId(pcToken) {
    if (!pcToken || !pcToken.actor) return null;
    
    // For PCs, use actor UUID as well
    return pcToken.actor.uuid;
  }

  /**
   * Store a vibe relationship
   * @param {string} sourceId - Source character stable ID
   * @param {string} targetId - Target character stable ID
   * @param {string} vibeType - The vibe type
   * @param {string} sourceType - 'pc' or 'npc'
   */
  async storeVibe(sourceId, targetId, vibeType, sourceType) {
    const data = this.getVibeData();
    
    if (sourceType === 'pc') {
      // PC vibe towards NPC
      if (!data.pcVibes[sourceId]) {
        data.pcVibes[sourceId] = {};
      }
      data.pcVibes[sourceId][targetId] = {
        vibe: vibeType,
        timestamp: Date.now()
      };
    } else {
      // NPC vibe towards PC
      if (!data.npcVibes[sourceId]) {
        data.npcVibes[sourceId] = {};
      }
      data.npcVibes[sourceId][targetId] = {
        vibe: vibeType,
        timestamp: Date.now()
      };
    }
    
    await this.saveVibeData(data);
  }

  /**
   * Get a vibe relationship
   * @param {string} sourceId - Source character stable ID
   * @param {string} targetId - Target character stable ID
   * @param {string} sourceType - 'pc' or 'npc'
   * @returns {Object|null} - Vibe data or null if not found
   */
  getVibe(sourceId, targetId, sourceType) {
    const data = this.getVibeData();
    
    if (sourceType === 'pc') {
      return data.pcVibes[sourceId]?.[targetId] || null;
    } else {
      return data.npcVibes[sourceId]?.[targetId] || null;
    }
  }

  /**
   * Check if a vibe relationship exists
   * @param {string} sourceId - Source character stable ID
   * @param {string} targetId - Target character stable ID
   * @param {string} sourceType - 'pc' or 'npc'
   * @returns {boolean} - True if vibe exists
   */
  hasVibe(sourceId, targetId, sourceType) {
    return this.getVibe(sourceId, targetId, sourceType) !== null;
  }

  /**
   * Store a connection level between PC and NPC
   * @param {string} pcId - PC stable ID
   * @param {string} npcId - NPC stable ID
   * @param {string} connectionLevel - Connection level
   */
  async storeConnection(pcId, npcId, connectionLevel) {
    const data = this.getVibeData();
    
    if (!data.connections[pcId]) {
      data.connections[pcId] = {};
    }
    
    data.connections[pcId][npcId] = {
      level: connectionLevel,
      timestamp: Date.now()
    };
    
    await this.saveVibeData(data);
  }

  /**
   * Get connection level between PC and NPC
   * @param {string} pcId - PC stable ID
   * @param {string} npcId - NPC stable ID
   * @returns {string} - Connection level or 'Stranger' default
   */
  getConnection(pcId, npcId) {
    const data = this.getVibeData();
    const connection = data.connections[pcId]?.[npcId];
    return connection?.level || 'Stranger';
  }

  /**
   * Get all vibes for a PC
   * @param {string} pcId - PC stable ID
   * @returns {Object} - Object with NPC IDs as keys and vibe data as values
   */
  getPCVibes(pcId) {
    const data = this.getVibeData();
    return data.pcVibes[pcId] || {};
  }

  /**
   * Get all vibes for an NPC
   * @param {string} npcId - NPC stable ID
   * @returns {Object} - Object with PC IDs as keys and vibe data as values
   */
  getNPCVibes(npcId) {
    const data = this.getVibeData();
    return data.npcVibes[npcId] || {};
  }

  /**
   * Get all connections for a PC
   * @param {string} pcId - PC stable ID
   * @returns {Object} - Object with NPC IDs as keys and connection data as values
   */
  getPCConnections(pcId) {
    const data = this.getVibeData();
    return data.connections[pcId] || {};
  }

  /**
   * Get all vibes in the world (GM view)
   * @returns {Object} - Complete vibe data structure
   */
  getAllVibes() {
    const data = this.getVibeData();
    return {
      pcVibes: data.pcVibes,
      npcVibes: data.npcVibes,
      connections: data.connections,
      npcRegistry: data.npcRegistry
    };
  }

  /**
   * Clean up orphaned data (NPCs/PCs that no longer exist)
   */
  async cleanupOrphanedData() {
    const data = this.getVibeData();
    let hasChanges = false;
    
    // Get all current actor UUIDs
    const currentActorUuids = new Set(game.actors.map(actor => actor.uuid));
    
    // Clean up NPC registry
    for (const npcUuid of Object.keys(data.npcRegistry)) {
      if (!currentActorUuids.has(npcUuid)) {
        delete data.npcRegistry[npcUuid];
        hasChanges = true;
      }
    }
    
    // Clean up PC vibes
    for (const pcUuid of Object.keys(data.pcVibes)) {
      if (!currentActorUuids.has(pcUuid)) {
        delete data.pcVibes[pcUuid];
        hasChanges = true;
      } else {
        // Clean up vibes towards non-existent NPCs
        for (const npcUuid of Object.keys(data.pcVibes[pcUuid])) {
          if (!currentActorUuids.has(npcUuid)) {
            delete data.pcVibes[pcUuid][npcUuid];
            hasChanges = true;
          }
        }
      }
    }
    
    // Clean up NPC vibes
    for (const npcUuid of Object.keys(data.npcVibes)) {
      if (!currentActorUuids.has(npcUuid)) {
        delete data.npcVibes[npcUuid];
        hasChanges = true;
      } else {
        // Clean up vibes towards non-existent PCs
        for (const pcUuid of Object.keys(data.npcVibes[npcUuid])) {
          if (!currentActorUuids.has(pcUuid)) {
            delete data.npcVibes[npcUuid][pcUuid];
            hasChanges = true;
          }
        }
      }
    }
    
    // Clean up connections
    for (const pcUuid of Object.keys(data.connections)) {
      if (!currentActorUuids.has(pcUuid)) {
        delete data.connections[pcUuid];
        hasChanges = true;
      } else {
        // Clean up connections to non-existent NPCs
        for (const npcUuid of Object.keys(data.connections[pcUuid])) {
          if (!currentActorUuids.has(npcUuid)) {
            delete data.connections[pcUuid][npcUuid];
            hasChanges = true;
          }
        }
      }
    }
    
    if (hasChanges) {
      await this.saveVibeData(data);
      console.log('PF2E NPC Vibes | Cleaned up orphaned data');
    }
  }

  /**
   * Export vibe data for backup
   * @returns {string} - JSON string of vibe data
   */
  exportData() {
    const data = this.getVibeData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import vibe data from backup
   * @param {string} jsonData - JSON string of vibe data
   */
  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.pcVibes || !data.npcVibes || !data.connections || !data.npcRegistry) {
        throw new Error('Invalid data structure');
      }
      
      await this.saveVibeData(data);
      ui.notifications.info('Vibe data imported successfully');
      
    } catch (error) {
      console.error('PF2E NPC Vibes | Failed to import data:', error);
      ui.notifications.error('Failed to import vibe data: ' + error.message);
    }
  }

  /**
   * Reset all vibe data (GM only)
   * @returns {Promise<void>}
   */
  async resetAllData() {
    if (!game.user.isGM) {
      throw new Error('Only GMs can reset vibe data');
    }

    console.log('🎭 PF2E NPC Vibes | Resetting all vibe data...');

    // Create empty data structure
    const emptyData = {
      pcVibes: {},
      npcVibes: {},
      connections: {},
      metadata: {
        version: '1.0.9',
        lastUpdated: Date.now(),
        totalVibes: 0
      }
    };

    // Save the empty data
    await game.settings.set(this.moduleId, 'vibeData', emptyData);

    // Clear the cache
    this.dataCache = null;

    console.log('🎭 PF2E NPC Vibes | All vibe data has been reset');
  }
}
