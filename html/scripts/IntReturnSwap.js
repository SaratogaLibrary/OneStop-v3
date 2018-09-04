loadStylesheet();

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_IRSHeader%%", 0, "");

  initializeChangeLanguageButtons("IntReturnSwap.htm");
  initializeHelpRequestButtons();

  hideElement("please_wait_div");
}

function print(action,type) {
  showPleaseWait();
  var templateName = '%%Preferences.WebServerDocumentRoot%%/receipts/'+ action + '_%%Session.CurrentLanguage%%.htm';
  var printerName = '';
  if (type == 1)    // receipt printer
    printerName = '%%Preferences.ReceiptPrinterName%%';
  else if (type == 2)   // report printer
    printerName = '%%Preferences.ReportPrinterName%%';

  var target = "/selfcheck?action=" + action + "&amp;receiptMode=0&amp;template=" + templateName + "&amp;nextPage=/intReturnSwap.htm";
  if (printerName != "") {
    target += ("&amp;printer=" + printerName);
  }
  window.location = target;
}