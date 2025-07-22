# Installation Guide

## Prerequisites

- **Foundry VTT**: Version 12 or higher
- **System**: Pathfinder 2E (PF2E) v5.0.0 or higher
- **Permissions**: Module installation permissions in your world

## Installation Methods

### Method 1: Manifest URL (Recommended)

1. Open Foundry VTT and navigate to your world
2. Go to **Game Settings** → **Manage Modules**
3. Click **Install Module**
4. In the **Manifest URL** field, paste:
   ```
   https://github.com/PadreMontoya/pf2e-npc-vibes/releases/latest/download/module.json
   ```
5. Click **Install**
6. Once installed, enable the module in your world's module settings

### Method 2: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/PadreMontoya/pf2e-npc-vibes/releases)
2. Extract the ZIP file to your Foundry `Data/modules/` directory
3. The folder structure should look like:
   ```
   Data/modules/pf2e-npc-vibes/
   ├── module.json
   ├── scripts/
   ├── styles/
   ├── templates/
   └── lang/
   ```
4. Restart Foundry VTT
5. Enable the module in your world's module settings

### Method 3: Development Installation

For developers or those wanting to contribute:

1. Clone the repository:
   ```bash
   git clone https://github.com/PadreMontoya/pf2e-npc-vibes.git
   ```
2. Create a symbolic link or copy the folder to your Foundry modules directory
3. Enable the module in Foundry

## Post-Installation Setup

### 1. Enable the Module
- Go to **Game Settings** → **Manage Modules**
- Find "PF2E NPC Vibes" in the list
- Check the box to enable it
- Click **Save Module Settings**

### 2. Configure Settings
- Go to **Game Settings** → **Configure Settings** → **Module Settings**
- Find the "PF2E NPC Vibes" section
- Adjust settings as desired:
  - **Enable Visual Indicators**: Show colored auras around NPCs
  - **Enable Vibe Notifications**: Send whispered messages for vibe rolls
  - **Aura Opacity**: Adjust transparency of vibe auras (0-100%)
  - **Aura Size**: Adjust size of vibe auras (0.5x to 3.0x)

### 3. Create Vibe Book Macro (Optional)
The module automatically creates a "Vibe Book" macro, but if it doesn't appear:

1. Go to the **Macro Directory**
2. Click **Create Macro**
3. Set **Type** to "Script"
4. Set **Name** to "Vibe Book"
5. Paste this code in the **Command** field:
   ```javascript
   const { VibeBookApplication } = await import('/modules/pf2e-npc-vibes/scripts/vibe-book.js');
   const vibeBook = new VibeBookApplication();
   vibeBook.render(true);
   ```
6. Save the macro

## Verification

To verify the module is working correctly:

1. **Check Console**: Open browser developer tools (F12) and look for "PF2E NPC Vibes" messages in the console
2. **Test Line of Sight**: Place a PC and NPC token on the scene and move them so they can see each other
3. **Check Vibe Book**: Run the Vibe Book macro to see if the interface opens
4. **Visual Effects**: Look for colored auras around NPCs when PCs have vibes toward them

## Troubleshooting

### Module Not Appearing
- Ensure you're using Foundry VTT v12 or higher
- Verify the PF2E system is active and up to date
- Check that the module files are in the correct directory
- Restart Foundry VTT completely

### No Vibe Rolls Occurring
- Ensure tokens represent actual actors (not just images)
- Check that tokens are set to the correct actor type (character/npc)
- Verify line of sight is working (tokens can see each other)
- Check module settings are enabled

### Visual Effects Not Showing
- Ensure "Enable Visual Indicators" is checked in module settings
- Check that aura opacity is not set to 0%
- Verify the PC has a vibe toward the NPC
- Try refreshing the page (F5)

### Vibe Book Not Opening
- Check browser console for JavaScript errors
- Ensure the macro code is correct
- Try creating a new macro with the provided code
- Verify module is properly enabled

## Uninstallation

To remove the module:

1. Disable the module in **Game Settings** → **Manage Modules**
2. Delete the module folder from `Data/modules/pf2e-npc-vibes/`
3. Remove any custom macros you created for the module

**Note**: Uninstalling will remove all vibe data. Export your data first if you want to keep it.

## Support

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/PadreMontoya/pf2e-npc-vibes/issues) page
2. Review the browser console for error messages
3. Create a new issue with:
   - Foundry VTT version
   - PF2E system version
   - Module version
   - Steps to reproduce the problem
   - Any console error messages
