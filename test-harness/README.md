# Test Harness for Date Range Reporter Plugin

This test harness allows you to test the Date Range Reporter plugin in isolation without needing the full Super Productivity application. It loads the plugin's `index.html` in an iframe and provides a mocked `PluginAPI` with sample data.

## Features

- 🎭 **Mocked PluginAPI**: Complete mock implementation of the Super Productivity PluginAPI
- 📊 **Sample Data**: Pre-generated sample tasks for testing
- 🎨 **Theme Testing**: Switch between light and dark themes
- 🔍 **API Monitoring**: Log all PluginAPI calls for debugging
- 🧪 **Test Scenarios**: Pre-configured test scenarios for common use cases
- 🔄 **Live Reload**: Reload the plugin without refreshing the entire page

## How to Use

### 1. Open the Test Harness

Simply open `test-harness/index.html` in your web browser:

```bash
# From the repository root
open test-harness/index.html
# or on Linux/WSL
xdg-open test-harness/index.html
```

Alternatively, if you have a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000
# Then navigate to http://localhost:8000/test-harness/

# Using Node.js (if npx is available)
npx http-server -p 8000
# Then navigate to http://localhost:8000/test-harness/
```

### 2. Test Controls

#### Theme Controls
- **☀️ Light** / **🌙 Dark**: Switch between light and dark themes to test theme compatibility

#### Sample Data
- **Load Sample Tasks**: Loads realistic sample tasks from the past 7 days
- **Clear All Tasks**: Removes all tasks to test empty states
- **Load Many Tasks (100)**: Loads 100 tasks across 30 days for stress testing

#### Test Scenarios
- **Test Last 7 Days**: Sets up the last 7 days with sample data
- **Test Last Month**: Sets up the last 30 days with 100 tasks
- **Test Empty Period**: Tests the plugin with no completed tasks

#### API Monitoring
- **Log API Calls**: Toggle logging of all PluginAPI method calls
- **Clear Logs**: Clear the API call log
- **Log Area**: Displays all API calls and events in real-time

#### Actions
- **🔄 Reload Plugin**: Reload the plugin iframe (useful after making changes)

### 3. Testing Workflow

1. **Load Sample Data**: Click "Load Sample Tasks" to populate with realistic data
2. **Test the Plugin**: Use the plugin interface on the right to generate reports
3. **Monitor API Calls**: Watch the log area to see what PluginAPI methods are called
4. **Try Different Scenarios**: Use the test scenario buttons to test edge cases
5. **Test Themes**: Switch between light and dark themes to ensure proper styling

## Mocked PluginAPI Methods

The mock implementation provides the following methods:

### `getTasks()`
Returns an array of active tasks. Each task has:
- `id`: Unique task identifier
- `title`: Task title
- `isDone`: Boolean indicating completion
- `doneOn`: Timestamp of completion
- `timeSpentOnDay`: Object mapping timestamps to milliseconds spent
- `notes`: Optional task notes

### `getArchivedTasks()`
Returns an array of archived tasks with the same structure as active tasks.

### `showSnack({ msg, type, ico })`
Displays a notification. Parameters:
- `msg`: Message to display
- `type`: 'SUCCESS', 'ERROR', or 'INFO'
- `ico`: Optional icon (currently logged only)

## File Structure

```
test-harness/
├── index.html           # Main test harness UI
├── mock-plugin-api.js   # Mock PluginAPI implementation
├── test-harness.js      # Test harness controller logic
└── README.md            # This file
```

## Development Tips

### Adding More Test Data

You can modify `mock-plugin-api.js` to add custom test scenarios:

```javascript
// In the browser console:
testHarness.mockAPI.addTask({
  id: 'custom-task-1',
  title: 'My custom test task',
  isDone: true,
  doneOn: Date.now(),
  timeSpentOnDay: { [Date.now()]: 3600000 }, // 1 hour
  notes: 'Custom notes here'
}, false); // false = active task, true = archived task

testHarness.updateTaskCounts();
```

### Debugging

1. Open browser DevTools (F12)
2. Enable "Log API Calls" in the test harness
3. Watch the console for detailed PluginAPI interactions
4. Check the log area for a summary of API calls

### Testing Changes

After modifying the plugin code:
1. Click the "🔄 Reload Plugin" button
2. The iframe will reload with your changes
3. The mocked PluginAPI will be re-injected automatically

## Known Limitations

- The mock PluginAPI doesn't persist data between reloads
- Some advanced PluginAPI features may not be fully mocked
- Cross-origin restrictions don't apply when files are loaded from the same origin
- **Cross-Origin Restrictions**: When running in restricted environments (like VS Code webviews), some features may have limited functionality:
  - Theme switching will set the preference but may not apply immediately
  - Test scenarios will load sample data but may require manual date selection
  - The test harness will show informational messages instead of errors in these cases

## Troubleshooting

### Plugin doesn't load
- Ensure you're opening the file from the correct location
- Check browser console for errors
- Verify the iframe source path is correct

### PluginAPI not working
- Check that "PluginAPI injected successfully" appears in the logs
- Verify the iframe has fully loaded before interacting
- Check browser console for injection errors

### Theme not switching or date ranges not setting automatically
- This is expected when running in restricted environments (e.g., VS Code webviews)
- The test harness will show an info message: "Theme preference set" or "manual date selection needed"
- You can still manually interact with the plugin controls in the iframe
- For full functionality, use a local HTTP server (see "How to Use" section above)

### Cross-origin errors in logs
- These are expected when running in certain environments
- The test harness gracefully handles these restrictions
- Use a local HTTP server (`python3 -m http.server`) for unrestricted access

## Contributing

To improve the test harness:
1. Add new test scenarios in `test-harness.js`
2. Extend the mock API in `mock-plugin-api.js`
3. Enhance the UI in `index.html`
4. Update this README with new features
