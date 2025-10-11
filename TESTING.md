# Testing Guide

This document provides detailed information about the test suite for the Date Range Reporter plugin.

## Overview

The plugin uses [Vitest](https://vitest.dev/) as the testing framework. The codebase has been refactored to support dependency injection, making it fully testable with comprehensive unit tests.

## Test Statistics

- **Total Tests:** 48
- **Test Files:** 4
- **Code Coverage:** ~89%
- **Testing Framework:** Vitest v1.0.4
- **Environment:** happy-dom (browser-like environment)

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test
# or
make test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Output

When you run tests, you'll see output like:

```
✓ tests/dateUtils.test.js  (13 tests)
✓ tests/reportGenerator.test.js  (14 tests)
✓ tests/reportStorage.test.js  (18 tests)
✓ tests/plugin.test.js  (3 tests)

Test Files  4 passed (4)
     Tests  48 passed (48)
```

## Test Suite Structure

### 1. Date Utilities Tests (`tests/dateUtils.test.js`)

Tests the date formatting and manipulation functions:

- **formatDate** - Converting Date objects to YYYY-MM-DD strings
  - Standard dates
  - Single-digit months and days (zero-padding)
  - Edge cases (year boundaries, leap years)

- **formatDateDisplay** - Converting date strings to human-readable format
  - Standard dates → "Monday, January 15, 2024"
  - Different months and years
  - Leap year dates

- **getDateRange** - Generating arrays of dates for a range
  - Single-day ranges
  - Multi-day ranges
  - Month boundaries
  - Year boundaries
  - Leap year February handling

### 2. Report Generator Tests (`tests/reportGenerator.test.js`)

Tests the core report generation logic:

- **Input Validation**
  - Date range validation (start before end)
  - Error handling for invalid inputs

- **Report Generation**
  - Empty reports (no tasks)
  - Single task reports
  - Multi-task reports
  - Reports with different time formats (hours, minutes, hours+minutes)

- **Task States**
  - Completed tasks
  - Work-in-progress (WIP) tasks
  - Tasks with notes (included/excluded)

- **Work Logs**
  - Tasks with single work log
  - Tasks with multiple work logs across dates
  - Tasks with work logs only (not completed)

- **Edge Cases**
  - Tasks outside date range (filtered out)
  - Archived and active tasks combined
  - Duplicate task handling
  - Timestamp generation

### 3. Report Storage Tests (`tests/reportStorage.test.js`)

Tests the report persistence and management:

- **Loading Reports**
  - Loading from empty storage
  - Loading saved reports
  - Error handling

- **Saving Reports**
  - Creating new reports
  - Updating existing reports
  - ID generation for new reports
  - Report ordering (newest first)
  - Include/exclude notes flag

- **Deleting Reports**
  - Single report deletion
  - Bulk deletion
  - Non-existent report handling
  - Persistence optimization (no save when nothing deleted)

- **Report Retrieval**
  - Getting all reports
  - Getting specific report by ID
  - Array immutability (returns copies)

### 4. Plugin Tests (`tests/plugin.test.js`)

Tests the plugin initialization:

- **Header Button Registration**
  - Button creation
  - Configuration correctness (ID, label, icon)
  - Click handler functionality

## Mock PluginAPI

The test suite includes a comprehensive mock implementation of the Super Productivity PluginAPI (`tests/mockPluginAPI.js`):

```javascript
const mockAPI = createMockPluginAPI();

// Task operations
mockAPI.getTasks()
mockAPI.getArchivedTasks()

// Storage operations
mockAPI.persistDataSynced(data)
mockAPI.loadSyncedData()

// UI operations
mockAPI.showSnack({ msg, type, ico })
mockAPI.showIndexHtmlAsView()
mockAPI.registerHeaderButton(config)

// Test helpers
mockAPI._setTasks([...])
mockAPI._setArchivedTasks([...])
mockAPI._getSnacks()
mockAPI._clearStorage()
```

## Code Coverage

The test suite achieves ~89% code coverage:

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|----------
All files          |   89.18 |    85.71 |   93.33 |   89.18
 src               |   92.36 |    86.95 |     100 |   92.36
  dateUtils.js     |     100 |      100 |     100 |     100
  plugin.js        |   91.66 |    66.66 |     100 |   91.66
  reportGenerator  |   87.11 |    81.57 |     100 |   87.11
  reportStorage.js |   97.69 |    95.83 |     100 |   97.69
```

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Text** - Console output
- **JSON** - `coverage/coverage-final.json`
- **HTML** - `coverage/index.html` (open in browser for detailed view)

View the HTML coverage report:

```bash
npm run test:coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Continuous Integration

Tests run automatically via GitHub Actions:

### Test Workflow (`.github/workflows/test.yml`)

Triggers:
- Push to `main` or `master` branches
- Pull requests to `main` or `master`
- Manual workflow dispatch

Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Run tests
5. Run tests with coverage
6. Upload coverage reports (optional)

## Writing New Tests

When adding new functionality, follow these patterns:

### 1. Test File Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '../src/module.js';

describe('moduleName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = '...';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 2. Using Mocks

```javascript
import { createMockPluginAPI } from './mockPluginAPI.js';

let mockAPI;

beforeEach(() => {
  mockAPI = createMockPluginAPI();
});

it('should interact with PluginAPI', async () => {
  mockAPI._setTasks([{ id: '1', title: 'Test' }]);
  
  const tasks = await mockAPI.getTasks();
  
  expect(tasks).toHaveLength(1);
  expect(mockAPI.getTasks).toHaveBeenCalled();
});
```

### 3. Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 4. Testing Errors

```javascript
it('should throw error on invalid input', () => {
  expect(() => {
    functionThatThrows('invalid');
  }).toThrow('Expected error message');
});
```

## Troubleshooting

### Tests Failing Locally

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Clear any cached data:
   ```bash
   rm -rf node_modules coverage .vitest
   npm install
   ```

3. Run tests with verbose output:
   ```bash
   npm test -- --reporter=verbose
   ```

### Coverage Not Generated

Ensure `@vitest/coverage-v8` is installed:
```bash
npm install --save-dev @vitest/coverage-v8
```

### CI Tests Failing

1. Check the GitHub Actions log for specific errors
2. Ensure `package-lock.json` is committed
3. Verify Node.js version compatibility (using v20)

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
3. **Isolation**: Each test should be independent and not rely on others
4. **Mocking**: Use mocks to isolate the code under test
5. **Edge Cases**: Include tests for boundary conditions and error scenarios
6. **Coverage**: Aim for high coverage but prioritize meaningful tests over 100% coverage

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Happy DOM](https://github.com/capricorn86/happy-dom)
- [Testing Best Practices](https://vitest.dev/guide/best-practices.html)
