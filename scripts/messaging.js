/**
 * Messaging System
 * Handles whispered notifications for vibe rolls and events
 */

import { MODULE_ID } from './main.js';

export class MessagingSystem {
  constructor() {
    this.moduleId = MODULE_ID;
  }

  /**
   * Send a vibe notification message
   * @param {Object} vibeResult - The vibe roll result
   */
  async sendVibeNotification(vibeResult) {
    if (!game.settings.get(this.moduleId, 'enableNotifications')) {
      return;
    }

    const { sourceToken, targetToken, sourceType, vibeType, flavorText, rollObject } = vibeResult;

    // Check if we should only show significant vibes
    const onlySignificantVibes = game.settings.get(this.moduleId, 'onlySignificantVibes');

    if (onlySignificantVibes && vibeType === 'none') {
      console.log(`🎭 PF2E NPC Vibes | Skipping 'none' vibe notification (only significant vibes enabled)`);
      return;
    }

    // If not filtering and we have a 'none' result, we could show it, but for now skip it
    // This gives us the option to show 'none' results in the future if desired
    if (vibeType === 'none') {
      console.log(`🎭 PF2E NPC Vibes | Skipping 'none' vibe notification`);
      return;
    }

    // Determine recipients based on source type
    const recipients = this.getNotificationRecipients(sourceToken, sourceType);
    
    if (recipients.length === 0) return;

    // Create the message content
    const messageContent = this.createVibeMessageContent(vibeResult);
    
    // Send the whispered message (no roll object needed with Math.random)
    await this.sendWhisperedMessage(messageContent, recipients);
  }

  /**
   * Get the appropriate recipients for a vibe notification
   * @param {Token} sourceToken - The token that rolled the vibe
   * @param {string} sourceType - 'pc' or 'npc'
   * @returns {Array} - Array of user IDs to send the message to
   */
  getNotificationRecipients(sourceToken, sourceType) {
    const recipients = [];

    // Only send vibe notifications to GM for better immersion
    const gmUsers = game.users.filter(user => user.isGM && user.active);
    recipients.push(...gmUsers.map(user => user.id));

    // Note: Removed player notifications to keep vibes GM-only
    // Players can see their vibes in the Vibe Book interface

    return recipients;
  }

  /**
   * Get the owners of a token
   * @param {Token} token - The token
   * @returns {Array} - Array of user IDs who own the token
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
   * Create the message content for a vibe notification
   * @param {Object} vibeResult - The vibe roll result
   * @returns {string} - HTML message content
   */
  createVibeMessageContent(vibeResult) {
    const { sourceToken, targetToken, sourceType, vibeType, flavorText, roll } = vibeResult;

    const vibeDisplayName = this.getVibeDisplayName(vibeType);
    const vibeColor = this.getVibeColor(vibeType);

    const messageHtml = `
      <div class="pf2e-npc-vibes-message" style="border-left: 4px solid ${vibeColor}; padding-left: 10px; margin: 5px 0;">
        <h3 style="color: ${vibeColor}; margin: 0 0 5px 0;">
          <i class="fas fa-heart"></i> ${vibeDisplayName} Vibe
        </h3>
        <p><strong>${sourceToken.name}</strong> feels <strong style="color: ${vibeColor};">${vibeDisplayName.toLowerCase()}</strong> towards <strong>${targetToken.name}</strong></p>
        <p style="font-style: italic; color: #666;">${flavorText}</p>
        <p style="font-size: 12px; color: #999;">(Rolled ${roll})</p>
      </div>
    `;

    return messageHtml;
  }

  /**
   * Send a whispered message to specific recipients
   * @param {string} content - HTML content of the message
   * @param {Array} recipients - Array of user IDs
   */
  async sendWhisperedMessage(content, recipients) {
    const messageData = {
      content: content,
      whisper: recipients,
      type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
      flags: {
        [this.moduleId]: {
          isVibeMessage: true
        }
      }
    };

    // No dice sounds or roll objects with Math.random approach

    try {
      await ChatMessage.create(messageData);
    } catch (error) {
      console.error('PF2E NPC Vibes | Failed to send whispered message:', error);
    }
  }



  /**
   * Send a connection level update notification
   * @param {string} pcName - PC name
   * @param {string} npcName - NPC name
   * @param {string} oldLevel - Previous connection level
   * @param {string} newLevel - New connection level
   * @param {string} userId - User who made the change
   */
  async sendConnectionUpdateNotification(pcName, npcName, oldLevel, newLevel, userId) {
    if (!game.settings.get(this.moduleId, 'enableNotifications')) {
      return;
    }

    // Send to GM and the user who made the change
    const gmUsers = game.users.filter(user => user.isGM && user.active);
    const recipients = [...gmUsers.map(user => user.id), userId];

    const content = `
      <div class="pf2e-npc-vibes-message" style="border-left: 4px solid #9b59b6; padding-left: 10px; margin: 5px 0;">
        <h3 style="color: #9b59b6; margin: 0 0 5px 0;">
          <i class="fas fa-link"></i> Connection Updated
        </h3>
        <p>Connection between <strong>${pcName}</strong> and <strong>${npcName}</strong> changed from <strong>${oldLevel}</strong> to <strong>${newLevel}</strong></p>
      </div>
    `;

    await this.sendWhisperedMessage(content, [...new Set(recipients)]);
  }

  /**
   * Get the display name for a vibe type
   * @param {string} vibeType - The vibe type
   * @returns {string} - Display name
   */
  getVibeDisplayName(vibeType) {
    const key = `PF2E_NPC_VIBES.Vibes.${vibeType.charAt(0).toUpperCase() + vibeType.slice(1)}`;
    return game.i18n.localize(key);
  }

  /**
   * Get the color for a vibe type
   * @param {string} vibeType - The vibe type
   * @returns {string} - Hex color
   */
  getVibeColor(vibeType) {
    const colors = {
      'repulsed': '#ff4444',
      'curious': '#ffdd44',
      'awestruck': '#44ff44'
    };
    return colors[vibeType] || '#ffffff';
  }

  /**
   * Send a debug message (only to GM)
   * @param {string} message - Debug message
   * @param {Object} data - Optional data to include
   */
  async sendDebugMessage(message, data = null) {
    if (!game.user.isGM) return;

    let content = `
      <div class="pf2e-npc-vibes-message" style="border-left: 4px solid #e74c3c; padding-left: 10px; margin: 5px 0;">
        <h3 style="color: #e74c3c; margin: 0 0 5px 0;">
          <i class="fas fa-bug"></i> PF2E NPC Vibes Debug
        </h3>
        <p>${message}</p>
    `;

    if (data) {
      content += `<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>`;
    }

    content += `</div>`;

    await this.sendWhisperedMessage(content, [game.user.id]);
  }

  /**
   * Send an error notification
   * @param {string} error - Error message
   * @param {string} context - Context where error occurred
   */
  async sendErrorNotification(error, context) {
    if (!game.user.isGM) return;

    const content = `
      <div class="pf2e-npc-vibes-message" style="border-left: 4px solid #e74c3c; padding-left: 10px; margin: 5px 0;">
        <h3 style="color: #e74c3c; margin: 0 0 5px 0;">
          <i class="fas fa-exclamation-triangle"></i> PF2E NPC Vibes Error
        </h3>
        <p><strong>Context:</strong> ${context}</p>
        <p><strong>Error:</strong> ${error}</p>
      </div>
    `;

    await this.sendWhisperedMessage(content, [game.user.id]);
  }
}
