/**
 * PF2E NPC Vibes Module
 * Automatically generates and tracks emotional vibes between PCs and NPCs
 */

import { PF2ENPCVibes } from './pf2e-npc-vibes.js';
import { VibeBookApplication } from './vibe-book.js';
import { VibeManager } from './vibe-manager.js';
import { VisualEffects } from './visual-effects.js';

// Module constants
const MODULE_ID = 'pf2e-npc-vibes';

// Initialize module
Hooks.once('init', () => {
  console.log('PF2E NPC Vibes | Initializing module');
  
  // Register module settings
  registerSettings();
  
  // Initialize the main module class
  game.modules.get(MODULE_ID).api = new PF2ENPCVibes();
  
  // Register socket listeners
  registerSocketListeners();
  
  console.log('PF2E NPC Vibes | Module initialized');
});

// Setup module after Foundry is ready
Hooks.once('ready', () => {
  console.log('PF2E NPC Vibes | Setting up module');
  
  // Check system compatibility
  if (game.system.id !== 'pf2e') {
    ui.notifications.warn('PF2E NPC Vibes requires the Pathfinder 2E system');
    return;
  }
  
  // Initialize managers
  game.modules.get(MODULE_ID).vibeManager = new VibeManager();
  game.modules.get(MODULE_ID).visualEffects = new VisualEffects();
  
  // Create Vibe Book macro
  createVibeBookMacro();
  
  console.log('PF2E NPC Vibes | Module ready');
});

// Register module settings
function registerSettings() {
  game.settings.register(MODULE_ID, 'enableVisualIndicators', {
    name: game.i18n.localize('PF2E_NPC_VIBES.Settings.EnableVisualIndicators.Name'),
    hint: game.i18n.localize('PF2E_NPC_VIBES.Settings.EnableVisualIndicators.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, 'enableNotifications', {
    name: game.i18n.localize('PF2E_NPC_VIBES.Settings.EnableNotifications.Name'),
    hint: game.i18n.localize('PF2E_NPC_VIBES.Settings.EnableNotifications.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, 'auraOpacity', {
    name: game.i18n.localize('PF2E_NPC_VIBES.Settings.AuraOpacity.Name'),
    hint: game.i18n.localize('PF2E_NPC_VIBES.Settings.AuraOpacity.Hint'),
    scope: 'world',
    config: true,
    type: Number,
    range: { min: 0, max: 100, step: 5 },
    default: 70
  });

  game.settings.register(MODULE_ID, 'auraSize', {
    name: game.i18n.localize('PF2E_NPC_VIBES.Settings.AuraSize.Name'),
    hint: game.i18n.localize('PF2E_NPC_VIBES.Settings.AuraSize.Hint'),
    scope: 'world',
    config: true,
    type: Number,
    range: { min: 0.5, max: 3.0, step: 0.1 },
    default: 1.5
  });

  game.settings.register(MODULE_ID, 'defaultSightRange', {
    name: game.i18n.localize('PF2E_NPC_VIBES.Settings.DefaultSightRange.Name'),
    hint: game.i18n.localize('PF2E_NPC_VIBES.Settings.DefaultSightRange.Hint'),
    scope: 'world',
    config: true,
    type: Number,
    range: { min: 30, max: 1000, step: 10 },
    default: 300
  });

  game.settings.register(MODULE_ID, 'ignoreWalls', {
    name: game.i18n.localize('PF2E_NPC_VIBES.Settings.IgnoreWalls.Name'),
    hint: game.i18n.localize('PF2E_NPC_VIBES.Settings.IgnoreWalls.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  // Internal settings for data storage
  game.settings.register(MODULE_ID, 'vibeData', {
    scope: 'world',
    config: false,
    type: Object,
    default: {
      pcVibes: {}, // PC ID -> { NPC ID -> vibe }
      npcVibes: {}, // NPC ID -> { PC ID -> vibe }
      connections: {}, // PC ID -> { NPC ID -> connection level }
      npcRegistry: {} // NPC UUID -> stable ID mapping
    }
  });
}

// Register socket listeners for multiplayer support
function registerSocketListeners() {
  game.socket.on(`module.${MODULE_ID}`, (data) => {
    const vibeManager = game.modules.get(MODULE_ID).vibeManager;
    if (!vibeManager) return;
    
    switch (data.type) {
      case 'vibeRoll':
        vibeManager.handleVibeRoll(data);
        break;
      case 'updateVibe':
        vibeManager.handleVibeUpdate(data);
        break;
      case 'updateConnection':
        vibeManager.handleConnectionUpdate(data);
        break;
    }
  });
}

// Create the Vibe Book macro
async function createVibeBookMacro() {
  // Check if macro already exists
  const existingMacro = game.macros.find(m => m.name === 'Vibe Book');
  if (existingMacro) return;

  // Create the macro
  const macroData = {
    name: 'Vibe Book',
    type: 'script',
    img: 'icons/sundries/books/book-red-exclamation.webp',
    command: `
// Import and open the Vibe Book
const { VibeBookApplication } = await import('/modules/pf2e-npc-vibes/scripts/vibe-book.js');
const vibeBook = new VibeBookApplication();
vibeBook.render(true);
    `,
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      [MODULE_ID]: {
        isVibeBookMacro: true
      }
    }
  };

  try {
    await Macro.create(macroData);
    console.log('PF2E NPC Vibes | Vibe Book macro created');
  } catch (error) {
    console.warn('PF2E NPC Vibes | Could not create Vibe Book macro:', error);
  }
}

// Export module ID for use in other files
export { MODULE_ID };
