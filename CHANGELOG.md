# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.6] - 2025-07-24

### Fixed
- Fixed vibe checks not triggering when tokens are first placed on canvas
- Fixed "Reset All Vibes" not properly clearing the interface display
- Enhanced token placement detection for immediate vibe generation

### Changed
- Changed "Force Sight Check" to "Force Vibe Check" for clarity
- Improved vibe check triggering on token creation events
- Enhanced data clearing mechanism for reset functionality

## [1.1.5] - 2025-07-24

### Fixed
- Fixed "Reset All Vibes" button not clearing the Vibes tab display
- Fixed data cache not being properly invalidated after reset
- Improved UI refresh after data operations

### Changed
- Moved "Refresh" button to bottom of Vibes tab for better UX
- Moved Import/Export buttons to Debug tab for better organization
- Enhanced data cache management for immediate UI updates

## [1.1.4] - 2025-07-24

### Added
- Humanoid trait requirement: Only actors with the "humanoid" trait are considered for vibe checks
- Optimized vibe scanning: Only triggers on token placement and visibility changes (not movement)

### Changed
- Improved performance by reducing unnecessary vibe checks during token movement
- Removed "First Sight" messages from chat notifications for cleaner experience
- Removed debug panel from Vibes tab for cleaner interface

### Performance
- Vibe checks now only occur on token placement and visibility toggles
- Manual scanning available via GM Debug tab when needed
- Reduced computational overhead during gameplay

## [1.1.3] - 2025-07-24

### Fixed
- **CRITICAL FIX**: Fixed Vibe Book display issue caused by UUID mismatch
- Fixed actor lookup to handle token-based UUIDs vs actor-only UUIDs
- Vibes are now properly displayed in the Vibe Book interface
- Fixed disconnect between vibe storage and display systems

### Technical
- Updated actor lookup logic to extract actor UUID from token-based UUIDs
- Enhanced UUID handling for both PC and NPC actor resolution
- Fixed the core issue preventing vibes from appearing in the interface

## [1.1.2] - 2025-07-24

### Fixed
- Enhanced debugging for Vibe Book data retrieval issues
- Added comprehensive logging to identify disconnect between data storage and display
- Improved GM detection and data flow diagnostics
- Added detailed debugging for vibe data structure and actor UUID resolution

### Debug
- Added extensive console logging to track data flow from storage to display
- Enhanced debugging for actor lookup and UUID matching
- Improved diagnostics for GM permission detection

## [1.1.1] - 2025-07-24

### Added
- "Only Significant Vibes" notification setting to filter chat messages
- Chat notifications now only show Curious, Repulsed, and Awestruck vibes by default
- Setting to control whether to show all vibe results or only significant ones

### Changed
- Default notification behavior now filters out "none" vibe results
- Cleaner chat experience with only meaningful vibe notifications

## [1.1.0] - 2025-07-24

### Changed
- Replaced Foundry dice rolling with Math.random() for instant vibe determination
- Simplified vibe generation without dice roll animations or sounds
- Faster vibe processing with immediate results

### Fixed
- Fixed critical Vibe Book display issue where vibes weren't appearing in the interface
- Improved data storage and retrieval for vibe display
- Enhanced debugging for vibe data synchronization issues
- Fixed template data binding for vibe tables

### Technical
- Removed dependency on Foundry's dice system for vibe rolls
- Streamlined vibe generation process for better performance
- Enhanced data flow between vibe generation and display systems

## [1.0.9] - 2025-07-24

### Added
- "Reset All Vibes" button in GM Debug tab to clear all vibe data
- GM-only vibe notifications (players no longer see vibe roll messages)

### Fixed
- Fixed Vibe Book data display issue where vibes weren't showing in the interface
- Fixed vibe data retrieval and filtering logic
- Improved data synchronization between vibe generation and display

### Changed
- Vibe roll notifications are now GM-only for better immersion
- Enhanced debug logging for vibe data troubleshooting

## [1.0.8] - 2025-07-22

### Added
- Improved Vibe Book interface with three-column layout
- GM view now shows all PC→NPC and NPC→PC vibes in organized tables
- Player view shows clean three-column display of their character's vibes
- Better data organization and display in Vibe Book

