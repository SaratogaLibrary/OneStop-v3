loadStylesheet();
var timer;

function initialize() {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckOutHeader%%", "%%Preferences.PageTimeout%%", "%%User.fullName%%");
  setLangText();
  emailAddress = "%%User.EmailAddress%%";
  initializeChangeLanguageButtons("scanItemsNext.htm");
  initializeHelpRequestButtons();

  hideElement("please_wait_div");
  hideElement("input_email_address_group");

  if ( 		("%%Preferences.Checkout:ForceReceiptForMediaTypes%%".length > 0)
		&& 	("%%Preferences.CheckoutPrintReceipt%%" != "0")
		&& 	("%%Session.PrinterStatus%%" == "0")
	) {
		showElement("please_wait_div");
		maybeForceReceipt(completeInitialization);
	} else {
		completeInitialization();
	}
}

function completeInitialization() {
  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtPrintReceiptOptionsPage_Seconds%%");
  timer.start();
  doPrintOptionsCko(textInLang);
  hideElement("please_wait_div");
}

// required by inputString.htm
function inputDone()  {
  printReceiptCko(receiptMode, enterForm.inputString.value);
}

function inputCancelled() {
  doReceiptMode("cko", 3, true);
}

function selectReceiptMode(modeSelected)  {
  doSelectReceiptMode("cko", modeSelected);
}

function getEmailAddress()  {
  return "%%User.EmailAddress%%";
}

function checkMaxFieldLength() {
}