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
});
