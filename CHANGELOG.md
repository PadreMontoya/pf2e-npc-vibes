# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
