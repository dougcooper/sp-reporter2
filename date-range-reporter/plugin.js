// Date Range Reporter Plugin
// Registers a header button to open the report interface

PluginAPI.registerHeaderButton({
  id: 'date-range-reporter-btn',
  label: 'Task Report',
  icon: 'calendar_month',
  onClick: () => {
    PluginAPI.showIndexHtmlAsView();
  },
});
