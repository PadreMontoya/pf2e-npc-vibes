/**
 * Connection Level Manager
 * Handles PF2E Connection levels between PCs and NPCs
 * Based on official PF2E rules: https://2e.aonprd.com/Rules.aspx?ID=3397
 */

import { MODULE_ID } from './main.js';

export class ConnectionManager {
  constructor() {
    this.moduleId = MODULE_ID;
    
    // Connection levels from PF2E rules
    this.CONNECTION_LEVELS = {
      STRANGER: {
        value: 'Stranger',
        label: 'Stranger',
        description: 'You have no meaningful relationship with this character.',
        mechanicalEffects: []
      },
      ACQUAINTANCE: {
        value: 'Acquaintance',
        label: 'Acquaintance',
        description: 'You know this character casually, such as a shopkeeper you buy from regularly.',
        mechanicalEffects: [
          'Can attempt to Gather Information about them',
          'They might provide basic assistance if asked politely'
        ]
      },
      FRIEND: {
        value: 'Friend',
        label: 'Friend',
        description: 'You have a genuine friendship with this character.',
        mechanicalEffects: [
          'Will provide reasonable assistance when asked',
          'Might offer information or aid without being asked',
          'Generally trustworthy and reliable'
        ]
      },
      BEST_FRIEND: {
        value: 'BestFriend',
        label: 'Best Friend',
        description: 'This character is one of your closest companions.',
        mechanicalEffects: [
          'Will go out of their way to help you',
          'Shares important information freely',
          'Might take risks on your behalf',
          'Provides emotional support and counsel'
        ]
      }
    };

    // Connection progression requirements
    this.PROGRESSION_REQUIREMENTS = {
      'Stranger': {
        to: 'Acquaintance',
        requirements: [
          'Have at least one meaningful interaction',
          'Exchange names or basic information',
          'No hostile actions taken'
        ]
      },
      'Acquaintance': {
        to: 'Friend',
        requirements: [
          'Multiple positive interactions',
          'Provide assistance or do a favor',
          'Share personal information or experiences',
          'Demonstrate trustworthiness'
        ]
      },
      'Friend': {
        to: 'BestFriend',
        requirements: [
          'Significant shared experiences',
          'Mutual trust and respect established',
          'Provide major assistance or make sacrifices',
          'Deep personal connection formed'
        ]
      }
    };
  }

  /**
   * Get all available connection levels
   * @returns {Array} - Array of connection level objects
   */
  getConnectionLevels() {
    return Object.values(this.CONNECTION_LEVELS);
  }

  /**
   * Get a specific connection level by value
   * @param {string} value - The connection level value
   * @returns {Object|null} - Connection level object or null
   */
  getConnectionLevel(value) {
    return Object.values(this.CONNECTION_LEVELS).find(level => level.value === value) || null;
  }

  /**
   * Get the localized label for a connection level
   * @param {string} value - The connection level value
   * @returns {string} - Localized label
   */
  getConnectionLabel(value) {
    const key = `PF2E_NPC_VIBES.Connections.${value}`;
    return game.i18n.localize(key);
  }

  /**
   * Check if a connection level progression is valid
   * @param {string} currentLevel - Current connection level
   * @param {string} newLevel - Proposed new connection level
   * @returns {boolean} - True if progression is valid
   */
  isValidProgression(currentLevel, newLevel) {
    const levels = ['Stranger', 'Acquaintance', 'Friend', 'BestFriend'];
    const currentIndex = levels.indexOf(currentLevel);
    const newIndex = levels.indexOf(newLevel);
    
    // Can always stay at same level or go backwards
    if (newIndex <= currentIndex) return true;
    
    // Can only progress one level at a time
    return newIndex === currentIndex + 1;
  }

  /**
   * Get progression requirements for moving to the next level
   * @param {string} currentLevel - Current connection level
   * @returns {Object|null} - Progression requirements or null if at max level
   */
  getProgressionRequirements(currentLevel) {
    return this.PROGRESSION_REQUIREMENTS[currentLevel] || null;
  }

  /**
   * Get mechanical effects for a connection level
   * @param {string} connectionLevel - The connection level
   * @returns {Array} - Array of mechanical effect descriptions
   */
  getMechanicalEffects(connectionLevel) {
    const level = this.getConnectionLevel(connectionLevel);
    return level ? level.mechanicalEffects : [];
  }

  /**
   * Suggest connection level based on vibe and interactions
   * @param {string} vibeType - The vibe type
   * @param {number} interactionCount - Number of interactions
   * @param {string} currentLevel - Current connection level
   * @returns {string} - Suggested connection level
   */
  suggestConnectionLevel(vibeType, interactionCount = 0, currentLevel = 'Stranger') {
    // Base suggestion on vibe type
    let suggestedLevel = currentLevel;
    
    switch (vibeType) {
      case 'awestruck':
        // Awestruck vibes might lead to faster friendship
        if (interactionCount >= 3 && currentLevel === 'Stranger') {
          suggestedLevel = 'Acquaintance';
        } else if (interactionCount >= 5 && currentLevel === 'Acquaintance') {
          suggestedLevel = 'Friend';
        }
        break;
        
      case 'curious':
        // Curious vibes lead to natural progression
        if (interactionCount >= 2 && currentLevel === 'Stranger') {
          suggestedLevel = 'Acquaintance';
        } else if (interactionCount >= 4 && currentLevel === 'Acquaintance') {
          suggestedLevel = 'Friend';
        }
        break;
        
      case 'repulsed':
        // Repulsed vibes make progression harder
        if (interactionCount >= 5 && currentLevel === 'Stranger') {
          suggestedLevel = 'Acquaintance';
        }
        // Harder to become friends with repulsed vibe
        break;
        
      default:
        // No vibe - standard progression
        if (interactionCount >= 3 && currentLevel === 'Stranger') {
          suggestedLevel = 'Acquaintance';
        } else if (interactionCount >= 6 && currentLevel === 'Acquaintance') {
          suggestedLevel = 'Friend';
        }
        break;
    }
    
    // Ensure valid progression
    if (!this.isValidProgression(currentLevel, suggestedLevel)) {
      return currentLevel;
    }
    
    return suggestedLevel;
  }

