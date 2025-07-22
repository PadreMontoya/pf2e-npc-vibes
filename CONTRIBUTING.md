# Contributing to PF2E NPC Vibes

Thank you for your interest in contributing to PF2E NPC Vibes! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js (for development tools)
- Git
- Foundry VTT (for testing)
- Basic knowledge of JavaScript and Foundry VTT module development

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pf2e-npc-vibes.git
   cd pf2e-npc-vibes
   ```

2. **Set Up Development Environment**
   - Create a symbolic link from your Foundry modules directory to the cloned repository
   - Enable the module in a test world
   - Enable hot reload for faster development

3. **Install Development Dependencies** (if any are added in the future)
   ```bash
   npm install
   ```

## Code Structure

### File Organization

```
pf2e-npc-vibes/
├── module.json              # Module manifest
├── scripts/
│   ├── main.js             # Main module entry point
│   ├── pf2e-npc-vibes.js   # Core module class
│   ├── vibe-manager.js     # Coordinates all functionality
│   ├── line-of-sight.js    # Line of sight detection
│   ├── vibe-roller.js      # Vibe rolling system
│   ├── data-manager.js     # Data persistence
│   ├── messaging.js        # Notification system
│   ├── visual-effects.js   # Visual aura effects
│   ├── vibe-book.js        # UI application
│   └── connection-manager.js # Connection level management
├── styles/
│   └── pf2e-npc-vibes.css  # Module styles
├── templates/
│   └── vibe-book.hbs       # Handlebars templates
├── lang/
│   └── en.json             # Localization strings
└── docs/                   # Documentation files
```

### Coding Standards

#### JavaScript Style
- Use ES6+ features and modules
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Handle errors gracefully

#### Example:
```javascript
/**
 * Calculate vibe based on roll result
 * @param {number} rollValue - The d20 roll result
 * @returns {string} - The vibe type
 */
determineVibeType(rollValue) {
  if (rollValue === 1) return 'repulsed';
  if (rollValue >= 18) return rollValue === 20 ? 'awestruck' : 'curious';
  return 'none';
}
```

#### CSS Style
- Use BEM methodology for class naming
- Organize styles by component
- Use CSS custom properties for theming
- Ensure responsive design

#### Handlebars Templates
- Use semantic HTML
- Include accessibility attributes
- Keep logic minimal in templates
- Use localization strings

## Contributing Guidelines

### Types of Contributions

1. **Bug Reports**
   - Use the GitHub issue template
   - Include reproduction steps
   - Provide system information
   - Include console errors if applicable

2. **Feature Requests**
   - Describe the use case
   - Explain the expected behavior
   - Consider implementation complexity
   - Discuss with maintainers first for major features

3. **Code Contributions**
   - Follow the coding standards
   - Include tests when applicable
   - Update documentation
   - Ensure backward compatibility

### Pull Request Process

1. **Before Starting**
   - Check existing issues and PRs
   - Discuss major changes in an issue first
   - Ensure you understand the module architecture

2. **Development**
   - Create a feature branch: `git checkout -b feature/your-feature-name`
   - Make focused, atomic commits
   - Write clear commit messages
   - Test your changes thoroughly

3. **Submission**
   - Update documentation if needed
   - Add/update localization strings
   - Ensure no console errors
   - Create a pull request with:
     - Clear description of changes
     - Reference to related issues
     - Testing instructions

4. **Review Process**
   - Maintainers will review your PR
   - Address feedback promptly
   - Be open to suggestions and changes
   - Squash commits if requested

### Testing

#### Manual Testing
- Test in a clean Foundry world
- Test with multiple players
- Test edge cases (no tokens, hidden tokens, etc.)
- Test module compatibility

#### Test Scenarios
1. **Basic Functionality**
   - PC and NPC first sight
   - Vibe roll generation
   - Visual effect display
   - Notification delivery

2. **Edge Cases**
   - Tokens without actors
   - Hidden tokens
   - Tokens on different scenes
   - Module disable/enable

3. **Multiplayer**
   - Multiple connected players
   - GM and player perspectives
   - Data synchronization

## Localization

### Adding New Languages

1. Copy `lang/en.json` to `lang/[language-code].json`
2. Translate all strings
3. Add language entry to `module.json`
4. Test with Foundry's language settings

### Translation Guidelines
- Keep technical terms consistent
- Consider context and tone
- Test UI layout with translated text
- Use gender-neutral language when possible

## Documentation

### Types of Documentation

1. **Code Documentation**
   - JSDoc comments for all public methods
   - Inline comments for complex logic
   - README updates for new features

2. **User Documentation**
   - Update USAGE.md for new features
   - Update INSTALLATION.md for new requirements
   - Create examples and tutorials

3. **Developer Documentation**
   - Architecture decisions
   - API documentation
   - Integration guides

## Release Process

### Version Numbering
- Follow Semantic Versioning (SemVer)
- MAJOR.MINOR.PATCH format
- Update `module.json` version
- Update CHANGELOG.md
- **IMPORTANT**: Always increment version numbers for ANY improvements to ensure Forge VTT can detect updates

### Release Checklist
1. Test thoroughly in multiple scenarios
2. Update documentation
3. Update version numbers in `module.json` and `CHANGELOG.md`
4. Create release notes
5. Commit changes: `git add . && git commit -m "Version bump to vX.X.X"`
6. Tag the release: `git tag vX.X.X`
7. Push changes and tag: `git push origin main && git push origin vX.X.X`
8. GitHub Actions will automatically create the release with assets

### Forge VTT Compatibility
- Forge VTT checks for new releases based on version numbers
- Even minor documentation updates should increment the PATCH version
- This ensures users get notified of updates through Forge VTT's module manager

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Maintain a welcoming environment

### Communication
- Use GitHub issues for bug reports and feature requests
- Join discussions in a constructive manner
- Be patient with response times
- Provide clear and detailed information

## Getting Help

### Resources
- [Foundry VTT Module Development Guide](https://foundryvtt.com/article/module-development/)
- [PF2E System Documentation](https://github.com/foundryvtt/pf2e)
- [JavaScript ES6+ Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Contact
- GitHub Issues: For bugs and feature requests
- GitHub Discussions: For questions and general discussion
- Discord: [Foundry VTT Community](https://discord.gg/foundryvtt)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- GitHub contributors list
- Module credits (for significant contributions)

Thank you for helping make PF2E NPC Vibes better!
