import { describe, it, expect } from 'vitest';
import { generateReport } from '../src/reportGenerator.js';

describe('reportGenerator', () => {
  describe('generateReport', () => {
    it('should throw error if start date is after end date', () => {
      expect(() => {
        generateReport({
          startDate: '2024-01-15',
          endDate: '2024-01-10',
          tasks: [],
          includeNotes: false
        });
      }).toThrow('Start date must be before or equal to end date');
    });

    it('should generate report with no tasks', () => {
      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks: [],
        includeNotes: false
      });

      expect(result.startDate).toBe('2024-01-15');
      expect(result.endDate).toBe('2024-01-15');
      expect(result.totalTasks).toBe(0);
      expect(result.text).toContain('# Task Report');
      expect(result.text).toContain('*No tasks*');
    });

    it('should include completed task in report', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Complete documentation',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 7200000 // 2 hours in ms
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      expect(result.totalTasks).toBe(1);
      expect(result.text).toContain('Complete documentation');
      expect(result.text).toContain('(2h)');
    });

    it('should format time correctly with hours and minutes', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Review code',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 5400000 // 1 hour 30 minutes in ms
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      expect(result.text).toContain('Review code');
      expect(result.text).toContain('(1h 30min)');
    });

    it('should format time correctly with only minutes', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Quick fix',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 1800000 // 30 minutes in ms
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      expect(result.text).toContain('Quick fix');
      expect(result.text).toContain('(30 min)');
    });

    it('should mark WIP tasks correctly', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Work in progress task',
          isDone: false,
          timeSpentOnDay: {
            '2024-01-15': 3600000 // 1 hour
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      expect(result.totalTasks).toBe(1);
      expect(result.text).toContain('Work in progress task');
      expect(result.text).toContain('WIP');
    });

    it('should include task notes when requested', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Task with notes',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          notes: 'Important details about the task',
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: true
      });

      expect(result.text).toContain('Task with notes');
      expect(result.text).toContain('Important details about the task');
    });

    it('should not include task notes when not requested', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Task with notes',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          notes: 'Important details about the task',
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      expect(result.text).toContain('Task with notes');
      expect(result.text).not.toContain('Important details about the task');
    });

    it('should handle tasks with work logs on multiple dates', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Multi-day task',
          isDone: true,
          doneOn: new Date('2024-01-17T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000, // 1 hour
            '2024-01-16': 7200000, // 2 hours
            '2024-01-17': 3600000  // 1 hour
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        tasks,
        includeNotes: false
      });

      expect(result.totalTasks).toBe(3); // One entry per work log
      expect(result.text).toMatch(/Multi-day task.*\(1h\)/);
      expect(result.text).toMatch(/Multi-day task.*\(2h\)/);
    });

    it('should only include tasks within date range', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'In range task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        },
        {
          id: 'task-2',
          title: 'Out of range task',
          isDone: true,
          doneOn: new Date('2024-01-20T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-20': 3600000
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        tasks,
        includeNotes: false
      });

      expect(result.totalTasks).toBe(1);
      expect(result.text).toContain('In range task');
      expect(result.text).not.toContain('Out of range task');
    });

    it('should handle archived and active tasks together', () => {
      const tasks = [
        {
          id: 'task-1',
          title: 'Archived task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        },
        {
          id: 'task-2',
          title: 'Active task',
          isDone: true,
          doneOn: new Date('2024-01-15T16:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 7200000
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      expect(result.totalTasks).toBe(2);
      expect(result.text).toContain('Archived task');
      expect(result.text).toContain('Active task');
    });

    it('should generate report header with date range', () => {
      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        tasks: [],
        includeNotes: false
      });

      expect(result.text).toContain('# Task Report: Monday, January 15, 2024 - Wednesday, January 17, 2024');
    });

    it('should include generatedAt timestamp', () => {
      const beforeTime = new Date().toISOString();
      
      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks: [],
        includeNotes: false
      });

      const afterTime = new Date().toISOString();
      
      expect(result.generatedAt).toBeDefined();
      expect(result.generatedAt >= beforeTime).toBe(true);
      expect(result.generatedAt <= afterTime).toBe(true);
    });

    it('should avoid duplicate tasks', () => {
      // Same task appearing in both archived and active (shouldn't happen but handle it)
      const tasks = [
        {
          id: 'task-1',
          title: 'Same task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        },
        {
          id: 'task-1', // Same ID
          title: 'Same task',
          isDone: true,
          doneOn: new Date('2024-01-15T14:30:00').getTime(),
          timeSpentOnDay: {
            '2024-01-15': 3600000
          }
        }
      ];

      const result = generateReport({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        tasks,
        includeNotes: false
      });

      // Should only count once
      expect(result.totalTasks).toBe(1);
    });
  });
});
