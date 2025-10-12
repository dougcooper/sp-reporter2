# Makefile for Date Range Reporter Plugin
# Builds a distributable zip file for Super Productivity

PLUGIN_DIR = date-range-reporter
ZIP_FILE = date-range-reporter.zip
VERSION := $(shell grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
DESCRIPTION := $(shell grep '"description"' package.json | sed 's/.*"description": "\(.*\)".*/\1/')
RELEASE_FILE = date-range-reporter-v$(VERSION).zip

.PHONY: build clean help release release-check

# Default target
build: clean
	@echo "Building plugin zip file..."
	@echo "Generating manifest.json from template..."
	@sed -e 's/{{VERSION}}/$(VERSION)/g' -e 's/{{DESCRIPTION}}/$(DESCRIPTION)/g' \
		$(PLUGIN_DIR)/manifest.json.template > $(PLUGIN_DIR)/manifest.json
	@cd $(PLUGIN_DIR) && zip -r ../$(ZIP_FILE) . -x "manifest.json.template"
	@echo "✓ Plugin packaged successfully: $(ZIP_FILE)"

# Clean up generated files
clean:
	@echo "Cleaning up..."
	@rm -f $(ZIP_FILE) date-range-reporter-v*.zip $(PLUGIN_DIR)/manifest.json
	@echo "✓ Cleaned"

# Pre-release checks
release-check:
	@echo "Checking prerequisites for release v$(VERSION)..."
	@if ! command -v gh >/dev/null 2>&1; then \
		echo "❌ Error: GitHub CLI (gh) is not installed"; \
		echo "   Install with: brew install gh"; \
		exit 1; \
	fi
	@if [ -z "$$(git status --porcelain)" ]; then \
		echo "✓ Working directory is clean"; \
	else \
		echo "❌ Error: Uncommitted changes found"; \
		echo "   Please commit or stash your changes first"; \
		exit 1; \
	fi
	@if git rev-parse "v$(VERSION)" >/dev/null 2>&1; then \
		echo "⚠️  Warning: Tag v$(VERSION) already exists"; \
		echo "   Delete it with: git tag -d v$(VERSION) && git push --delete origin v$(VERSION)"; \
		exit 1; \
	fi
	@echo "✓ All checks passed"

# Create a complete GitHub release (build, tag, push, and create release)
release: release-check build
	@echo ""
	@echo "════════════════════════════════════════════════════════════"
	@echo "Creating GitHub release v$(VERSION)"
	@echo "════════════════════════════════════════════════════════════"
	@echo ""
	@echo "→ Creating git tag v$(VERSION)..."
	@git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	@echo "✓ Tag created"
	@echo ""
	@echo "→ Pushing tag to origin..."
	@git push origin "v$(VERSION)"
	@echo "✓ Tag pushed"
	@echo ""
	@echo "→ Creating GitHub release..."
	@gh release create "v$(VERSION)" \
		--title "v$(VERSION)" \
		--notes "Release v$(VERSION) of Date Range Reporter plugin" \
		$(ZIP_FILE)
	@echo ""
	@echo "════════════════════════════════════════════════════════════"
	@echo "✓ Release v$(VERSION) created successfully!"
	@echo "════════════════════════════════════════════════════════════"
	@echo ""
	@echo "View at: https://github.com/$$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/tag/v$(VERSION)"

# Show help
help:
	@echo "Date Range Reporter Plugin - Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  make build         - Build the plugin zip file (default)"
	@echo "  make release       - Complete release process (v$(VERSION))"
	@echo "                       • Checks prerequisites"
	@echo "                       • Builds plugin zip"
	@echo "                       • Creates and pushes git tag"
	@echo "                       • Creates GitHub release"
	@echo "  make release-check - Verify release prerequisites"
	@echo "  make clean         - Remove generated zip files"
	@echo "  make help          - Show this help message"
	@echo ""
	@echo "Current version: $(VERSION)"
