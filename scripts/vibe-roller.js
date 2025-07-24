/**
 * Vibe Roll System
 * Handles the rolling and determination of vibes between characters
 */

import { MODULE_ID } from './main.js';

export class VibeRoller {
  constructor() {
    this.moduleId = MODULE_ID;
    
    // Vibe thresholds
    this.VIBE_THRESHOLDS = {
      REPULSED: [1],
      CURIOUS: [18, 19],
      AWESTRUCK: [20]
    };
    
    // Vibe types
    this.VIBE_TYPES = {
      NONE: 'none',
      REPULSED: 'repulsed',
      CURIOUS: 'curious',
      AWESTRUCK: 'awestruck'
    };
    
    // Vibe colors for visual effects
    this.VIBE_COLORS = {
      [this.VIBE_TYPES.REPULSED]: '#ff4444',
      [this.VIBE_TYPES.CURIOUS]: '#ffdd44',
      [this.VIBE_TYPES.AWESTRUCK]: '#44ff44'
    };
  }

  /**
   * Roll a vibe between a PC and NPC
   * @param {Token} pcToken - The PC token
   * @param {Token} npcToken - The NPC token
   * @returns {Object} - Vibe roll results for both directions
   */
  async rollVibes(pcToken, npcToken) {
    if (!this.isValidTokenPair(pcToken, npcToken)) {
      throw new Error('Invalid token pair for vibe rolling');
    }

    const results = {
      pcToNpc: await this.rollSingleVibe(pcToken, npcToken, 'pc'),
      npcToPc: await this.rollSingleVibe(npcToken, pcToken, 'npc')
    };

    console.log(`PF2E NPC Vibes | Rolled vibes between ${pcToken.name} and ${npcToken.name}:`, results);
    
    return results;
  }

  /**
   * Roll a single vibe from source to target
   * @param {Token} sourceToken - The token feeling the vibe
   * @param {Token} targetToken - The token being vibed towards
   * @param {string} sourceType - 'pc' or 'npc'
   * @returns {Object} - Single vibe roll result
   */
  async rollSingleVibe(sourceToken, targetToken, sourceType) {
    // Generate random number 1-20 using Math.random()
    const rollValue = Math.floor(Math.random() * 20) + 1;

    // Determine vibe type
    const vibeType = this.determineVibeType(rollValue);

    const result = {
      sourceToken,
      targetToken,
      sourceType,
      roll: rollValue,
      vibeType,
      hasVibe: vibeType !== this.VIBE_TYPES.NONE,
      rollObject: null // No Foundry roll object needed
    };

    // Add flavor text
    result.flavorText = this.getVibeFlavorText(result);

    return result;
  }

  /**
   * Determine vibe type based on roll value
   * @param {number} rollValue - The d20 roll result
   * @returns {string} - The vibe type
   */
  determineVibeType(rollValue) {
    if (this.VIBE_THRESHOLDS.REPULSED.includes(rollValue)) {
      return this.VIBE_TYPES.REPULSED;
    }
    
    if (this.VIBE_THRESHOLDS.CURIOUS.includes(rollValue)) {
      return this.VIBE_TYPES.CURIOUS;
    }
    
    if (this.VIBE_THRESHOLDS.AWESTRUCK.includes(rollValue)) {
      return this.VIBE_TYPES.AWESTRUCK;
    }
    
    return this.VIBE_TYPES.NONE;
  }

  /**
   * Get flavor text for a vibe roll
   * @param {Object} vibeResult - The vibe roll result
   * @returns {string} - Flavor text describing the vibe
   */
  getVibeFlavorText(vibeResult) {
    const { sourceToken, targetToken, vibeType, roll } = vibeResult;
    const sourceName = sourceToken.name;
    const targetName = targetToken.name;
    
    switch (vibeType) {
      case this.VIBE_TYPES.REPULSED:
        return `${sourceName} feels an immediate sense of repulsion towards ${targetName}. Something about them just rubs the wrong way. (Rolled ${roll})`;
        
      case this.VIBE_TYPES.CURIOUS:
        return `${sourceName} finds themselves intrigued by ${targetName}. There's something compelling about them that draws attention. (Rolled ${roll})`;
        
      case this.VIBE_TYPES.AWESTRUCK:
        return `${sourceName} is struck with awe upon seeing ${targetName}. Their presence is truly impressive and inspiring. (Rolled ${roll})`;
        
      default:
        return `${sourceName} notices ${targetName} but feels no particular emotional reaction. (Rolled ${roll})`;
    }
  }

