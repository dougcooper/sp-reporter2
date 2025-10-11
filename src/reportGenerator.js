/**
 * Report generation logic for the Date Range Reporter
 */

import { formatDate, formatDateDisplay, getDateRange } from './dateUtils.js';

/**
 * Generate a report for tasks within a date range
 * @param {Object} params - Report generation parameters
 * @param {string} params.startDate - Start date in YYYY-MM-DD format
 * @param {string} params.endDate - End date in YYYY-MM-DD format
 * @param {Array} params.tasks - Array of all tasks (archived and active)
 * @param {boolean} params.includeNotes - Whether to include task notes
 * @returns {Object} Report object with text and metadata
 */
export function generateReport({ startDate, endDate, tasks, includeNotes = false }) {
  const startDateObj = new Date(startDate + 'T00:00:00');
  const endDateObj = new Date(endDate + 'T23:59:59');

  // Validate date range
  if (startDateObj > endDateObj) {
    throw new Error('Start date must be before or equal to end date');
  }

  // Group tasks by completion date
  const tasksByDate = {};
  let totalTasks = 0;

  // Get all dates in range
  const dateRange = getDateRange(startDate, endDate);
  dateRange.forEach(date => {
    tasksByDate[date] = [];
  });

  // Process all tasks (both archived and active)
  const processedTasks = new Set(); // Track tasks to avoid duplicates
  
  tasks.forEach(task => {
    // Check if task has work logs
    const hasWorkLogs = task.timeSpentOnDay && Object.keys(task.timeSpentOnDay).length > 0;
    
    if (task.isDone && task.doneOn) {
      const taskDate = new Date(task.doneOn);
      const taskDateStr = formatDate(taskDate);
      
      // Check if task completion is in date range
      const isCompletionInRange = taskDateStr >= formatDate(startDateObj) && taskDateStr <= formatDate(endDateObj);
      
      // Get work logs within date range
      const workLogsInRange = hasWorkLogs 
        ? Object.keys(task.timeSpentOnDay).filter(date => 
            date >= formatDate(startDateObj) && date <= formatDate(endDateObj)
          ).sort()
        : [];
      
      // If task has multiple work logs, show each work log as a separate entry
      if (workLogsInRange.length > 1) {
        workLogsInRange.forEach(workLogDate => {
          if (!tasksByDate[workLogDate]) {
            tasksByDate[workLogDate] = [];
          }
          
          const timeSpent = task.timeSpentOnDay[workLogDate];
          const taskKey = `${task.id}-${workLogDate}`;
          
          if (!processedTasks.has(taskKey)) {
            tasksByDate[workLogDate].push({
              ...task,
              timeSpent,
              isWorkLog: true,
              workLogDate
            });
            processedTasks.add(taskKey);
            totalTasks++;
          }
        });
      } else if (workLogsInRange.length === 1 && isCompletionInRange && workLogsInRange[0] === taskDateStr) {
        // Single work log on completion date
        const taskKey = `${task.id}-${taskDateStr}`;
        if (!processedTasks.has(taskKey)) {
          tasksByDate[taskDateStr].push({
            ...task,
            timeSpent: task.timeSpentOnDay?.[taskDateStr]
          });
          processedTasks.add(taskKey);
          totalTasks++;
        }
      } else if (workLogsInRange.length === 1 && !isCompletionInRange) {
        // Work log exists but completion is outside range - show work log
        const workLogDate = workLogsInRange[0];
        const taskKey = `${task.id}-${workLogDate}`;
        if (!processedTasks.has(taskKey)) {
          tasksByDate[workLogDate].push({
            ...task,
            timeSpent: task.timeSpentOnDay[workLogDate],
            isWorkLog: true,
            workLogDate
          });
          processedTasks.add(taskKey);
          totalTasks++;
        }
      } else if (isCompletionInRange) {
        // Completed in range, no work logs
        const taskKey = `${task.id}-${taskDateStr}`;
        if (!processedTasks.has(taskKey)) {
          tasksByDate[taskDateStr].push(task);
          processedTasks.add(taskKey);
          totalTasks++;
        }
      }
    } else if (hasWorkLogs) {
      // Task not done but has work logs
      const workLogsInRange = Object.keys(task.timeSpentOnDay).filter(date => 
        date >= formatDate(startDateObj) && date <= formatDate(endDateObj)
      ).sort();
      
      workLogsInRange.forEach(workLogDate => {
        if (!tasksByDate[workLogDate]) {
          tasksByDate[workLogDate] = [];
        }
        
        const timeSpent = task.timeSpentOnDay[workLogDate];
        const taskKey = `${task.id}-${workLogDate}`;
        
        if (!processedTasks.has(taskKey)) {
          tasksByDate[workLogDate].push({
            ...task,
            timeSpent,
            isWorkLog: true,
            workLogDate
          });
          processedTasks.add(taskKey);
          totalTasks++;
        }
      });
    }
  });

  // Build report text
  const reportLines = [];
  reportLines.push(`# Task Report: ${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`);
  reportLines.push('');

  dateRange.forEach(date => {
    const tasksForDate = tasksByDate[date] || [];
    reportLines.push(`## ${formatDateDisplay(date)}`);
    reportLines.push('');

    if (tasksForDate.length === 0) {
      reportLines.push('*No tasks*');
      reportLines.push('');
    } else {
      tasksForDate.forEach(task => {
        let taskLine = `- ${task.title}`;
        
        // Add time spent if available
        if (task.timeSpent) {
          const hours = Math.floor(task.timeSpent / (1000 * 60 * 60));
          const minutes = Math.floor((task.timeSpent % (1000 * 60 * 60)) / (1000 * 60));
          if (hours > 0 && minutes > 0) {
            taskLine += ` *(${hours}h ${minutes}min)*`;
          } else if (hours > 0) {
            taskLine += ` *(${hours}h)*`;
          } else if (minutes > 0) {
            taskLine += ` *(${minutes} min)*`;
          }
        }
        
        // Add WIP indicator if task is not done
        if (!task.isDone) {
          taskLine += ' WIP';
        }
        
        reportLines.push(taskLine);
        
        // Add notes if requested and available
        if (includeNotes && task.notes) {
          reportLines.push(`  ${task.notes}`);
        }
      });
      reportLines.push('');
    }
  });

  const reportText = reportLines.join('\n').trim();
  
  return {
    text: reportText,
    startDate,
    endDate,
    totalTasks,
    generatedAt: new Date().toISOString()
  };
}
