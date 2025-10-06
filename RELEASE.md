# Release Process

This document describes how to create a new release of the Date Range Reporter plugin.

## Prerequisites

- Write access to the repository
- All changes committed and pushed to `main`/`master`

## Creating a Release

### Method 1: Using GitHub CLI (Recommended)

```bash
# Make sure you're on the main branch with latest changes
git checkout main
git pull

# Create and push a new tag
git tag -a v1.0.0 -m "Release v1.0.0 - Initial release"
git push origin v1.0.0

# Create the release using GitHub CLI
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "Initial release of Date Range Reporter plugin"
```

The GitHub Action will automatically:
1. Build the plugin
2. Attach `date-range-reporter.zip` to the release

### Method 2: Using GitHub Web Interface

1. **Go to your repository on GitHub**

2. **Click on "Releases"** in the right sidebar

3. **Click "Create a new release"** or "Draft a new release"

4. **Choose/Create a tag:**
   - Click "Choose a tag"
   - Type a new version (e.g., `v1.0.0`)
   - Click "Create new tag: v1.0.0 on publish"

5. **Fill in release details:**
   - **Release title:** e.g., "v1.0.0 - Initial Release"
   - **Description:** Add release notes, features, bug fixes, etc.

6. **Click "Publish release"**

7. **Wait for GitHub Action:**
   - The workflow will automatically run
   - The `date-range-reporter.zip` will be attached to the release
   - Check the "Actions" tab to monitor progress

### Method 3: Manual Release with Asset

If you want to manually upload the zip:

```bash
# Build locally
make build

# Create release using GitHub CLI and upload the zip
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "Initial release of Date Range Reporter plugin" \
  date-range-reporter.zip
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features, backwards compatible)
- `v1.0.1` - Patch release (bug fixes)

## Release Checklist

Before creating a release:

- [ ] Update version in `manifest.json`
- [ ] Update CHANGELOG or release notes
- [ ] Test the plugin thoroughly
- [ ] Commit all changes
- [ ] Push to main branch
- [ ] Create and push version tag
- [ ] Create GitHub release
- [ ] Verify zip file is attached to release

## Example Release Notes Template

```markdown
## What's New

- Feature: Added dark theme support
- Feature: Markdown formatted reports
- Improvement: Better icon display

## Bug Fixes

- Fixed icon rendering in sidebar
- Fixed date range validation

## Installation

1. Download `date-range-reporter.zip` from the assets below
2. Extract the zip file
3. In Super Productivity: Settings → Plugins → "Load Plugin from Folder"
4. Select the extracted folder

## Requirements

- Super Productivity version 14.0.0 or higher
```

## Troubleshooting

**Release doesn't have zip file attached:**
- Check the Actions tab for workflow errors
- Ensure the workflow has completed successfully
- Try re-running the workflow

**Tag already exists:**
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push --delete origin v1.0.0

# Create new tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```