### Fixed
- Fixed Vibe Book not displaying vibe data properly for GMs
- Fixed missing vibe entries in the Vibes tab
- Improved data retrieval and display logic

### Changed
- Redesigned Vibe Book layout for better readability
- Separate tables for PC vibes and NPC vibes in GM view
- Cleaner three-column format: Source → Target → Vibe

## [1.0.7] - 2025-07-22

### Fixed
- Fixed persistent wall collision detection blocking vibe generation in open areas
- Fixed "Invalid token for sight range calculation" error
- Implemented working "Ignore Walls" setting that actually bypasses wall detection
- Fixed token validation issues in sight range calculation

### Changed
- "Ignore Walls" setting now defaults to true for easier initial setup
- Simplified line of sight detection to be more reliable
- Better error handling for token validation

## [1.0.6] - 2025-07-22

### Added
- Automated GitHub Actions workflow for releases
- Test workflow to validate module structure on commits
- Automated asset upload (module.json and zip file) on version tags

### Changed
- Updated documentation with automated release process
- Streamlined release workflow for better maintainability

### Technical
- No longer requires manual asset uploads to GitHub releases
- Automated validation of module structure and JSON validity

## [1.0.5] - 2025-07-22

### Fixed
- Fixed critical JavaScript errors with undefined token properties
- Fixed sight range calculation errors causing crashes
- Improved error handling for token document access
- Fixed distance calculation to use proper grid measurements
- Increased default sight range to 300 feet for better detection

### Changed
- More robust token property access with null checks
- Simplified sight range calculation with better fallbacks
- Enhanced error handling throughout the sight detection system

## [1.0.4] - 2025-07-22

### Fixed
- Fixed overly strict wall collision detection that was blocking valid line of sight
- NPCs now assumed to have vision enabled by default for vibe detection
- Simplified line of sight detection to be more permissive for vibe generation
- Fixed false wall collision detection in open areas

### Changed
- More permissive vision requirements for vibe detection
- Simplified collision detection for better reliability
- Assume all characters can see for vibe purposes unless explicitly hidden

## [1.0.3] - 2025-07-22

### Fixed
- Fixed sight range calculation to properly work with grid distances
- Reduced excessive sight checks by only triggering on actual token position changes
- Improved vision detection to respect token visibility settings and hidden status
- Fixed distance calculations for proper grid-based measurements
- Optimized performance by reducing redundant sight checks

### Changed
- Sight checks now only occur when tokens actually move position
- Improved sight range detection for different grid sizes
- Better integration with Foundry's vision system

## [1.0.2] - 2025-07-22

### Added
- Comprehensive debug logging to Chrome console for vibe roll tracking
- Debug tab in Vibe Book for GMs to monitor all vibe checks and results
- Enhanced line of sight detection debugging
- Detailed console output for troubleshooting vibe generation issues

### Fixed
- Improved vibe detection reliability
- Enhanced token registration and sight checking
- Better error handling and reporting

## [1.0.1] - 2025-07-22

### Changed
- Updated repository configuration and documentation
- Improved GitHub Actions workflow for automated releases
- Enhanced issue templates and contributing guidelines

### Technical
- Repository now properly configured with topics and settings
- Release automation fully functional for Forge VTT compatibility

## [1.0.0] - 2025-07-22

### Added
- Initial release of PF2E NPC Vibes module
- Automatic vibe generation on first line of sight between PCs and NPCs
- Three vibe types: Repulsed (1), Curious (18-19), and Awestruck (20)
- Visual aura indicators for NPCs visible only to specific PCs
- Persistent vibe tracking using stable NPC IDs
- Bidirectional vibe system (PC→NPC and NPC→PC)
- Whispered notifications for significant vibe rolls
- Vibe Book interface for players and GMs
- Integration with PF2E Connection levels
- Support for Foundry VTT v12
- Compatibility with PF2E system v5.0.0+

### Features
- Line of sight detection using Foundry's vision system
- Secure data storage that persists through token deletion/recreation
- Separate player and GM views in Vibe Book
- Customizable visual indicators
- Socket-based communication for multiplayer support
- Hot reload support for development

### Technical
- ES6 module architecture
- Foundry VTT v12 compatibility
- PF2E system integration
- Persistent world-level data storage
- Client-side visual effects
- Server-side vibe calculations
