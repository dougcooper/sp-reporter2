import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReportStorage } from '../src/reportStorage.js';
import { createMockPluginAPI } from './mockPluginAPI.js';

describe('reportStorage', () => {
  let mockPluginAPI;
  let storage;

  beforeEach(() => {
    mockPluginAPI = createMockPluginAPI();
    storage = createReportStorage(mockPluginAPI);
  });

  describe('loadReports', () => {
    it('should return empty array when no data exists', async () => {
      const reports = await storage.loadReports();
      expect(reports).toEqual([]);
    });

    it('should load reports from storage', async () => {
      const savedData = [
        {
          id: 'report-1',
          name: 'Test Report',
          text: '# Test',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          totalTasks: 5,
          generatedAt: '2024-01-15T12:00:00Z',
          savedAt: '2024-01-15T12:00:00Z'
        }
      ];
      
      mockPluginAPI.loadSyncedData.mockResolvedValue(JSON.stringify(savedData));
      
      const reports = await storage.loadReports();
      expect(reports).toEqual(savedData);
      expect(mockPluginAPI.loadSyncedData).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockPluginAPI.loadSyncedData.mockRejectedValue(new Error('Storage error'));
      
      const reports = await storage.loadReports();
      expect(reports).toEqual([]);
    });
  });

  describe('saveReport', () => {
    it('should save a new report', async () => {
      const report = {
        name: 'Weekly Report',
        text: '# Weekly Report\n\nTasks completed',
        startDate: '2024-01-15',
        endDate: '2024-01-21',
        totalTasks: 10,
        generatedAt: '2024-01-21T12:00:00Z'
      };

      const saved = await storage.saveReport(report);
      
      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('Weekly Report');
      expect(saved.savedAt).toBeDefined();
      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
    });

    it('should generate ID if not provided', async () => {
      const report = {
        name: 'Test Report',
        text: '# Test',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      };

      const saved = await storage.saveReport(report);
      
      expect(saved.id).toMatch(/^report-\d+-[a-z0-9]+$/);
    });

    it('should update existing report', async () => {
      const report = {
        id: 'report-123',
        name: 'Original Report',
        text: '# Original',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      };

      await storage.saveReport(report);
      
      const updated = {
        id: 'report-123',
        name: 'Updated Report',
        text: '# Updated',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 8,
        generatedAt: '2024-01-15T12:00:00Z'
      };

      await storage.saveReport(updated);
      
      const reports = storage.getReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].name).toBe('Updated Report');
      expect(reports[0].totalTasks).toBe(8);
    });

    it('should add new reports to the beginning of the list', async () => {
      await storage.saveReport({
        name: 'Report 1',
        text: '# Report 1',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      });

      await storage.saveReport({
        name: 'Report 2',
        text: '# Report 2',
        startDate: '2024-01-16',
        endDate: '2024-01-16',
        totalTasks: 3,
        generatedAt: '2024-01-16T12:00:00Z'
      });

      const reports = storage.getReports();
      expect(reports[0].name).toBe('Report 2');
      expect(reports[1].name).toBe('Report 1');
    });

    it('should include includeNotes flag', async () => {
      const report = {
        name: 'Report with notes',
        text: '# Report',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        includeNotes: true,
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      };

      const saved = await storage.saveReport(report);
      expect(saved.includeNotes).toBe(true);
    });

    it('should default includeNotes to false', async () => {
      const report = {
        name: 'Report without notes flag',
        text: '# Report',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      };

      const saved = await storage.saveReport(report);
      expect(saved.includeNotes).toBe(false);
    });
  });

  describe('deleteReport', () => {
    it('should delete a report by ID', async () => {
      const report = {
        id: 'report-123',
        name: 'Test Report',
        text: '# Test',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      };

      await storage.saveReport(report);
      expect(storage.getReports()).toHaveLength(1);

      const deleted = await storage.deleteReport('report-123');
      expect(deleted).toBe(true);
      expect(storage.getReports()).toHaveLength(0);
      expect(mockPluginAPI.persistDataSynced).toHaveBeenCalled();
    });

    it('should return false if report not found', async () => {
      const deleted = await storage.deleteReport('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('deleteReports', () => {
    it('should delete multiple reports', async () => {
      await storage.saveReport({
        id: 'report-1',
        name: 'Report 1',
        text: '# Report 1',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      });

      await storage.saveReport({
        id: 'report-2',
        name: 'Report 2',
        text: '# Report 2',
        startDate: '2024-01-16',
        endDate: '2024-01-16',
        totalTasks: 3,
        generatedAt: '2024-01-16T12:00:00Z'
      });

      await storage.saveReport({
        id: 'report-3',
        name: 'Report 3',
        text: '# Report 3',
        startDate: '2024-01-17',
        endDate: '2024-01-17',
        totalTasks: 7,
        generatedAt: '2024-01-17T12:00:00Z'
      });

      const deletedCount = await storage.deleteReports(['report-1', 'report-3']);
      expect(deletedCount).toBe(2);
      
      const reports = storage.getReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].id).toBe('report-2');
    });

    it('should return 0 if no reports deleted', async () => {
      const deletedCount = await storage.deleteReports(['non-existent']);
      expect(deletedCount).toBe(0);
    });

    it('should not persist if no reports deleted', async () => {
      await storage.deleteReports(['non-existent']);
      
      // persistDataSynced should not be called (or only from initial saves)
      const calls = mockPluginAPI.persistDataSynced.mock.calls.length;
      
      await storage.deleteReports(['non-existent-2']);
      
      // Should be same number of calls
      expect(mockPluginAPI.persistDataSynced.mock.calls.length).toBe(calls);
    });
  });

  describe('getReports', () => {
    it('should return all reports', async () => {
      await storage.saveReport({
        name: 'Report 1',
        text: '# Report 1',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      });

      await storage.saveReport({
        name: 'Report 2',
        text: '# Report 2',
        startDate: '2024-01-16',
        endDate: '2024-01-16',
        totalTasks: 3,
        generatedAt: '2024-01-16T12:00:00Z'
      });

      const reports = storage.getReports();
      expect(reports).toHaveLength(2);
    });

    it('should return a copy of the reports array', async () => {
      await storage.saveReport({
        name: 'Report 1',
        text: '# Report 1',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      });

      const reports1 = storage.getReports();
      const reports2 = storage.getReports();
      
      expect(reports1).not.toBe(reports2); // Different array instances
      expect(reports1).toEqual(reports2); // Same content
    });
  });

  describe('getReport', () => {
    it('should return a specific report by ID', async () => {
      await storage.saveReport({
        id: 'report-123',
        name: 'Test Report',
        text: '# Test',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        totalTasks: 5,
        generatedAt: '2024-01-15T12:00:00Z'
      });

      const report = storage.getReport('report-123');
      expect(report).toBeDefined();
      expect(report.name).toBe('Test Report');
    });

    it('should return null if report not found', () => {
      const report = storage.getReport('non-existent');
      expect(report).toBeNull();
    });
  });
});
