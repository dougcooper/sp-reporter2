// Test Harness Controller
// Manages the test harness UI and injects the mock PluginAPI into the iframe

class TestHarness {
  constructor() {
    this.mockAPI = new MockPluginAPI();
    this.iframe = null;
    this.logEnabled = true;
    this.isDarkTheme = false;

    this.init();
  }

  init() {
    // Get iframe reference
    this.iframe = document.getElementById('pluginFrame');

    // Set up logging
    this.mockAPI.setLogCallback((method, args) => {
      if (this.logEnabled) {
        this.logApiCall(method, args);
      }
    });

    // Wait for iframe to load, then inject PluginAPI
    this.iframe.addEventListener('load', () => {
      this.injectPluginAPI();
    });

    // Set up UI controls
    this.setupControls();
  }

  injectPluginAPI() {
    try {
      // Inject the mock PluginAPI into the iframe's window
      this.iframe.contentWindow.PluginAPI = this.mockAPI;
      this.logInfo('PluginAPI injected successfully');
    } catch (error) {
      this.logError('Failed to inject PluginAPI: ' + error.message);
    }
  }

  setupControls() {
    // Theme controls
    document.getElementById('lightThemeBtn').addEventListener('click', () => {
      this.setTheme('light');
    });

    document.getElementById('darkThemeBtn').addEventListener('click', () => {
      this.setTheme('dark');
    });

    // Sample data controls
    document.getElementById('loadSampleDataBtn').addEventListener('click', () => {
      this.loadSampleData();
    });

    document.getElementById('loadEmptyDataBtn').addEventListener('click', () => {
      this.loadEmptyData();
    });

    document.getElementById('loadManyTasksBtn').addEventListener('click', () => {
      this.loadManyTasks();
    });

    // Test scenario controls
    document.getElementById('testDateRangeBtn').addEventListener('click', () => {
      this.testLast7Days();
    });

    document.getElementById('testMonthBtn').addEventListener('click', () => {
      this.testLastMonth();
    });

    document.getElementById('testNoTasksBtn').addEventListener('click', () => {
      this.testEmptyPeriod();
    });

    // Monitoring controls
    document.getElementById('logApiCalls').addEventListener('change', (e) => {
      this.logEnabled = e.target.checked;
    });

    document.getElementById('clearLogsBtn').addEventListener('click', () => {
      this.clearLogs();
    });

    // Reload control
    document.getElementById('reloadIframeBtn').addEventListener('click', () => {
      this.reloadIframe();
    });

    // Load initial sample data
    this.loadSampleData();
  }

  setTheme(theme) {
    this.isDarkTheme = theme === 'dark';
    
    // Update theme toggle buttons
    document.getElementById('lightThemeBtn').classList.toggle('active', !this.isDarkTheme);
    document.getElementById('darkThemeBtn').classList.toggle('active', this.isDarkTheme);

    // Apply theme to iframe
    try {
      const iframeBody = this.iframe.contentWindow.document.body;
      if (this.isDarkTheme) {
        iframeBody.classList.add('dark-theme');
      } else {
        iframeBody.classList.remove('dark-theme');
      }
      this.logInfo(`Theme changed to ${theme}`);
    } catch (error) {
      this.logError('Failed to change theme: ' + error.message);
    }
  }

  loadSampleData() {
    const sampleTasks = this.mockAPI.generateSampleTasks();
    
    this.mockAPI.clearAllTasks();
    
    sampleTasks.forEach(({ task, isArchived }) => {
      this.mockAPI.addTask(task, isArchived);
    });

    this.updateTaskCounts();
    this.logSuccess(`Loaded ${sampleTasks.length} sample tasks`);
  }

  loadEmptyData() {
    this.mockAPI.clearAllTasks();
    this.updateTaskCounts();
    this.logInfo('Cleared all tasks');
  }

  loadManyTasks() {
    const manyTasks = this.mockAPI.generateManyTasks(100);
    
    this.mockAPI.clearAllTasks();
    
    manyTasks.forEach(({ task, isArchived }) => {
      this.mockAPI.addTask(task, isArchived);
    });

    this.updateTaskCounts();
    this.logSuccess('Loaded 100 tasks for stress testing');
  }

  testLast7Days() {
    this.logInfo('Test scenario: Last 7 days');
    this.loadSampleData();
    
    // Set date inputs in iframe to last 7 days
    try {
      const iframeDoc = this.iframe.contentWindow.document;
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      
      const startInput = iframeDoc.getElementById('startDate');
      const endInput = iframeDoc.getElementById('endDate');
      
      if (startInput && endInput) {
        startInput.valueAsDate = sevenDaysAgo;
        endInput.valueAsDate = today;
        this.logSuccess('Date range set to last 7 days');
      }
    } catch (error) {
      this.logError('Failed to set date range: ' + error.message);
    }
  }

  testLastMonth() {
    this.logInfo('Test scenario: Last month');
    this.loadManyTasks();
    
    // Set date inputs in iframe to last 30 days
    try {
      const iframeDoc = this.iframe.contentWindow.document;
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);
      
      const startInput = iframeDoc.getElementById('startDate');
      const endInput = iframeDoc.getElementById('endDate');
      
      if (startInput && endInput) {
        startInput.valueAsDate = thirtyDaysAgo;
        endInput.valueAsDate = today;
        this.logSuccess('Date range set to last 30 days');
      }
    } catch (error) {
      this.logError('Failed to set date range: ' + error.message);
    }
  }

  testEmptyPeriod() {
    this.logInfo('Test scenario: Empty period (no tasks)');
    this.loadEmptyData();
    
    // Set date inputs to a recent range
    try {
      const iframeDoc = this.iframe.contentWindow.document;
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      
      const startInput = iframeDoc.getElementById('startDate');
      const endInput = iframeDoc.getElementById('endDate');
      
      if (startInput && endInput) {
        startInput.valueAsDate = sevenDaysAgo;
        endInput.valueAsDate = today;
        this.logSuccess('Date range set with no tasks to test empty state');
      }
    } catch (error) {
      this.logError('Failed to set date range: ' + error.message);
    }
  }

  updateTaskCounts() {
    document.getElementById('activeTaskCount').textContent = this.mockAPI.activeTasks.length;
    document.getElementById('archivedTaskCount').textContent = this.mockAPI.archivedTasks.length;
  }

  reloadIframe() {
    this.logInfo('Reloading plugin iframe...');
    this.iframe.src = this.iframe.src;
  }

  // Logging methods
  logApiCall(method, args) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry info';
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] API: ${method}(${args.length > 0 ? '...' : ''})`;
    this.appendLog(logEntry);
  }

  logSuccess(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry success';
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ✓ ${message}`;
    this.appendLog(logEntry);
  }

  logError(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry error';
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ✗ ${message}`;
    this.appendLog(logEntry);
  }

  logInfo(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ℹ ${message}`;
    this.appendLog(logEntry);
  }

  appendLog(logEntry) {
    const logArea = document.getElementById('logArea');
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;
  }

  clearLogs() {
    document.getElementById('logArea').innerHTML = '';
    this.logInfo('Logs cleared');
  }
}

// Initialize test harness when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.testHarness = new TestHarness();
});
