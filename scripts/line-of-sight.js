/**
 * Line of Sight Detection System
 * Handles detection of when PCs can see NPCs and vice versa
 */

import { MODULE_ID } from './main.js';

export class LineOfSightDetector {
  constructor() {
    this.moduleId = MODULE_ID;
    this.sightCache = new Map(); // Cache for sight calculations
    this.lastSightCheck = new Map(); // Track when we last checked sight for token pairs
    this.sightCheckInterval = 1000; // Minimum time between sight checks (ms)
  }

  /**
   * Check if a PC token can see an NPC token
   * @param {Token} pcToken - The PC token
   * @param {Token} npcToken - The NPC token
   * @returns {boolean} - True if PC can see NPC
   */
  canPCSeeNPC(pcToken, npcToken) {
    if (!this.isValidTokenPair(pcToken, npcToken)) return false;
    
    // Check cache first
    const cacheKey = `${pcToken.id}->${npcToken.id}`;
    const lastCheck = this.lastSightCheck.get(cacheKey);
    const now = Date.now();
    
    if (lastCheck && (now - lastCheck) < this.sightCheckInterval) {
      return this.sightCache.get(cacheKey) || false;
    }
    
    const canSee = this.performSightCheck(pcToken, npcToken);
    
    // Update cache
    this.sightCache.set(cacheKey, canSee);
    this.lastSightCheck.set(cacheKey, now);
    
    return canSee;
  }

  /**
   * Check if an NPC token can see a PC token
   * @param {Token} npcToken - The NPC token
   * @param {Token} pcToken - The PC token
   * @returns {boolean} - True if NPC can see PC
   */
  canNPCSeePC(npcToken, pcToken) {
    if (!this.isValidTokenPair(npcToken, pcToken)) return false;
    
    // Check cache first
    const cacheKey = `${npcToken.id}->${pcToken.id}`;
    const lastCheck = this.lastSightCheck.get(cacheKey);
    const now = Date.now();
    
    if (lastCheck && (now - lastCheck) < this.sightCheckInterval) {
      return this.sightCache.get(cacheKey) || false;
    }
    
    const canSee = this.performSightCheck(npcToken, pcToken);
    
    // Update cache
    this.sightCache.set(cacheKey, canSee);
    this.lastSightCheck.set(cacheKey, now);
    
    return canSee;
  }

  /**
   * Perform the actual sight check between two tokens
   * @param {Token} sourceToken - The token doing the seeing
   * @param {Token} targetToken - The token being seen
   * @returns {boolean} - True if source can see target
   */
  performSightCheck(sourceToken, targetToken) {
    try {
      console.log(`🔍 PF2E NPC Vibes | Sight check: ${sourceToken.name} -> ${targetToken.name}`);

      // Basic visibility checks
      if (!this.areTokensOnSameScene(sourceToken, targetToken)) {
        console.log(`🔍 PF2E NPC Vibes | Different scenes - ${sourceToken.name}: ${sourceToken.scene?.id}, ${targetToken.name}: ${targetToken.scene?.id}`);
        return false;
      }

      // Check if target is hidden from the source
      if (targetToken.document.hidden) {
        console.log(`🔍 PF2E NPC Vibes | Target ${targetToken.name} is hidden`);
        return false;
      }

      // Check if source can actually see (has vision enabled)
      if (!sourceToken.document.sight?.enabled) {
        console.log(`🔍 PF2E NPC Vibes | Source ${sourceToken.name} has no vision enabled`);
        return false;
      }

      // Check if tokens are within sight range
      const withinRange = this.isWithinSightRange(sourceToken, targetToken);
      if (!withinRange) {
        const distance = this.getTokenDistance(sourceToken, targetToken);
        const sightRange = this.getTokenSightRange(sourceToken);
        console.log(`🔍 PF2E NPC Vibes | Out of range - Distance: ${distance}, Range: ${sightRange}`);
        return false;
      }

      // Check for line of sight using Foundry's vision system
      const hasLOS = this.hasLineOfSight(sourceToken, targetToken);
      console.log(`🔍 PF2E NPC Vibes | Line of sight result: ${hasLOS}`);
      return hasLOS;

    } catch (error) {
      console.warn('🔍 PF2E NPC Vibes | Error in sight check:', error);
      return false;
    }
  }

  /**
   * Check if two tokens are on the same scene
   */
  areTokensOnSameScene(token1, token2) {
    return token1.scene?.id === token2.scene?.id;
  }

  /**
   * Check if target token is within sight range of source token
   */
  isWithinSightRange(sourceToken, targetToken) {
    const distance = this.getTokenDistance(sourceToken, targetToken);
    const sightRange = this.getTokenSightRange(sourceToken);
    
    // If no sight range limit, assume infinite sight
    if (sightRange === null || sightRange === undefined) return true;
    
    return distance <= sightRange;
  }

