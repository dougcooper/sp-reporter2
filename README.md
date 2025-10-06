# Date Range Reporter Plugin for Super Productivity

A plugin for [Super Productivity](https://super-productivity.com) that generates reports of completed tasks within a specified date range.

## Features

- 📅 Select custom date ranges for reporting
- 📊 View all tasks completed within the selected period
- 📋 Copy report to clipboard with one click
- ⏱️ Shows time spent on tasks (when available)
- 📈 Displays task completion statistics

## Installation

1. Download the plugin files
2. Open Super Productivity
3. Go to Settings → Plugins
4. Click "Load Plugin from Folder"
5. Select the `date-range-reporter` folder
6. The plugin will be activated automatically

## Usage

1. Click the "Task Report" button in the header (calendar icon)
2. Select your desired start and end dates
3. Click "Generate Report"
4. Review the report showing tasks grouped by completion date
5. Click "Copy to Clipboard" to copy the entire report in Markdown format

## Report Format

The generated report is formatted in Markdown and includes:
- Date range and generation timestamp
- Total number of completed tasks
- Tasks grouped by completion date with bullet points
- Time spent on each task (when tracked)

Example report:
```markdown
# Task Completion Report

**Date Range:** Monday, October 1, 2024 - Monday, October 7, 2024  
**Generated:** 10/7/2024, 3:30:00 PM  
**Total Tasks Completed:** 5

---

## Monday, October 1, 2024

- Complete project proposal *(45 min)*
- Review pull requests *(30 min)*

## Tuesday, October 2, 2024

*No tasks completed*

## Wednesday, October 3, 2024

- Write documentation *(120 min)*
- Fix bug in authentication *(60 min)*
- Team meeting notes *(15 min)*
```

The Markdown format makes it easy to paste into documentation, notes, or any Markdown-compatible application.
```

## Requirements

- Super Productivity version 14.0.0 or higher
- Modern web browser with clipboard API support

## Development

### Building the Plugin

```bash
# Build the plugin zip file
make build

# Clean up generated files
make clean

# Show all available commands
make help
```

### Creating a Release

To create a new release:

1. **Update the version** in `date-range-reporter/manifest.json`
2. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Release v1.x.x"
   git push
   ```
3. **Run the release command**:
   ```bash
   make release
   ```

The `make release` command will automatically:
- ✅ Verify prerequisites (GitHub CLI installed, clean working directory)
- 📦 Build the plugin zip file
- 🏷️ Create a git tag based on the version in manifest.json
- 🚀 Push the tag to GitHub
- 🎉 Create a GitHub release with the zip file attached

#### Prerequisites for Releases

- GitHub CLI (`gh`) installed: `brew install gh`
- GitHub CLI authenticated: `gh auth login`
- Write access to the repository
- Clean working directory (all changes committed)

#### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features, backwards compatible)
- `v1.0.1` - Patch release (bug fixes)

#### Troubleshooting Releases

**Tag already exists:**
```bash
git tag -d v1.0.0
git push --delete origin v1.0.0
make release
```

**Update an existing release:**
```bash
make build
gh release upload v1.0.0 date-range-reporter.zip --clobber
```

## Plugin Files

- `manifest.json` - Plugin configuration
- `plugin.js` - Header button registration
- `index.html` - Report UI interface
- `icon.svg` - Plugin icon
- `README.md` - This documentation

## Version

1.1.0

## Author

Super Productivity Community

## License

This plugin is provided as-is for use with Super Productivity.

