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
    const vibeManager = game.modules.get(this.moduleId)?.vibeManager;
    const dataManager = vibeManager?.dataManager;

    if (!dataManager) {
      return { ...data, error: 'Module not properly initialized' };
    }

    const isGM = game.user.isGM;
    data.isGM = isGM;

    if (isGM) {
      // GM view - show all vibes and debug info
      data.vibeData = this.getGMVibeData(dataManager);
      data.debugData = this.getDebugData(vibeManager);
    } else {
      // Player view - show only their character's vibes
      data.vibeData = this.getPlayerVibeData(dataManager);
    }

    data.connectionLevels = this.getConnectionLevels();

    // Enhanced debugging for vibe data issues
    console.log('🎭 PF2E NPC Vibes | Vibe Book getData() called');
    console.log('🎭 PF2E NPC Vibes | Is GM:', isGM);
    console.log('🎭 PF2E NPC Vibes | Raw vibe data:', data.vibeData);
    console.log('🎭 PF2E NPC Vibes | Has vibes:', data.vibeData?.hasVibes);
    console.log('🎭 PF2E NPC Vibes | PC vibes count:', data.vibeData?.pcVibes?.length || 0);
    console.log('🎭 PF2E NPC Vibes | NPC vibes count:', data.vibeData?.npcVibes?.length || 0);

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

    console.log('🎭 PF2E NPC Vibes | GM Vibe Data - All vibes:', allVibes);
    console.log('🎭 PF2E NPC Vibes | GM Vibe Data - PC vibes keys:', Object.keys(allVibes.pcVibes || {}));
    console.log('🎭 PF2E NPC Vibes | GM Vibe Data - NPC vibes keys:', Object.keys(allVibes.npcVibes || {}));

    // Process PC vibes towards NPCs
    for (const [pcUuid, npcVibes] of Object.entries(allVibes.pcVibes || {})) {
      const pcActor = game.actors.find(a => a.uuid === pcUuid);
      if (!pcActor) {
        console.warn(`🎭 PF2E NPC Vibes | PC actor not found for UUID: ${pcUuid}`);
        continue;
      }

      for (const [npcUuid, vibeInfo] of Object.entries(npcVibes || {})) {
        // Include ALL vibes, even 'none' for debugging
        const npcActor = game.actors.find(a => a.uuid === npcUuid);
        if (!npcActor) {
          console.warn(`🎭 PF2E NPC Vibes | NPC actor not found for UUID: ${npcUuid}`);
          continue;
        }

        const connection = dataManager.getConnection(pcUuid, npcUuid);

        // Only add vibes that are not 'none' to the display
        if (vibeInfo.vibe && vibeInfo.vibe !== 'none') {
          vibeData.pcVibes.push({
            sourceName: pcActor.name,
            sourceUuid: pcUuid,
            targetName: npcActor.name,
            targetUuid: npcUuid,
            vibe: vibeInfo.vibe,
            vibeDisplay: this.getVibeDisplayName(vibeInfo.vibe),
            vibeColor: this.getVibeColor(vibeInfo.vibe),
            connection,
            timestamp: vibeInfo.timestamp,
            hasVibe: true
          });

          vibeData.hasVibes = true;
        }
      }
    }

    // Process NPC vibes towards PCs
    for (const [npcUuid, pcVibes] of Object.entries(allVibes.npcVibes || {})) {
      const npcActor = game.actors.find(a => a.uuid === npcUuid);
      if (!npcActor) {
        console.warn(`🎭 PF2E NPC Vibes | NPC actor not found for UUID: ${npcUuid}`);
        continue;
      }

      for (const [pcUuid, vibeInfo] of Object.entries(pcVibes || {})) {
        // Include ALL vibes, even 'none' for debugging
        const pcActor = game.actors.find(a => a.uuid === pcUuid);
        if (!pcActor) {
          console.warn(`🎭 PF2E NPC Vibes | PC actor not found for UUID: ${pcUuid}`);
          continue;
        }

        // Only add vibes that are not 'none' to the display
        if (vibeInfo.vibe && vibeInfo.vibe !== 'none') {
          vibeData.npcVibes.push({
            sourceName: npcActor.name,
            sourceUuid: npcUuid,
            targetName: pcActor.name,
            targetUuid: pcUuid,
            vibe: vibeInfo.vibe,
            vibeDisplay: this.getVibeDisplayName(vibeInfo.vibe),
            vibeColor: this.getVibeColor(vibeInfo.vibe),
            timestamp: vibeInfo.timestamp,
            hasVibe: true
          });

          vibeData.hasVibes = true;
        }
      }
    }

    console.log('🎭 PF2E NPC Vibes | Processed GM vibe data:', vibeData);
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

    console.log('🎭 PF2E NPC Vibes | Player vibe data for', character.name, ':', pcVibes);

    for (const [npcUuid, vibeInfo] of Object.entries(pcVibes || {})) {
      // Include ALL vibes for debugging, but mark which have actual vibes
      const npcActor = game.actors.find(a => a.uuid === npcUuid);
      if (!npcActor) {
        console.warn(`🎭 PF2E NPC Vibes | NPC actor not found for UUID: ${npcUuid}`);
        continue;
      }

      const connection = dataManager.getConnection(pcUuid, npcUuid);

      // Only add vibes that are not 'none' to the display
      if (vibeInfo.vibe && vibeInfo.vibe !== 'none') {
        vibeData.pcVibes.push({
          sourceName: character.name,
          sourceUuid: pcUuid,
          targetName: npcActor.name,
          targetUuid: npcUuid,
          vibe: vibeInfo.vibe,
          vibeDisplay: this.getVibeDisplayName(vibeInfo.vibe),
          vibeColor: this.getVibeColor(vibeInfo.vibe),
          connection,
          timestamp: vibeInfo.timestamp,
          hasVibe: true
        });

        vibeData.hasVibes = true;
      }
    }

    console.log('🎭 PF2E NPC Vibes | Processed player vibe data:', vibeData);
    return vibeData;
  }

  /**
   * Get debug data for GM view
   * @param {VibeManager} vibeManager - The vibe manager
   * @returns {Object} - Debug data
   */
  getDebugData(vibeManager) {
    if (!vibeManager) return { error: 'Vibe manager not available' };

    const debugInfo = vibeManager.getDebugInfo();

    return {
      totalChecks: debugInfo.totalChecks,
      recentChecks: debugInfo.recentChecks.map(check => ({
        timestamp: new Date(check.timestamp).toLocaleTimeString(),
        pcName: check.pcName,
        npcName: check.npcName,
        pcCanSeeNpc: check.pcCanSeeNpc,
        npcCanSeePc: check.npcCanSeePc,
        pcRoll: check.vibeResults.pcToNpc.roll,
        pcVibe: check.vibeResults.pcToNpc.vibe,
        pcHasVibe: check.vibeResults.pcToNpc.hasVibe,
        npcRoll: check.vibeResults.npcToPc.roll,
        npcVibe: check.vibeResults.npcToPc.vibe,
        npcHasVibe: check.vibeResults.npcToPc.hasVibe
      })),
      stats: debugInfo.stats,
      processedPairs: debugInfo.processedPairs
    };
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

    // Handle debug buttons (GM only)
    html.find('.clear-debug').click(this._onClearDebug.bind(this));
    html.find('.force-sight-check').click(this._onForceSightCheck.bind(this));
    html.find('.reset-all-vibes').click(this._onResetAllVibes.bind(this));

    // Handle tab navigation
    html.find('.tab-button').click(this._onTabClick.bind(this));
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

  /**
   * Handle clear debug button click
   * @param {Event} event - The click event
   */
  _onClearDebug(event) {
    if (!game.user.isGM) return;

    const vibeManager = game.modules.get(this.moduleId)?.vibeManager;
    if (vibeManager) {
      vibeManager.clearDebugData();
      this.render(true);
      ui.notifications.info('Debug data cleared');
    }
  }

  /**
   * Handle force sight check button click
   * @param {Event} event - The click event
   */
  async _onForceSightCheck(event) {
    if (!game.user.isGM) return;

    const vibeManager = game.modules.get(this.moduleId)?.vibeManager;
    if (vibeManager) {
      console.log('🎭 PF2E NPC Vibes | Force sight check triggered by GM');
      await vibeManager.refreshAllLineOfSight();
      this.render(true);
      ui.notifications.info('Forced sight check completed - check console for details');
    }
  }

  /**
   * Handle reset all vibes button click
   * @param {Event} event - The click event
   */
  async _onResetAllVibes(event) {
    if (!game.user.isGM) return;

    // Show confirmation dialog
    const confirmed = await Dialog.confirm({
      title: "Reset All Vibes",
      content: "<p>Are you sure you want to reset ALL vibe data? This action cannot be undone.</p><p><strong>This will clear:</strong></p><ul><li>All PC vibes towards NPCs</li><li>All NPC vibes towards PCs</li><li>All connection levels</li><li>All debug data</li></ul>",
      yes: () => true,
      no: () => false,
      defaultYes: false
    });

    if (!confirmed) return;

    try {
      const dataManager = game.modules.get(this.moduleId)?.dataManager;
      if (dataManager) {
        // Reset all vibe data
        await dataManager.resetAllData();

        // Clear debug data
        const debugManager = game.modules.get(this.moduleId)?.debugManager;
        if (debugManager) {
          debugManager.clearDebugData();
        }

        console.log('🎭 PF2E NPC Vibes | All vibe data reset by GM');
        this.render(true);
        ui.notifications.info('All vibe data has been reset');
      }
    } catch (error) {
      console.error('🎭 PF2E NPC Vibes | Error resetting vibe data:', error);
      ui.notifications.error('Failed to reset vibe data - check console for details');
    }
  }

  /**
   * Handle tab button click
   * @param {Event} event - The click event
   */
  _onTabClick(event) {
    const clickedTab = event.currentTarget.dataset.tab;
    const html = $(event.currentTarget).closest('.window-content');

    // Update tab buttons
    html.find('.tab-button').removeClass('active');
    $(event.currentTarget).addClass('active');

    // Update tab content
    html.find('.tab-content').removeClass('active');
    html.find(`.${clickedTab}-tab`).addClass('active');
  }
}