  /**
   * Get the sight range for a token
   */
  getTokenSightRange(token) {
    try {
      // Get the token's sight range from its vision settings
      const visionRange = token.document.sight?.range;
      if (visionRange && visionRange > 0) {
        console.log(`🔍 PF2E NPC Vibes | ${token.name} vision range from token: ${visionRange}`);
        return visionRange;
      }

      // Fallback to actor's vision if available
      const actor = token.actor;
      if (actor) {
        // For PF2E, check for darkvision or other vision types
        const senses = actor.system?.attributes?.senses;
        if (senses) {
          // Check for darkvision, low-light vision, etc.
          if (senses.darkvision?.value > 0) {
            const range = senses.darkvision.value * canvas.dimensions.distance;
            console.log(`🔍 PF2E NPC Vibes | ${token.name} darkvision range: ${range} (${senses.darkvision.value} feet)`);
            return range;
          }
          if (senses.lowLightVision?.value > 0) {
            const range = senses.lowLightVision.value * canvas.dimensions.distance;
            console.log(`🔍 PF2E NPC Vibes | ${token.name} low-light vision range: ${range} (${senses.lowLightVision.value} feet)`);
            return range;
          }
        }
      }

      // Default sight range from settings
      const defaultFeet = game.settings.get(MODULE_ID, 'defaultSightRange');
      const defaultRange = (defaultFeet / canvas.dimensions.distance) * canvas.dimensions.size;
      console.log(`🔍 PF2E NPC Vibes | ${token.name} using default sight range: ${defaultRange} pixels (${defaultFeet} feet)`);
      return defaultRange;

    } catch (error) {
      console.warn('PF2E NPC Vibes | Error getting sight range:', error);
      return canvas.dimensions.distance * 24; // Fallback to 120 feet
    }
  }

  /**
   * Calculate distance between two tokens
   */
  getTokenDistance(token1, token2) {
    // Use token centers for more accurate distance calculation
    const center1 = token1.center;
    const center2 = token2.center;
    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);

    console.log(`🔍 PF2E NPC Vibes | Distance between ${token1.name} and ${token2.name}: ${pixelDistance} pixels`);
    return pixelDistance;
  }

  /**
   * Check for actual line of sight using Foundry's vision system
   */
  hasLineOfSight(sourceToken, targetToken) {
    try {
      // Use Foundry's built-in line of sight detection
      const sourceCenter = sourceToken.center;
      const targetCenter = targetToken.center;

      console.log(`🔍 PF2E NPC Vibes | Checking LOS from (${sourceCenter.x}, ${sourceCenter.y}) to (${targetCenter.x}, ${targetCenter.y})`);

      // Check if there's a clear line of sight
      const ray = new Ray(sourceCenter, targetCenter);

      // Test against walls and other obstacles
      const collision = canvas.walls.checkCollision(ray, { type: 'sight' });

      console.log(`🔍 PF2E NPC Vibes | Wall collision detected: ${!!collision}`);

      const hasLOS = !collision;

      // Additional check: use Foundry's vision system if available
      if (hasLOS && canvas.effects?.visibility) {
        try {
          // Check if target is visible from source position
          const visibility = canvas.effects.visibility;
          const sourceVision = sourceToken.vision;

          if (sourceVision && visibility.testVisibility) {
            const isVisible = visibility.testVisibility(targetCenter, { object: sourceToken });
            console.log(`🔍 PF2E NPC Vibes | Foundry visibility test: ${isVisible}`);
            return isVisible;
          }
        } catch (visError) {
          console.warn('🔍 PF2E NPC Vibes | Visibility test failed, using wall collision result:', visError);
        }
      }

      return hasLOS;

    } catch (error) {
      console.warn('🔍 PF2E NPC Vibes | Error checking line of sight:', error);

      // Fallback: simple distance check
      const distance = this.getTokenDistance(sourceToken, targetToken);
      const maxDistance = canvas.dimensions.distance * 6; // 30 feet fallback
      const fallbackResult = distance <= maxDistance;
      console.log(`🔍 PF2E NPC Vibes | Using fallback LOS check: ${fallbackResult} (distance: ${distance}, max: ${maxDistance})`);
      return fallbackResult;
    }
  }

  /**
   * Validate that two tokens are suitable for sight checking
   */
  isValidTokenPair(token1, token2) {
    if (!token1 || !token2) return false;
    if (!token1.actor || !token2.actor) return false;
    if (token1.id === token2.id) return false;
    
    // Ensure we have one PC and one NPC
    const token1Type = token1.actor.type;
    const token2Type = token2.actor.type;
    
    return (token1Type === 'character' && token2Type === 'npc') ||
           (token1Type === 'npc' && token2Type === 'character');
  }

  /**
   * Get all PC-NPC pairs that can see each other
   */
  getAllVisiblePairs() {
    const pairs = [];
    const pcTokens = canvas.tokens.placeables.filter(t => 
      t.actor && t.actor.type === 'character'
    );
    const npcTokens = canvas.tokens.placeables.filter(t => 
      t.actor && t.actor.type === 'npc'
    );

    for (const pcToken of pcTokens) {
      for (const npcToken of npcTokens) {
        const pcCanSeeNpc = this.canPCSeeNPC(pcToken, npcToken);
        const npcCanSeePc = this.canNPCSeePC(npcToken, pcToken);
        
        if (pcCanSeeNpc || npcCanSeePc) {
          pairs.push({
            pcToken,
            npcToken,
            pcCanSeeNpc,
            npcCanSeePc
          });
        }
      }
    }

    return pairs;
  }

  /**
   * Clear the sight cache
   */
  clearCache() {
    this.sightCache.clear();
    this.lastSightCheck.clear();
  }

  /**
   * Clear cache entries for a specific token
   */
  clearTokenCache(tokenId) {
    const keysToDelete = [];
    
    for (const key of this.sightCache.keys()) {
      if (key.includes(tokenId)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.sightCache.delete(key);
      this.lastSightCheck.delete(key);
    }
  }
}