  /**
   * Get connection advice based on vibe and current level
   * @param {string} vibeType - The vibe type
   * @param {string} connectionLevel - Current connection level
   * @returns {string} - Advice text
   */
  getConnectionAdvice(vibeType, connectionLevel) {
    const advice = [];
    
    // Base advice on vibe type
    switch (vibeType) {
      case 'awestruck':
        advice.push('This character inspires you. Building a connection could lead to mentorship or deep friendship.');
        if (connectionLevel === 'Stranger') {
          advice.push('Try to engage them in conversation about their impressive qualities.');
        }
        break;
        
      case 'curious':
        advice.push('Your curiosity about this character creates natural opportunities for connection.');
        if (connectionLevel === 'Stranger') {
          advice.push('Ask questions and show genuine interest in their background or expertise.');
        }
        break;
        
      case 'repulsed':
        advice.push('Despite your initial negative reaction, relationships can change over time.');
        advice.push('Try to understand what caused your repulsion and whether it can be overcome.');
        if (connectionLevel === 'Stranger') {
          advice.push('Small positive interactions might help overcome your initial impression.');
        }
        break;
        
      default:
        advice.push('No strong initial impression means you can build this relationship naturally.');
        break;
    }
    
    // Add level-specific advice
    const progression = this.getProgressionRequirements(connectionLevel);
    if (progression) {
      advice.push(`To become ${progression.to.toLowerCase()}s, consider: ${progression.requirements.join(', ')}.`);
    }
    
    return advice.join(' ');
  }

  /**
   * Track an interaction between PC and NPC
   * @param {string} pcUuid - PC UUID
   * @param {string} npcUuid - NPC UUID
   * @param {string} interactionType - Type of interaction
   * @param {string} description - Description of interaction
   */
  async trackInteraction(pcUuid, npcUuid, interactionType, description) {
    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    if (!dataManager) return;

    const data = dataManager.getVibeData();
    
    // Initialize interaction tracking if not exists
    if (!data.interactions) {
      data.interactions = {};
    }
    
    const pairKey = `${pcUuid}-${npcUuid}`;
    if (!data.interactions[pairKey]) {
      data.interactions[pairKey] = [];
    }
    
    // Add interaction
    data.interactions[pairKey].push({
      type: interactionType,
      description,
      timestamp: Date.now()
    });
    
    await dataManager.saveVibeData(data);
    
    // Check if connection level should be suggested for update
    const currentConnection = dataManager.getConnection(pcUuid, npcUuid);
    const vibeData = dataManager.getVibe(pcUuid, npcUuid, 'pc');
    const vibeType = vibeData?.vibe || 'none';
    const interactionCount = data.interactions[pairKey].length;
    
    const suggestedLevel = this.suggestConnectionLevel(vibeType, interactionCount, currentConnection);
    
    if (suggestedLevel !== currentConnection) {
      // Send suggestion to GM
      const messagingSystem = game.modules.get(this.moduleId)?.vibeManager?.messagingSystem;
      if (messagingSystem && game.user.isGM) {
        const pcActor = game.actors.find(a => a.uuid === pcUuid);
        const npcActor = game.actors.find(a => a.uuid === npcUuid);
        
        if (pcActor && npcActor) {
          await messagingSystem.sendDebugMessage(
            `Connection suggestion: ${pcActor.name} and ${npcActor.name} could progress from ${currentConnection} to ${suggestedLevel}`,
            { interactionCount, vibeType, interactionType, description }
          );
        }
      }
    }
  }

  /**
   * Get interaction history for a PC-NPC pair
   * @param {string} pcUuid - PC UUID
   * @param {string} npcUuid - NPC UUID
   * @returns {Array} - Array of interactions
   */
  getInteractionHistory(pcUuid, npcUuid) {
    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    if (!dataManager) return [];

    const data = dataManager.getVibeData();
    const pairKey = `${pcUuid}-${npcUuid}`;
    
    return data.interactions?.[pairKey] || [];
  }

  /**
   * Export connection data for external tools
   * @returns {Object} - Connection data export
   */
  exportConnectionData() {
    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    if (!dataManager) return {};

    const allData = dataManager.getAllVibes();
    const export_data = {
      connections: allData.connections,
      interactions: allData.interactions || {},
      connectionLevels: this.CONNECTION_LEVELS,
      progressionRequirements: this.PROGRESSION_REQUIREMENTS,
      exportDate: new Date().toISOString()
    };

    return export_data;
  }
}
