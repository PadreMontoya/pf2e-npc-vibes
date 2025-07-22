/**
 * Vibe Book Application
 * UI for viewing and managing vibe relationships and connections
 */

import { MODULE_ID } from './main.js';

export class VibeBookApplication extends Application {
  constructor(options = {}) {
    super(options);
    this.moduleId = MODULE_ID;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'pf2e-npc-vibes-book',
      title: game.i18n.localize('PF2E_NPC_VIBES.VibeBook.Title'),
      template: 'modules/pf2e-npc-vibes/templates/vibe-book.hbs',
      width: 600,
      height: 500,
      resizable: true,
      classes: ['pf2e-npc-vibes-window']
    });
  }

  getData() {
    const data = super.getData();
    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    
    if (!dataManager) {
      return { ...data, error: 'Module not properly initialized' };
    }

    const isGM = game.user.isGM;
    data.isGM = isGM;
    
    if (isGM) {
      // GM view - show all vibes
      data.vibeData = this.getGMVibeData(dataManager);
    } else {
      // Player view - show only their character's vibes
      data.vibeData = this.getPlayerVibeData(dataManager);
    }

    data.connectionLevels = this.getConnectionLevels();
    
    return data;
  }

  /**
   * Get vibe data for GM view
   * @param {DataManager} dataManager - The data manager
   * @returns {Object} - Formatted vibe data
   */
  getGMVibeData(dataManager) {
    const allVibes = dataManager.getAllVibes();
    const vibeData = {
      pcVibes: [],
      npcVibes: [],
      hasVibes: false
    };

    // Process PC vibes towards NPCs
    for (const [pcUuid, npcVibes] of Object.entries(allVibes.pcVibes)) {
      const pcActor = game.actors.find(a => a.uuid === pcUuid);
      if (!pcActor) continue;

      for (const [npcUuid, vibeInfo] of Object.entries(npcVibes)) {
        if (vibeInfo.vibe === 'none') continue;

        const npcActor = game.actors.find(a => a.uuid === npcUuid);
        if (!npcActor) continue;

        const connection = dataManager.getConnection(pcUuid, npcUuid);

        vibeData.pcVibes.push({
          pcName: pcActor.name,
          pcUuid,
          npcName: npcActor.name,
          npcUuid,
          vibe: vibeInfo.vibe,
          vibeDisplay: this.getVibeDisplayName(vibeInfo.vibe),
          vibeColor: this.getVibeColor(vibeInfo.vibe),
          connection,
          timestamp: vibeInfo.timestamp
        });
        vibeData.hasVibes = true;
      }
    }

    // Process NPC vibes towards PCs
    for (const [npcUuid, pcVibes] of Object.entries(allVibes.npcVibes)) {
      const npcActor = game.actors.find(a => a.uuid === npcUuid);
      if (!npcActor) continue;

      for (const [pcUuid, vibeInfo] of Object.entries(pcVibes)) {
        if (vibeInfo.vibe === 'none') continue;

        const pcActor = game.actors.find(a => a.uuid === pcUuid);
        if (!pcActor) continue;

        vibeData.npcVibes.push({
          npcName: npcActor.name,
          npcUuid,
          pcName: pcActor.name,
          pcUuid,
          vibe: vibeInfo.vibe,
          vibeDisplay: this.getVibeDisplayName(vibeInfo.vibe),
          vibeColor: this.getVibeColor(vibeInfo.vibe),
          timestamp: vibeInfo.timestamp
        });
        vibeData.hasVibes = true;
      }
    }

    return vibeData;
  }

  /**
   * Get vibe data for player view
   * @param {DataManager} dataManager - The data manager
   * @returns {Object} - Formatted vibe data
   */
  getPlayerVibeData(dataManager) {
    const vibeData = {
      pcVibes: [],
      hasVibes: false
    };

    // Get the player's character
    const character = game.user.character;
    if (!character) {
      vibeData.error = game.i18n.localize('PF2E_NPC_VIBES.Errors.NoCharacter');
      return vibeData;
    }

    const pcUuid = character.uuid;
    const pcVibes = dataManager.getPCVibes(pcUuid);

    for (const [npcUuid, vibeInfo] of Object.entries(pcVibes)) {
      if (vibeInfo.vibe === 'none') continue;

      const npcActor = game.actors.find(a => a.uuid === npcUuid);
      if (!npcActor) continue;

      const connection = dataManager.getConnection(pcUuid, npcUuid);

      vibeData.pcVibes.push({
        npcName: npcActor.name,
        npcUuid,
        vibe: vibeInfo.vibe,
        vibeDisplay: this.getVibeDisplayName(vibeInfo.vibe),
        vibeColor: this.getVibeColor(vibeInfo.vibe),
        connection,
        timestamp: vibeInfo.timestamp
      });
      vibeData.hasVibes = true;
    }

    return vibeData;
  }

  /**
   * Get available connection levels
   * @returns {Array} - Array of connection level objects
   */
  getConnectionLevels() {
    return [
      { value: 'Stranger', label: game.i18n.localize('PF2E_NPC_VIBES.Connections.Stranger') },
      { value: 'Acquaintance', label: game.i18n.localize('PF2E_NPC_VIBES.Connections.Acquaintance') },
      { value: 'Friend', label: game.i18n.localize('PF2E_NPC_VIBES.Connections.Friend') },
      { value: 'BestFriend', label: game.i18n.localize('PF2E_NPC_VIBES.Connections.BestFriend') }
    ];
  }

  /**
   * Get display name for vibe type
   * @param {string} vibeType - The vibe type
   * @returns {string} - Display name
   */
  getVibeDisplayName(vibeType) {
    const key = `PF2E_NPC_VIBES.Vibes.${vibeType.charAt(0).toUpperCase() + vibeType.slice(1)}`;
    return game.i18n.localize(key);
  }

  /**
   * Get color for vibe type
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

  activateListeners(html) {
    super.activateListeners(html);

    // Handle connection level changes
    html.find('.connection-select').change(this._onConnectionChange.bind(this));

    // Handle refresh button
    html.find('.refresh-vibes').click(this._onRefresh.bind(this));

    // Handle export button (GM only)
    html.find('.export-vibes').click(this._onExport.bind(this));

    // Handle import button (GM only)
    html.find('.import-vibes').click(this._onImport.bind(this));
  }

  /**
   * Handle connection level change
   * @param {Event} event - The change event
   */
  async _onConnectionChange(event) {
    const select = event.currentTarget;
    const newConnection = select.value;
    const pcUuid = select.dataset.pcUuid;
    const npcUuid = select.dataset.npcUuid;

    if (!pcUuid || !npcUuid) return;

    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    if (!dataManager) return;

    const oldConnection = dataManager.getConnection(pcUuid, npcUuid);
    
    // Update connection
    await dataManager.storeConnection(pcUuid, npcUuid, newConnection);

    // Send notification
    const messagingSystem = game.modules.get(this.moduleId)?.vibeManager?.messagingSystem;
    if (messagingSystem) {
      const pcActor = game.actors.find(a => a.uuid === pcUuid);
      const npcActor = game.actors.find(a => a.uuid === npcUuid);
      
      if (pcActor && npcActor) {
        await messagingSystem.sendConnectionUpdateNotification(
          pcActor.name,
          npcActor.name,
          oldConnection,
          newConnection,
          game.user.id
        );
      }
    }

    // Broadcast update
    game.socket.emit(`module.${this.moduleId}`, {
      type: 'updateConnection',
      pcUuid,
      npcUuid,
      connection: newConnection,
      userId: game.user.id
    });

    ui.notifications.info(`Connection updated to ${newConnection}`);
  }

  /**
   * Handle refresh button click
   * @param {Event} event - The click event
   */
  _onRefresh(event) {
    this.render(true);
  }

  /**
   * Handle export button click
   * @param {Event} event - The click event
   */
  _onExport(event) {
    if (!game.user.isGM) return;

    const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
    if (!dataManager) return;

    const exportData = dataManager.exportData();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pf2e-npc-vibes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    ui.notifications.info('Vibe data exported');
  }

  /**
   * Handle import button click
   * @param {Event} event - The click event
   */
  _onImport(event) {
    if (!game.user.isGM) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const dataManager = game.modules.get(this.moduleId)?.vibeManager?.dataManager;
        if (dataManager) {
          await dataManager.importData(text);
          this.render(true);
        }
      } catch (error) {
        ui.notifications.error('Failed to import vibe data');
        console.error('Import error:', error);
      }
    };
    
    input.click();
  }
}