  /**
   * Get the localized name for a vibe type
   * @param {string} vibeType - The vibe type
   * @returns {string} - Localized vibe name
   */
  getVibeDisplayName(vibeType) {
    const key = `PF2E_NPC_VIBES.Vibes.${vibeType.charAt(0).toUpperCase() + vibeType.slice(1)}`;
    return game.i18n.localize(key);
  }

  /**
   * Get the color associated with a vibe type
   * @param {string} vibeType - The vibe type
   * @returns {string} - Hex color code
   */
  getVibeColor(vibeType) {
    return this.VIBE_COLORS[vibeType] || '#ffffff';
  }

  /**
   * Check if a vibe type is significant (should trigger notifications)
   * @param {string} vibeType - The vibe type
   * @returns {boolean} - True if vibe is significant
   */
  isSignificantVibe(vibeType) {
    return vibeType !== this.VIBE_TYPES.NONE;
  }

  /**
   * Validate token pair for vibe rolling
   * @param {Token} token1 - First token
   * @param {Token} token2 - Second token
   * @returns {boolean} - True if valid pair
   */
  isValidTokenPair(token1, token2) {
    if (!token1 || !token2) return false;
    if (!token1.actor || !token2.actor) return false;
    if (token1.id === token2.id) return false;
    
    const type1 = token1.actor.type;
    const type2 = token2.actor.type;
    
    // Must be one PC and one NPC
    return (type1 === 'character' && type2 === 'npc') ||
           (type1 === 'npc' && type2 === 'character');
  }

  /**
   * Create a custom roll for vibe generation (for future enhancement)
   * @param {Object} options - Roll options
   * @returns {Roll} - Configured roll object
   */
  createVibeRoll(options = {}) {
    const formula = options.formula || '1d20';
    const data = options.data || {};
    
    return new Roll(formula, data);
  }

  /**
   * Get all possible vibe types
   * @returns {Array} - Array of vibe type objects
   */
  getAllVibeTypes() {
    return Object.values(this.VIBE_TYPES).map(type => ({
      type,
      name: this.getVibeDisplayName(type),
      color: this.getVibeColor(type),
      isSignificant: this.isSignificantVibe(type)
    }));
  }

  /**
   * Get vibe statistics for debugging/analysis
   * @param {Array} rolls - Array of roll values
   * @returns {Object} - Statistics about vibe distribution
   */
  getVibeStatistics(rolls) {
    const stats = {
      total: rolls.length,
      repulsed: 0,
      curious: 0,
      awestruck: 0,
      none: 0
    };

    for (const roll of rolls) {
      const vibeType = this.determineVibeType(roll);
      switch (vibeType) {
        case this.VIBE_TYPES.REPULSED:
          stats.repulsed++;
          break;
        case this.VIBE_TYPES.CURIOUS:
          stats.curious++;
          break;
        case this.VIBE_TYPES.AWESTRUCK:
          stats.awestruck++;
          break;
        default:
          stats.none++;
          break;
      }
    }

    // Calculate percentages
    if (stats.total > 0) {
      stats.repulsedPercent = (stats.repulsed / stats.total * 100).toFixed(1);
      stats.curiousPercent = (stats.curious / stats.total * 100).toFixed(1);
      stats.awestruckPercent = (stats.awestruck / stats.total * 100).toFixed(1);
      stats.nonePercent = (stats.none / stats.total * 100).toFixed(1);
    }

    return stats;
  }
}
