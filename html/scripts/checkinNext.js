loadStylesheet();
var timer;
var textInLang = new Object();

function initialize() {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckInHeader%%", "%%Preferences.PageTimeout%%", "");
  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtPrintReceiptOptionsPage_Seconds%%");
  timer.start();
  setLangText();
  doPrintOptionsCki(textInLang);
  initializeHelpRequestButtons();
  initializeChangeLanguageButtons("checkinNext.htm");
  hideElement("please_wait_div");
  hideElement("input_email_address_group");
}

function setLangText()  {
  textInLang.txtPrintReceiptOptionsPage_provideEmailAddress   = "%%Text.txtPrintReceiptOptionsPage_provideEmailAddress%%";
  textInLang.txtPrintReceiptOptionsPage_buttonGo        = "%%Text.txtPrintReceiptOptionsPage_buttonGo%%";
  textInLang.txtCheckoutReceiptEmailSubject   = "%%Text.txtCheckoutReceiptEmailSubject%%";
  textInLang.txtCheckinReceiptEmailSubject  = "%%Text.txtCheckinReceiptEmailSubject%%";
  textInLang.currentLanguage = "%%Session.CurrentLanguage%%";
  textInLang.printerStatus = "%%Session.PrinterStatus%%";
  textInLang.printReceipt = "%%Preferences.CheckinPrintReceipt%%";
  textInLang.sendEmailReceipt = "%%Preferences.CheckinSendEmailReceipt%%";
}

// required by inputString.htm
function inputDone()  {
  printReceiptCki(receiptMode,enterForm.inputString.value);
}

function inputCancelled() {
  doReceiptMode("cki", 3, true);
}

function selectReceiptMode(modeSelected)  {
  doSelectReceiptMode("cki", modeSelected);
}

function getEmailAddress()  {
  return "%%User.EmailAddress%%";
}

function checkMaxFieldLength() {
}