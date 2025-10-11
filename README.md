# Date Range Reporter Plugin for Super Productivity

A plugin for [Super Productivity](https://super-productivity.com) that generates reports of completed tasks and tasks with work logs within a specified date range.

## Features

- 📅 Select custom date ranges for reporting
- 📊 View all tasks completed or worked on within the selected period
- ⏳ Includes in-progress tasks that have work logs in the date range
- ✏️ Edit generated reports in a modal popup
- 💾 Save reports for future reference
- 📋 Copy report to clipboard with one click
- 📁 View and manage saved reports
- 🗑️ Delete individual or multiple saved reports
- ⏱️ Shows time spent on tasks (when available)
- 📈 Displays task statistics
- 📝 Optional inclusion of task notes in reports
- 🔄 Reports are synced across devices using Super Productivity's persistence API

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
4. The report will appear in a modal popup showing:
   - Tasks grouped by date (completed tasks and tasks with work logs)
   - In-progress tasks marked with WIP indicator
   - Time spent on each task (when tracked)
   - Optional task notes (when enabled)
5. **Edit the report** as needed - add comments, modify content, or reorganize tasks
6. **Save the report** with a custom name for future reference
7. **Copy to Clipboard** to paste the report in Markdown format anywhere
8. **Manage saved reports** in the list below the date range selection:
   - Click on a saved report to view/edit it
   - Delete individual reports with the 🗑️ button
   - Select multiple reports and delete them all at once

## Report Format

The generated report is formatted in Markdown and includes:
- Date range and generation timestamp
- Total number of tasks (both completed and with work logs)
- Tasks grouped by date with bullet points
- Individual work log entries for tasks with multiple work logs
- WIP indicator for work in progress entries (before task completion)
- Time spent on each task (when tracked)
- Optional task notes (when enabled)

Example report:
```markdown
# Task Completion Report

**Date Range:** Monday, October 1, 2024 - Monday, October 7, 2024  
**Generated:** 10/7/2024, 3:30:00 PM  
**Total Tasks:** 6
*Note: Individual work log entries are shown for tasks with multiple work logs. WIP indicates work in progress.*

---

## Monday, October 1, 2024

- Complete project proposal *(45 min)*
- Review pull requests *(30 min)*
  Reviewed PRs #123 and #124, left feedback on both

## Tuesday, October 2, 2024

*No tasks*

## Wednesday, October 3, 2024

- Write documentation *(120 min)*
  Updated API docs and added examples for new endpoints
- Refactor API endpoints *(60 min)* WIP

## Thursday, October 4, 2024

- Refactor API endpoints *(90 min)* WIP

## Friday, October 5, 2024

- Refactor API endpoints *(120 min)*
- Fix bug in authentication *(60 min)*
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

1.4.0

## Author

Super Productivity Community

## License

This plugin is provided as-is for use with Super Productivity.

