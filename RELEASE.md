# Release Process

This document describes how to create a new release of the Date Range Reporter plugin.

## Prerequisites

- Write access to the repository
- GitHub CLI installed (`gh`) - [Install guide](https://cli.github.com/)
- All changes committed and pushed to `main`/`master`

## Creating a Release

### Recommended Method: Single Command

```bash
# Make sure you're on the main branch with latest changes
git checkout main
git pull

# Build, tag, and create release in one go
make build && \
git tag -a v1.0.0 -m "Release v1.0.0" && \
git push origin v1.0.0 && \
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "Initial release of Date Range Reporter plugin" \
  date-range-reporter.zip
```

This will:
1. Build the plugin zip file
2. Create and push the git tag
3. Create the GitHub release
4. Upload the zip file to the release

### Alternative: Step by Step

```bash
# Step 1: Build the plugin
make build

# Step 2: Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Step 3: Create release and upload zip
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "Initial release of Date Range Reporter plugin" \
  date-range-reporter.zip
```

### Using GitHub Web Interface

1. **Build the plugin locally:**
   ```bash
   make build
   ```

2. **Go to your repository on GitHub**

3. **Click on "Releases"** in the right sidebar

4. **Click "Draft a new release"**

5. **Choose/Create a tag:**
   - Click "Choose a tag"
   - Type a new version (e.g., `v1.0.0`)
   - Click "Create new tag: v1.0.0 on publish"

6. **Fill in release details:**
   - **Release title:** e.g., "v1.0.0 - Initial Release"
   - **Description:** Add release notes, features, bug fixes, etc.

7. **Attach the zip file:**
   - Drag and drop `date-range-reporter.zip` into the assets area
   - Or click to browse and select the file

8. **Click "Publish release"**

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

**GitHub CLI not installed:**
```bash
# macOS
brew install gh

# Or download from: https://cli.github.com/
```

**Need to authenticate GitHub CLI:**
```bash
gh auth login
```

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

**Update an existing release:**
```bash
# Build new version
make build

# Upload (replace existing) zip to release
gh release upload v1.0.0 date-range-reporter.zip --clobber
```
