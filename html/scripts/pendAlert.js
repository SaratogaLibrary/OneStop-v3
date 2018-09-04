loadStylesheet();

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", 0, "");

  initializeChangeLanguageButtons("pendAlert.htm");
  initializeHelpRequestButtons();

  var pendingAlerts = false;

  if (("%%Session.PendAlertIlsOffline%%" == "0")  || ("%%Session.PendAlertClaimedIlsOffline%%" == "1")) {
    hideElement("offline_button_border");
  } else {
    pendingAlerts = true;
  }

  if (("%%Session.PendAlertPrinterDown%%" == "0")  || ("%%Session.PendAlertClaimedPrinterDown%%" == "1")) {
    hideElement("printer_down_button_border");
  } else {
    pendingAlerts = true;
  }

  if (("%%Session.PendAlertRequestHelp%%" == "0")  || ("%%Session.PendAlertClaimedRequestHelp%%" == "1")) {
    hideElement("request_help_button_border");
  } else {
    pendingAlerts = true;
  }

  if (pendingAlerts)
    hideElement("noAlertsLabel");
}

function doButtonPress(buttonId)  {
  var action = '/selfcheck?action=pendAlert&amp;nextpage=/pendAlert.htm&amp;errorpage=/error.htm';
  if (buttonId == "btnIlsOffline")
    action += '&amp;ilsoffline=1';
  else if (buttonId == "btnPrinterDown")
    action += '&amp;printerdown=1';
  else if (buttonId == "btnRequestHelp")
    action += '&amp;requestHelp=1';

  window.location = action;
}
