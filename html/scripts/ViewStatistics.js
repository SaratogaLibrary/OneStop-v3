loadStylesheet();

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", 0, "");
  initializeChangeLanguageButtons("ViewStatistics.htm");
  initializeHelpRequestButtons();
}

function printReport()  {
  var file = '%%Preferences.WebServerDocumentRoot%%/receipts/printStatisticsReport_' + '%%Session.CurrentLanguage%%' + '.htm';
  window.location = "/selfcheck?action=printStatistics&amp;templateFile=" +  file + "&amp;nextPage=/viewStatistics.htm";
}