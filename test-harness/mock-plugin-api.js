// Mock PluginAPI for testing
// This provides a simulated version of the Super Productivity PluginAPI

class MockPluginAPI {
  constructor() {
    this.activeTasks = [];
    this.archivedTasks = [];
    this.logCallback = null;
  }

  // Set logging callback
  setLogCallback(callback) {
    this.logCallback = callback;
  }

  // Log API calls
  log(method, ...args) {
    if (this.logCallback) {
      this.logCallback(method, args);
    }
  }

  // Get active tasks
  async getTasks() {
    this.log('getTasks');
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.activeTasks]), 100);
    });
  }

  // Get archived tasks
  async getArchivedTasks() {
    this.log('getArchivedTasks');
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.archivedTasks]), 100);
    });
  }

  // Show snackbar notification
  showSnack({ msg, type = 'INFO', ico = null }) {
    this.log('showSnack', { msg, type, ico });
    console.log(`[${type}] ${msg}`, ico || '');
    
    // Visual feedback in console
    const styles = {
      SUCCESS: 'color: #4caf50; font-weight: bold;',
      ERROR: 'color: #f44336; font-weight: bold;',
      INFO: 'color: #2196f3; font-weight: bold;',
    };
    console.log(`%c[PluginAPI.showSnack] ${type}: ${msg}`, styles[type] || styles.INFO);
  }

  // Show index.html as view (not used in iframe context, but included for completeness)
  showIndexHtmlAsView() {
    this.log('showIndexHtmlAsView');
    console.log('[PluginAPI] showIndexHtmlAsView called');
  }

  // Set active tasks (for testing)
  setActiveTasks(tasks) {
    this.activeTasks = tasks;
  }

  // Set archived tasks (for testing)
  setArchivedTasks(tasks) {
    this.archivedTasks = tasks;
  }

  // Add a single task (for testing)
  addTask(task, isArchived = false) {
    if (isArchived) {
      this.archivedTasks.push(task);
    } else {
      this.activeTasks.push(task);
    }
  }

  // Clear all tasks
  clearAllTasks() {
    this.activeTasks = [];
    this.archivedTasks = [];
  }

  // Generate sample tasks
  generateSampleTasks() {
    const now = new Date();
    const tasks = [];

    // Tasks from 7 days ago
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const tasksPerDay = Math.floor(Math.random() * 4) + 1; // 1-4 tasks per day
      
      for (let j = 0; j < tasksPerDay; j++) {
        const doneOn = date.getTime();
        const timeSpentOnDay = Math.floor(Math.random() * 120) * 60 * 1000; // 0-120 minutes
        
        const taskNames = [
          'Review pull requests',
          'Update documentation',
          'Fix bug in authentication',
          'Write unit tests',
          'Team meeting',
          'Code review',
          'Implement new feature',
          'Refactor legacy code',
          'Update dependencies',
          'Deploy to staging',
          'Client call',
          'Planning session',
          'Performance optimization',
          'Security audit',
          'Database migration',
        ];

        const notes = Math.random() > 0.5 ? [
          'Made good progress on this',
          'Encountered some issues but resolved them',
          'Collaborated with team members',
          'Need to follow up on this tomorrow',
          'Completed ahead of schedule',
          'More complex than expected',
        ][Math.floor(Math.random() * 6)] : '';

        const task = {
          id: `task-${date.getTime()}-${j}`,
          title: taskNames[Math.floor(Math.random() * taskNames.length)],
          isDone: true,
          doneOn: doneOn,
          timeSpentOnDay: { [doneOn]: timeSpentOnDay },
          notes: notes,
        };

        // Randomly assign to active or archived
        tasks.push({ task, isArchived: Math.random() > 0.5 });
      }
    }

    return tasks;
  }

  // Generate many tasks for stress testing
  generateManyTasks(count = 100) {
    const now = new Date();
    const tasks = [];
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    for (let i = 0; i < count; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now);
      date.setDate(date.getDate() - randomDaysAgo);
      
      const doneOn = date.getTime();
      const timeSpentOnDay = Math.floor(Math.random() * 180) * 60 * 1000; // 0-180 minutes

      const task = {
        id: `task-${i}`,
        title: `Task ${i + 1} - ${['Development', 'Testing', 'Documentation', 'Meeting', 'Review'][i % 5]}`,
        isDone: true,
        doneOn: doneOn,
        timeSpentOnDay: { [doneOn]: timeSpentOnDay },
        notes: i % 3 === 0 ? `Notes for task ${i + 1}` : '',
      };

      tasks.push({ task, isArchived: i % 2 === 0 });
    }

    return tasks;
  }
}

// Export for use in test harness
window.MockPluginAPI = MockPluginAPI;
