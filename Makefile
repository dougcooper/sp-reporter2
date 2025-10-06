# Makefile for Date Range Reporter Plugin
# Builds a distributable zip file for Super Productivity

PLUGIN_DIR = date-range-reporter
ZIP_FILE = date-range-reporter.zip

.PHONY: build clean help

# Default target
build: clean
	@echo "Building plugin zip file..."
	@cd $(PLUGIN_DIR) && zip -r ../$(ZIP_FILE) .
	@echo "✓ Plugin packaged successfully: $(ZIP_FILE)"

# Clean up generated files
clean:
	@echo "Cleaning up..."
	@rm -f $(ZIP_FILE)
	@echo "✓ Cleaned"

# Show help
help:
	@echo "Date Range Reporter Plugin - Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  make build   - Build the plugin zip file (default)"
	@echo "  make clean   - Remove generated zip file"
	@echo "  make help    - Show this help message"
