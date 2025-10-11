// Date Range Reporter Plugin
// Registers a header button to open the report interface

// Initialize the plugin
(function(pluginAPI) {
  pluginAPI.registerHeaderButton({
    id: 'date-range-reporter-btn',
    label: 'Task Report',
    icon: 'summarize',
    onClick: () => {
      pluginAPI.showIndexHtmlAsView();
    },
  });
})(PluginAPI);
