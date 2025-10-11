/**
 * Mock PluginAPI for testing
 */

export function createMockPluginAPI() {
  let storage = {};
  let tasks = [];
  let archivedTasks = [];
  const snacks = [];
  let headerButtons = [];

  return {
    // Task operations
    getTasks: vi.fn(async () => tasks),
    getArchivedTasks: vi.fn(async () => archivedTasks),
    
    // Storage operations
    persistDataSynced: vi.fn(async (data) => {
      storage.syncedData = data;
    }),
    loadSyncedData: vi.fn(async () => {
      return storage.syncedData || null;
    }),
    
    // UI operations
    showSnack: vi.fn(({ msg, type, ico }) => {
      snacks.push({ msg, type, ico });
    }),
    showIndexHtmlAsView: vi.fn(() => {}),
    registerHeaderButton: vi.fn((config) => {
      headerButtons.push(config);
    }),
    
    // Test helpers
    _setTasks: (newTasks) => {
      tasks = newTasks;
    },
    _setArchivedTasks: (newArchivedTasks) => {
      archivedTasks = newArchivedTasks;
    },
    _getSnacks: () => [...snacks],
    _clearSnacks: () => {
      snacks.length = 0;
    },
    _getStorage: () => ({ ...storage }),
    _clearStorage: () => {
      storage = {};
    },
    _getHeaderButtons: () => [...headerButtons],
  };
}
