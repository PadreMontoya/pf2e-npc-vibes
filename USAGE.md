# Usage Guide

## Overview

PF2E NPC Vibes automatically generates emotional reactions between Player Characters and NPCs when they first see each other. This guide explains how to use all the module's features.

## Basic Operation

### Automatic Vibe Generation

The module works automatically once enabled:

1. **First Sight**: When a PC and NPC can see each other for the first time, the module secretly rolls a d20 for each character
2. **Vibe Determination**: Based on the roll results:
   - **1**: Repulsed (Red aura)
   - **18-19**: Curious (Yellow aura)
   - **20**: Awestruck (Green aura)
   - **2-17**: No special vibe
3. **Notifications**: Players and GMs receive whispered messages for significant vibes
4. **Visual Effects**: NPCs display colored auras visible only to PCs with vibes toward them

### Line of Sight Detection

The module uses Foundry's built-in vision system to determine when characters can see each other:

- Respects walls and obstacles
- Considers token vision ranges
- Accounts for lighting conditions
- Updates when tokens move

## The Vibe Book

### Opening the Vibe Book

- Use the "Vibe Book" macro from your macro bar
- Or run this script in a macro:
  ```javascript
  const { VibeBookApplication } = await import('/modules/pf2e-npc-vibes/scripts/vibe-book.js');
  const vibeBook = new VibeBookApplication();
  vibeBook.render(true);
  ```

### Player View

When a player opens the Vibe Book, they see:

- **Their Character's Vibes**: NPCs their character has vibes toward
- **Vibe Types**: Visual indicators showing the type of vibe (color-coded)
- **Connection Levels**: Dropdown to manage relationship progression
- **No GM Information**: Players only see their own character's perspective

### GM View

When the GM opens the Vibe Book, they see:

- **All PC Vibes**: Every PC's vibes toward NPCs
- **All NPC Vibes**: Every NPC's vibes toward PCs
- **Connection Management**: Can adjust connection levels for any relationship
- **Export/Import**: Backup and restore vibe data

## Connection Levels

Based on official PF2E rules, relationships progress through four levels:

### Stranger
- **Description**: No meaningful relationship
- **Progression**: Have a meaningful interaction to become Acquaintances

### Acquaintance
- **Description**: Casual relationship (shopkeeper, regular contact)
- **Benefits**: Can gather information, might provide basic assistance
- **Progression**: Multiple positive interactions, provide assistance, share information

### Friend
- **Description**: Genuine friendship
- **Benefits**: Provides reasonable assistance, shares information, generally trustworthy
- **Progression**: Significant shared experiences, demonstrate deep trust

### Best Friend
- **Description**: One of your closest companions
- **Benefits**: Goes out of their way to help, takes risks on your behalf, provides emotional support

### Managing Connections

1. Open the Vibe Book
2. Find the character relationship you want to modify
3. Use the dropdown to select a new connection level
4. The change is automatically saved and shared with other players

## Visual Indicators

### Aura Colors
- **Red**: Repulsed vibe
- **Yellow**: Curious vibe
- **Green**: Awestruck vibe

### Aura Visibility
- Only the PC with the vibe can see the aura
- GMs can see all auras
- Auras appear around NPC tokens
- Auras pulse gently to draw attention

### Customizing Visual Effects

In Module Settings, you can adjust:
- **Aura Opacity**: How transparent the auras appear (0-100%)
- **Aura Size**: How large the auras are (0.5x to 3.0x token size)
- **Enable/Disable**: Turn visual indicators on or off completely

## Notifications

### Player Notifications

Players receive whispered messages when:
- Their character develops a significant vibe (1, 18-19, or 20)
- Connection levels change

### GM Notifications

GMs receive additional notifications for:
- All vibe rolls (including NPC vibes toward PCs)
- First sight events between characters
- Connection level changes
- System errors or warnings

### Customizing Notifications

- Use the "Enable Vibe Notifications" setting to turn notifications on/off
- Notifications are always whispered (private)
- Players only see their own character's information

## Advanced Features

### Data Management

**Export Data** (GM only):
1. Open the Vibe Book
2. Click "Export"
3. Save the JSON file as backup

**Import Data** (GM only):
1. Open the Vibe Book
2. Click "Import"
3. Select a previously exported JSON file

### Token Management

The module automatically handles:
- **Token Deletion**: Vibes persist even if tokens are deleted
- **Token Recreation**: Vibes are restored when tokens are placed again
- **Actor Changes**: Uses stable actor IDs to maintain relationships

### Multiplayer Support

- All vibe data is synchronized across all connected clients
- Visual effects appear correctly for each player
- Connection changes are broadcast to all players
- Works with any number of players

## Best Practices

### For GMs

1. **Review Vibes**: Check the Vibe Book regularly to see developing relationships
2. **Use in Roleplay**: Incorporate vibes into NPC behavior and dialogue
3. **Manage Connections**: Help players progress relationships appropriately
4. **Backup Data**: Export vibe data before major game updates

### For Players

1. **Roleplay Vibes**: Let your character's vibes influence their behavior
2. **Build Connections**: Work to develop relationships with important NPCs
3. **Communicate**: Discuss relationship developments with your GM
4. **Be Patient**: Relationships take time to develop naturally

## Troubleshooting

### Vibes Not Generating
- Ensure tokens represent actual actors
- Check that line of sight is working
- Verify both characters are the correct type (PC/NPC)

### Visual Effects Missing
- Check module settings for visual indicators
- Ensure aura opacity is not 0%
- Try refreshing the page

### Vibe Book Issues
- Check browser console for errors
- Ensure module is properly enabled
- Try recreating the macro

## Integration with Other Modules

PF2E NPC Vibes is designed to work alongside other modules:

- **Compatible**: Most vision and lighting modules
- **Enhanced by**: Social interaction modules
- **Complemented by**: Relationship tracking modules

Always test module combinations in a backup world first.
