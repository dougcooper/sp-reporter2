/**
 * Date Range Reporter Plugin
 * Registers a header button to open the report interface
 */

/**
 * Initialize the plugin with dependency injection
 * @param {Object} pluginAPI - The PluginAPI instance
 */
export function initPlugin(pluginAPI) {
  pluginAPI.registerHeaderButton({
    id: 'date-range-reporter-btn',
    label: 'Task Report',
    icon: 'summarize',
    onClick: () => {
      pluginAPI.showIndexHtmlAsView();
    },
  });
}

// Auto-initialize if PluginAPI is available globally (for production use)
if (typeof PluginAPI !== 'undefined') {
  initPlugin(PluginAPI);
}
