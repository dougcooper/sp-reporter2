/**
 * Report storage and management
 */

/**
 * Create a ReportStorage instance with dependency injection
 * @param {Object} pluginAPI - The PluginAPI instance
 * @returns {Object} ReportStorage instance
 */
export function createReportStorage(pluginAPI) {
  let savedReports = [];

  /**
   * Load reports from storage
   * @returns {Promise<Array>} Array of saved reports
   */
  async function loadReports() {
    try {
      const data = await pluginAPI.loadSyncedData();
      if (data) {
        savedReports = JSON.parse(data);
      }
      return savedReports;
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
  }

  /**
   * Persist reports to storage
   * @returns {Promise<void>}
   */
  async function persistReports() {
    try {
      await pluginAPI.persistDataSynced(JSON.stringify(savedReports));
    } catch (error) {
      console.error('Error persisting reports:', error);
      throw error;
    }
  }

  /**
   * Save a new report or update existing one
   * @param {Object} report - Report to save
   * @returns {Promise<void>}
   */
  async function saveReport(report) {
    const reportToSave = {
      id: report.id || `report-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: report.name,
      text: report.text,
      startDate: report.startDate,
      endDate: report.endDate,
      includeNotes: report.includeNotes || false,
      totalTasks: report.totalTasks,
      generatedAt: report.generatedAt,
      savedAt: new Date().toISOString()
    };

    // Check if updating existing report
    const existingIndex = savedReports.findIndex(r => r.id === reportToSave.id);
    if (existingIndex >= 0) {
      savedReports[existingIndex] = reportToSave;
    } else {
      savedReports.unshift(reportToSave);
    }

    await persistReports();
    return reportToSave;
  }

  /**
   * Delete a report by ID
   * @param {string} reportId - ID of report to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async function deleteReport(reportId) {
    const index = savedReports.findIndex(r => r.id === reportId);
    if (index >= 0) {
      savedReports.splice(index, 1);
      await persistReports();
      return true;
    }
    return false;
  }

  /**
   * Delete multiple reports by IDs
   * @param {string[]} reportIds - Array of report IDs to delete
   * @returns {Promise<number>} Number of reports deleted
   */
  async function deleteReports(reportIds) {
    const initialLength = savedReports.length;
    savedReports = savedReports.filter(r => !reportIds.includes(r.id));
    const deletedCount = initialLength - savedReports.length;
    
    if (deletedCount > 0) {
      await persistReports();
    }
    
    return deletedCount;
  }

  /**
   * Get all saved reports
   * @returns {Array} Array of saved reports
   */
  function getReports() {
    return [...savedReports];
  }

  /**
   * Get a report by ID
   * @param {string} reportId - ID of report to retrieve
   * @returns {Object|null} Report object or null if not found
   */
  function getReport(reportId) {
    return savedReports.find(r => r.id === reportId) || null;
  }

  return {
    loadReports,
    saveReport,
    deleteReport,
    deleteReports,
    getReports,
    getReport
  };
}
