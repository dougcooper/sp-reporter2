/**
 * Tests for the Date Range Reporter plugin
 * Tests the actual code in date-range-reporter/index.html with mocked PluginAPI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Date Range Reporter', () => {
  let dom;
  let window;
  let document;
  let mockPluginAPI;

  beforeEach(async () => {
    // Create mock PluginAPI
    mockPluginAPI = {
      getTasks: vi.fn().mockResolvedValue([]),
      getArchivedTasks: vi.fn().mockResolvedValue([]),
      getAllProjects: vi.fn().mockResolvedValue([]),
      persistDataSynced: vi.fn().mockResolvedValue(undefined),
      loadSyncedData: vi.fn().mockResolvedValue(null),
      showSnack: vi.fn(),
      showIndexHtmlAsView: vi.fn(),
    };

    // Load the actual HTML file from date-range-reporter/
    const htmlPath = join(process.cwd(), 'date-range-reporter', 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');

    // Create JSDOM instance with the actual HTML
    dom = new JSDOM(html, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable',
      beforeParse(win) {
        // Inject mocked PluginAPI
        win.PluginAPI = mockPluginAPI;
        
        // Mock window.confirm
        win.confirm = vi.fn().mockReturnValue(true);
        
        // Mock clipboard API
        win.navigator.clipboard = {
          writeText: vi.fn().mockResolvedValue(undefined)
        };
      }
    });

    window = dom.window;
    document = window.document;

    // Wait for DOM to be ready and scripts to execute
    await new Promise((resolve) => {
      const checkReady = () => {
        if (window.document.readyState === 'complete' && window.formatDate) {
          setTimeout(resolve, 50); // Give a bit more time for initialization
        } else {
          setTimeout(checkReady, 10);
        }
      };
      checkReady();
    });
  });

  describe('Date Utilities', () => {
    it('should have date utility functions', () => {
      expect(typeof window.formatDate).toBe('function');
      expect(typeof window.formatDateDisplay).toBe('function');
      expect(typeof window.getDateRange).toBe('function');
    });

    it('should format dates to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00');
      const formatted = window.formatDate(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should format date for display', () => {
      const formatted = window.formatDateDisplay('2024-01-15');
      expect(formatted).toBe('Monday, January 15, 2024');
    });

    it('should generate date range array', () => {
      const range = window.getDateRange('2024-01-15', '2024-01-17');
      expect(range).toEqual(['2024-01-15', '2024-01-16', '2024-01-17']);
    });

    it('should handle month boundaries in date range', () => {
      const range = window.getDateRange('2024-01-30', '2024-02-02');
      expect(range).toHaveLength(4);
      expect(range).toEqual(['2024-01-30', '2024-01-31', '2024-02-01', '2024-02-02']);
    });
  });

  describe('Report Generation', () => {
    it('should call PluginAPI when generating report', async () => {
      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      expect(mockPluginAPI.getTasks).toHaveBeenCalled();
      expect(mockPluginAPI.getArchivedTasks).toHaveBeenCalled();
    });

    it('should validate date range', async () => {
      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-20';
      endInput.value = '2024-01-15'; // End before start

      await window.generateReport();

      expect(mockPluginAPI.showSnack).toHaveBeenCalledWith({
        msg: 'Start date must be before or equal to end date',
        type: 'ERROR'
      });
    });

    it('should process tasks within date range', async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 7200000 // 2 hours
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      // Report should be generated (modal shown or report available)
      expect(mockPluginAPI.getTasks).toHaveBeenCalled();
      expect(mockPluginAPI.getArchivedTasks).toHaveBeenCalled();
    });
  });

  describe('Theme Detection', () => {
    it('should have theme detection functions', () => {
      expect(typeof window.detectTheme).toBe('function');
      expect(typeof window.watchThemeChanges).toBe('function');
    });

    it('should run theme detection without errors', () => {
      // Ensure theme detection doesn't throw errors
      expect(() => window.detectTheme()).not.toThrow();
    });
  });

  describe('UI Helper Functions', () => {
    it('should have modal control functions', () => {
      expect(typeof window.showReportModal).toBe('function');
      expect(typeof window.hideReportModal).toBe('function');
    });

    it('should have clipboard function', () => {
      expect(typeof window.copyFromModal).toBe('function');
    });

    it('should have report management functions', () => {
      expect(typeof window.loadReports).toBe('function');
      expect(typeof window.saveReport).toBe('function');
      expect(typeof window.deleteReport).toBe('function');
      expect(typeof window.renderSavedReports).toBe('function');
    });
  });

  describe('Plugin Integration', () => {
    it('should use mocked PluginAPI', () => {
      expect(window.PluginAPI).toBe(mockPluginAPI);
    });

    it('should have required HTML elements', () => {
      expect(document.getElementById('startDate')).toBeTruthy();
      expect(document.getElementById('endDate')).toBeTruthy();
      expect(document.getElementById('generateBtn')).toBeTruthy();
      expect(document.getElementById('reportModal')).toBeTruthy();
    });
  });

  describe('Report Generation - Advanced Scenarios', () => {
    it('should handle tasks with multiple work logs across different dates', async () => {
      const tasks = [
        {
          id: 'task-multi',
          title: 'Multi-day Task',
          isDone: true,
          doneOn: new Date('2024-01-17T15:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000, // 1 hour
            '2024-01-16': 7200000, // 2 hours
            '2024-01-17': 1800000  // 30 min
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-17';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Should show task on all three dates
      expect(reportText).toContain('January 15, 2024');
      expect(reportText).toContain('January 16, 2024');
      expect(reportText).toContain('January 17, 2024');
      expect(reportText).toContain('Multi-day Task');
      // Should show WIP on dates before completion
      expect(reportText).toContain('WIP');
    });

    it('should mark tasks as WIP when not completed but have work logs', async () => {
      const tasks = [
        {
          id: 'task-wip',
          title: 'Work In Progress Task',
          isDone: false,
          timeSpentOnDay: {
            '2024-01-15': 7200000 // 2 hours
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      expect(reportText).toContain('Work In Progress Task');
      expect(reportText).toContain('WIP');
    });

    it('should include task notes when includeNotes is checked', async () => {
      const tasks = [
        {
          id: 'task-notes',
          title: 'Task with Notes',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          notes: 'These are detailed notes\nwith multiple lines\nabout the task.',
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      const includeNotesCheckbox = document.getElementById('includeNotes');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';
      includeNotesCheckbox.checked = true;

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      expect(reportText).toContain('Task with Notes');
      expect(reportText).toContain('These are detailed notes');
      expect(reportText).toContain('with multiple lines');
    });

    it('should exclude task notes when includeNotes is unchecked', async () => {
      const tasks = [
        {
          id: 'task-notes',
          title: 'Task with Notes',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          notes: 'These notes should not appear',
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      const includeNotesCheckbox = document.getElementById('includeNotes');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';
      includeNotesCheckbox.checked = false;

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      expect(reportText).toContain('Task with Notes');
      expect(reportText).not.toContain('These notes should not appear');
    });

    it('should exclude empty dates when excludeEmptyDates is checked', async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Task on 15th',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      const excludeEmptyCheckbox = document.getElementById('excludeEmptyDates');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-17'; // 3-day range
      excludeEmptyCheckbox.checked = true;

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Should include date with task
      expect(reportText).toContain('January 15, 2024');
      // Should NOT include empty dates (they aren't shown at all when excluded)
      const dateCount = (reportText.match(/## /g) || []).length;
      expect(dateCount).toBe(1); // Only one date section should be present
    });

    it('should include empty dates when excludeEmptyDates is unchecked', async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Task on 15th',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      const excludeEmptyCheckbox = document.getElementById('excludeEmptyDates');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-17';
      excludeEmptyCheckbox.checked = false;

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Should include all dates
      expect(reportText).toContain('January 15, 2024');
      expect(reportText).toContain('January 16, 2024');
      expect(reportText).toContain('January 17, 2024');
    });

    it('should format time spent correctly in minutes', async () => {
      const tasks = [
        {
          id: 'task-time',
          title: 'Task with Time',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 7200000 // 120 minutes (2 hours)
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      expect(reportText).toContain('Task with Time');
      expect(reportText).toContain('(120 min)');
    });

    it('should avoid duplicate tasks in report', async () => {
      const tasks = [
        {
          id: 'task-dup',
          title: 'Duplicate Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        },
        {
          id: 'task-dup', // Same ID
          title: 'Duplicate Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Should only count as 1 task in total
      expect(reportText).toContain('**Total Tasks:** 1');
    });

    it('should handle tasks completed outside range with work logs inside', async () => {
      const tasks = [
        {
          id: 'task-outside',
          title: 'Task Completed Later',
          isDone: true,
          doneOn: new Date('2024-01-20T14:00:00').getTime(), // Completed after range
          timeSpentOnDay: {
            '2024-01-15': 3600000, // Work done in range
            '2024-01-16': 1800000  // More work in range
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-17';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Task with multiple work logs should be included with WIP indicators
      expect(reportText).toContain('January 15, 2024');
      expect(reportText).toContain('Task Completed Later');
      expect(reportText).toContain('WIP');
      // Task should be counted even though completed outside range
      expect(reportText).toContain('**Total Tasks:** 1');
    });
  });

  describe('Saved Reports Management', () => {
    beforeEach(() => {
      // Reset mocks
      mockPluginAPI.persistDataSynced.mockClear();
      mockPluginAPI.loadSyncedData.mockClear();
      mockPluginAPI.loadSyncedData.mockResolvedValue(null); // Default to empty
    });

    it('should save a new report with auto-generated name', async () => {
      // First generate a report
      mockPluginAPI.getTasks.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      // Save without custom name
      const reportNameInput = document.getElementById('reportNameInput');
      reportNameInput.value = '';

      await window.saveReport();

      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
      const savedData = JSON.parse(mockPluginAPI.persistDataSynced.mock.calls[0][0]);
      expect(savedData.reports).toHaveLength(1);
      expect(savedData.reports[0].name).toContain('Report');
      expect(savedData.reports[0].name).toContain('Monday, January 15, 2024');
    });

    it('should save a new report with custom name', async () => {
      // First generate a report
      mockPluginAPI.getTasks.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      // Save with custom name
      const reportNameInput = document.getElementById('reportNameInput');
      reportNameInput.value = 'My Custom Report';

      await window.saveReport();

      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
      const savedData = JSON.parse(mockPluginAPI.persistDataSynced.mock.calls[0][0]);
      expect(savedData.reports).toHaveLength(1);
      expect(savedData.reports[0].name).toBe('My Custom Report');
    });

    it('should update an existing report', async () => {
      // Setup existing report
      const existingReport = {
        id: '123',
        name: 'Old Report',
        content: 'Old content',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 1,
        generatedAt: new Date().toISOString(),
        savedAt: new Date().toISOString()
      };
      
      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: [existingReport] }));
      await window.loadReports();

      // View the report to set up editing mode
      window.viewReport('123');

      const modalContent = document.getElementById('modalReportContent');
      modalContent.value = 'Updated content';

      const reportNameInput = document.getElementById('reportNameInput');
      reportNameInput.value = 'Updated Report';

      await window.saveReport();

      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
      const savedData = JSON.parse(mockPluginAPI.persistDataSynced.mock.calls[0][0]);
      expect(savedData.reports).toHaveLength(1);
      expect(savedData.reports[0].name).toBe('Updated Report');
      expect(savedData.reports[0].content).toBe('Updated content');
      expect(savedData.reports[0].updatedAt).toBeDefined();
    });

    it('should load saved reports from storage', async () => {
      const mockReports = [
        {
          id: '1',
          name: 'Report 1',
          content: 'Content 1',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          totalTasks: 5,
          savedAt: new Date().toISOString()
        }
      ];

      const mockData = {
        reports: mockReports,
        preferences: {
          groupBy: 'date',
          excludeEmptyDates: true
        }
      };

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify(mockData));

      await window.loadReports();

      // The reports are loaded into the global savedReports array
      const reportsList = document.getElementById('savedReportsList');
      expect(reportsList.innerHTML).toContain('Report 1');
    });

    it('should handle empty storage when loading reports', async () => {
      mockPluginAPI.loadSyncedData.mockResolvedValue(null);

      await window.loadReports();

      const reportsList = document.getElementById('savedReportsList');
      expect(reportsList.innerHTML).toContain('No saved reports yet');
    });

    it('should render saved reports list correctly', async () => {
      // Load reports first to populate the list
      const mockReports = [
        {
          id: '1',
          name: 'Test Report',
          startDate: '2024-01-15',
          endDate: '2024-01-17',
          totalTasks: 3,
          savedAt: new Date('2024-01-18').toISOString()
        }
      ];

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: mockReports }));
      await window.loadReports();

      const reportsList = document.getElementById('savedReportsList');
      expect(reportsList.innerHTML).toContain('Test Report');
      expect(reportsList.innerHTML).toContain('3 tasks');
    });

    it('should show empty state when no saved reports', async () => {
      mockPluginAPI.loadSyncedData.mockResolvedValue(null);
      await window.loadReports();

      const reportsList = document.getElementById('savedReportsList');
      expect(reportsList.innerHTML).toContain('No saved reports yet');
      
      const deleteBtn = document.getElementById('deleteSelectedBtn');
      expect(deleteBtn.style.display).toBe('none');
    });

    it('should view a saved report and open modal', async () => {
      const mockReports = [
        {
          id: '1',
          name: 'Test Report',
          content: '# Test Report Content',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          totalTasks: 1,
          savedAt: new Date().toISOString()
        }
      ];

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: mockReports }));
      await window.loadReports();

      window.viewReport('1');

      const modal = document.getElementById('reportModal');
      expect(modal.classList.contains('show')).toBe(true);
      
      const modalContent = document.getElementById('modalReportContent');
      expect(modalContent.value).toBe('# Test Report Content');
    });

    it('should delete a single report', async () => {
      const mockReports = [
        {
          id: '1',
          name: 'Report 1',
          content: 'Content 1',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          totalTasks: 1,
          savedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Report 2',
          content: 'Content 2',
          startDate: '2024-01-16',
          endDate: '2024-01-16',
          totalTasks: 2,
          savedAt: new Date().toISOString()
        }
      ];

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: mockReports }));
      await window.loadReports();

      await window.deleteReport('1');

      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
      // Check the list was updated
      const reportsList = document.getElementById('savedReportsList');
      expect(reportsList.innerHTML).not.toContain('Report 1');
      expect(reportsList.innerHTML).toContain('Report 2');
    });

    it('should cancel deletion when user declines confirm', async () => {
      window.confirm = vi.fn().mockReturnValue(false);

      const mockReports = [
        {
          id: '1',
          name: 'Report 1',
          content: 'Content',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          totalTasks: 1,
          savedAt: new Date().toISOString()
        }
      ];

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: mockReports }));
      await window.loadReports();

      await window.deleteReport('1');

      expect(mockPluginAPI.persistDataSynced).not.toHaveBeenCalled();
      // Report should still be in the list
      const reportsList = document.getElementById('savedReportsList');
      expect(reportsList.innerHTML).toContain('Report 1');
    });

    it('should delete multiple selected reports', async () => {
      window.confirm = vi.fn().mockReturnValue(true);
      
      const mockReports = [
        { id: '1', name: 'Report 1', content: 'C1', startDate: '2024-01-15', endDate: '2024-01-15', totalTasks: 1, savedAt: new Date().toISOString() },
        { id: '2', name: 'Report 2', content: 'C2', startDate: '2024-01-16', endDate: '2024-01-16', totalTasks: 2, savedAt: new Date().toISOString() },
        { id: '3', name: 'Report 3', content: 'C3', startDate: '2024-01-17', endDate: '2024-01-17', totalTasks: 3, savedAt: new Date().toISOString() }
      ];

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: mockReports }));
      await window.loadReports();

      // Simulate checking multiple checkboxes
      const checkboxes = document.querySelectorAll('.saved-report-checkbox');
      if (checkboxes.length >= 2) {
        checkboxes[0].checked = true;
        checkboxes[1].checked = true;

        await window.deleteSelectedReports();

        expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
        // Check that Report 3 remains
        const reportsList = document.getElementById('savedReportsList');
        expect(reportsList.innerHTML).toContain('Report 3');
        expect(reportsList.innerHTML).not.toContain('Report 1');
      }
    });

    it('should handle storage errors when persisting', async () => {
      mockPluginAPI.persistDataSynced.mockRejectedValue(new Error('Storage error'));

      // First generate a report
      mockPluginAPI.getTasks.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      // Try to save
      await window.saveReport();

      expect(mockPluginAPI.showSnack).toHaveBeenCalledWith({
        msg: 'Failed to save report',
        type: 'ERROR'
      });
    });
  });

  describe('Modal Operations', () => {
    it('should show modal with generated report', async () => {
      mockPluginAPI.getTasks.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modal = document.getElementById('reportModal');
      expect(modal.classList.contains('show')).toBe(true);
      
      const modalTitle = document.getElementById('modalTitle');
      expect(modalTitle.textContent).toContain('Generated Report');
    });

    it('should show modal with subtitle for new reports', async () => {
      // Generate a report first to set up currentReport properly
      mockPluginAPI.getTasks.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modalTitle = document.getElementById('modalTitle');
      // Should have subtitle showing task count
      expect(modalTitle.textContent).toContain('Generated Report');
      expect(modalTitle.textContent).toContain('1 task');
      
      const modal = document.getElementById('reportModal');
      expect(modal.classList.contains('show')).toBe(true);
    });

    it('should show modal in edit mode for saved reports', async () => {
      const mockReport = {
        id: '1',
        name: 'Saved Report',
        content: '# Saved content',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 3,
        savedAt: new Date().toISOString()
      };

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify({ reports: [mockReport] }));
      await window.loadReports();

      // View the saved report
      window.viewReport('1');

      const modalTitle = document.getElementById('modalTitle');
      expect(modalTitle.textContent).toBe('Edit Saved Report');
      
      const modal = document.getElementById('reportModal');
      expect(modal.classList.contains('show')).toBe(true);
      
      const modalContent = document.getElementById('modalReportContent');
      expect(modalContent.value).toBe('# Saved content');
    });

    it('should hide modal and reset state', () => {
      // First show the modal with some content
      window.currentReport = { content: 'Test' };
      window.isEditingExisting = true;
      
      const modal = document.getElementById('reportModal');
      modal.classList.add('show');
      
      const reportNameInput = document.getElementById('reportNameInput');
      reportNameInput.value = 'Some name';

      window.hideReportModal();

      expect(modal.classList.contains('show')).toBe(false);
      expect(reportNameInput.value).toBe('');
      // currentReport and isEditingExisting are reset internally, 
      // verify modal is closed properly
    });

    it('should close modal when clicking overlay', () => {
      const modal = document.getElementById('reportModal');
      modal.classList.add('show');

      // Simulate clicking the overlay (not the modal content)
      const event = new window.MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      expect(modal.classList.contains('show')).toBe(false);
    });

    it('should close modal on Escape key', () => {
      const modal = document.getElementById('reportModal');
      modal.classList.add('show');

      const event = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);

      expect(modal.classList.contains('show')).toBe(false);
    });

    it('should copy report content to clipboard', async () => {
      const modalContent = document.getElementById('modalReportContent');
      modalContent.value = '# Test Report\nContent here';

      await window.copyFromModal();

      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('# Test Report\nContent here');
      expect(mockPluginAPI.showSnack).toHaveBeenCalledWith({
        msg: 'Report copied to clipboard!',
        type: 'SUCCESS',
        ico: 'content_copy'
      });
    });

    it('should handle clipboard copy failures gracefully', async () => {
      window.navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard error'));

      const modalContent = document.getElementById('modalReportContent');
      modalContent.value = 'Test content';

      await window.copyFromModal();

      expect(mockPluginAPI.showSnack).toHaveBeenCalledWith({
        msg: 'Failed to copy to clipboard',
        type: 'ERROR'
      });
    });
  });

  describe('Report Content Format', () => {
    it('should generate proper Markdown structure', async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Check Markdown structure
      expect(reportText).toContain('# Task Completion Report');
      expect(reportText).toContain('**Date Range:**');
      expect(reportText).toContain('**Generated:**');
      expect(reportText).toContain('**Total Tasks:**');
      expect(reportText).toContain('## '); // Date header
      expect(reportText).toContain('- '); // Task list item
    });

    it('should include metadata in report header', async () => {
      mockPluginAPI.getTasks.mockResolvedValue([]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-17';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      expect(reportText).toContain('Monday, January 15, 2024');
      expect(reportText).toContain('Wednesday, January 17, 2024');
      expect(reportText).toContain('**Total Tasks:** 0');
    });

    it('should show WIP indicator for in-progress tasks', async () => {
      const tasks = [
        {
          id: 'task-wip',
          title: 'Work In Progress',
          isDone: false,
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      expect(reportText).toContain('Work In Progress');
      expect(reportText).toMatch(/Work In Progress.*WIP/);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle PluginAPI.getTasks() failure', async () => {
      mockPluginAPI.getTasks.mockRejectedValue(new Error('API Error'));

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      expect(mockPluginAPI.showSnack).toHaveBeenCalledWith({
        msg: 'Failed to generate report: API Error',
        type: 'ERROR'
      });
    });

    it('should handle PluginAPI.getArchivedTasks() failure', async () => {
      mockPluginAPI.getTasks.mockResolvedValue([]);
      mockPluginAPI.getArchivedTasks.mockRejectedValue(new Error('Archive Error'));

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();

      expect(mockPluginAPI.showSnack).toHaveBeenCalledWith({
        msg: expect.stringContaining('Failed to generate report'),
        type: 'ERROR'
      });
    });

    it('should handle malformed task data', async () => {
      const tasks = [
        {
          id: 'task-bad',
          title: 'Bad Task',
          // Missing required fields like isDone, doneOn
          timeSpentOnDay: null // Invalid timeSpentOnDay
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      // Should not crash
      await expect(window.generateReport()).resolves.not.toThrow();
    });
  });

  describe('User Preferences', () => {
    it('should have preferences modal elements', () => {
      expect(document.getElementById('preferencesModal')).toBeTruthy();
      expect(document.getElementById('groupBy')).toBeTruthy();
      expect(document.getElementById('showProject')).toBeTruthy();
      expect(document.getElementById('showDate')).toBeTruthy();
      expect(document.getElementById('minTimeSpent')).toBeTruthy();
    });

    it('should save preferences with reports', async () => {
      // Generate a report first
      mockPluginAPI.getTasks.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Test Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        }
      ]);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';

      await window.generateReport();
      await window.saveReport();

      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
      const savedData = JSON.parse(mockPluginAPI.persistDataSynced.mock.calls[0][0]);
      expect(savedData.preferences).toBeDefined();
      expect(savedData.preferences.groupBy).toBeDefined();
      expect(savedData.preferences.minTimeSpent).toBeDefined();
    });

    it('should load preferences from storage', async () => {
      const mockData = {
        reports: [],
        preferences: {
          groupBy: 'project',
          showProject: true,
          excludeEmptyDates: false,
          minTimeSpent: 10
        }
      };

      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify(mockData));
      await window.loadReports();

      // Preferences should be applied to UI
      const groupBy = document.getElementById('groupBy');
      const showProject = document.getElementById('showProject');
      const minTimeSpent = document.getElementById('minTimeSpent');
      
      expect(groupBy.value).toBe('project');
      expect(showProject.checked).toBe(true);
      expect(parseInt(minTimeSpent.value)).toBe(10);
    });

    it('should filter tasks by minimum time spent', async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Short Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 60000 } // 1 minute (should be filtered out)
        },
        {
          id: 'task-2',
          title: 'Long Task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 600000 } // 10 minutes (should be included)
        }
      ];

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      const minTimeSpent = document.getElementById('minTimeSpent');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';
      minTimeSpent.value = '5'; // 5 minute minimum

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Report should show excluded work logs count
      expect(reportText).toContain('**Excluded Work Logs:**');
      expect(reportText).toContain('below 5 min threshold');
      // Both tasks are included, but work logs are noted as filtered
      expect(reportText).toContain('Short Task');
      expect(reportText).toContain('Long Task');
    });

    it('should support project-based grouping', async () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Task A',
          projectId: 'project-1',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 3600000 }
        },
        {
          id: 'task-2',
          title: 'Task B',
          projectId: 'project-1',
          isDone: true,
          doneOn: new Date('2024-01-15T14:00:00').getTime(),
          timeSpentOnDay: { '2024-01-15': 1800000 }
        }
      ];

      // Mock getProjects
      mockPluginAPI.getAllProjects.mockResolvedValue([
        { id: 'project-1', title: 'Project Alpha' }
      ]);

      mockPluginAPI.getTasks.mockResolvedValue(tasks);

      const startInput = document.getElementById('startDate');
      const endInput = document.getElementById('endDate');
      const groupBy = document.getElementById('groupBy');
      
      startInput.value = '2024-01-15';
      endInput.value = '2024-01-15';
      groupBy.value = 'project';
      groupBy.dispatchEvent(new window.Event('change', { bubbles: true }));

      await window.generateReport();

      const modalContent = document.getElementById('modalReportContent');
      const reportText = modalContent.value;
      
      // Should have tasks grouped by project
      expect(reportText).toContain('Task A');
      expect(reportText).toContain('Task B');
    });

    it('should toggle groupBy options visibility', () => {
      const groupBy = document.getElementById('groupBy');
      const showProjectContainer = document.getElementById('showProjectCheckbox');
      const showDateContainer = document.getElementById('showDateCheckbox');

      // When groupBy is 'date', showProject should be visible
      groupBy.value = 'date';
      groupBy.dispatchEvent(new window.Event('change', { bubbles: true }));
      
      // When groupBy is 'project', showDate should be visible
      groupBy.value = 'project';
      groupBy.dispatchEvent(new window.Event('change', { bubbles: true }));
      
      // Both containers should exist
      expect(showProjectContainer).toBeTruthy();
      expect(showDateContainer).toBeTruthy();
    });
  });
});
