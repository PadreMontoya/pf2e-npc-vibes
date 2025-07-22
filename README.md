# PF2E NPC Vibes

A Foundry VTT module for Pathfinder 2E that automatically generates and tracks emotional "vibes" between Player Characters and NPCs based on line of sight interactions.

## Features

- **Automatic Vibe Generation**: When a PC first sees an NPC, the module secretly rolls a d20 to determine their initial emotional reaction
- **Visual Indicators**: NPCs display colored auras visible only to specific PCs based on their vibes
- **Persistent Tracking**: Vibe relationships are maintained even if tokens are deleted and recreated
- **Connection Levels**: Integration with PF2E's official Connection rules for deeper relationship tracking
- **Vibe Book**: A comprehensive interface for players and GMs to view and manage vibe relationships

## Vibe Types

- **Repulsed** (Roll: 1) - Red aura - The PC feels an immediate negative reaction
- **Curious** (Roll: 18-19) - Yellow aura - The PC is intrigued and wants to learn more
- **Awestruck** (Roll: 20) - Green aura - The PC is deeply impressed or inspired

## Installation

### Method 1: Manifest URL (Recommended)
1. In Foundry VTT, go to the "Add-on Modules" tab
2. Click "Install Module"
3. Paste this manifest URL: `https://github.com/PadreMontoya/pf2e-npc-vibes/releases/latest/download/module.json`
4. Click "Install"

### Method 2: Manual Installation
1. Download the latest release from [GitHub](https://github.com/PadreMontoya/pf2e-npc-vibes/releases)
2. Extract the zip file to your Foundry `Data/modules/` directory
3. Restart Foundry VTT
4. Enable the module in your world's module settings

## Usage

### Basic Operation
1. Enable the module in your world
2. The module automatically detects when PCs come into line of sight with NPCs
3. On first sight, vibe rolls are made secretly for both the PC and NPC
4. Players and GMs receive whispered notifications for significant vibes (1, 18-19, 20)

### Vibe Book
Access the Vibe Book through the macro or module controls to:
- **Players**: View your character's vibes toward NPCs and manage Connection levels
- **GMs**: See all vibe relationships and NPC attitudes toward PCs

### Visual Indicators
- NPCs display colored auras that are visible only to PCs with vibes toward them
- Aura colors correspond to vibe types (Red/Repulsed, Yellow/Curious, Green/Awestruck)

## Compatibility

- **Foundry VTT**: Version 12+
- **System**: Pathfinder 2E (PF2E) v5.0.0+
- **Dependencies**: None

## Configuration

The module includes several settings accessible through Foundry's module settings:
- Enable/disable visual indicators
- Customize vibe roll thresholds
- Configure notification preferences

## Support

- **Issues**: [GitHub Issues](https://github.com/PadreMontoya/pf2e-npc-vibes/issues)
- **Documentation**: [Wiki](https://github.com/PadreMontoya/pf2e-npc-vibes/wiki)

## License

This module is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
