// receiptUtilities.js
//
// Copyright(c)2006-2007 EnvisionWare, Inc. - All Rights Reserved
//
// This file provides Javascript  functions for printing receipts
//

// actionName value must be one of the following:
// printCheckoutReceipt
// printCheckinReceipt

var LangText = new Object();
var checkInCirculationAction = "CHECK_IN";
var checkOutCirculationAction = "CHECK_OUT";

function maybeForceReceipt(defaultFunc) {
	$.ajax({
		url: "/selfCheck?action=refresh&contentTemplate=/checkoutList.xml&_=" + (new Date()).getTime(),
		success: function(data, status, xhr) {
			var xml = $(data);
			var numCheckedOut = xml.find("itemCnt").text();
			var numPendingSecurity = xml.find("pendingCnt").text();
			if ((numCheckedOut > 0) || (numPendingSecurity > 0)) {
				var items = xml.find("itemRecord");
				var mediaTypes = "%%Preferences.Checkout:ForceReceiptForMediaTypes%%";
				mediaTypes = mediaTypes.split(",");
				for (var x = 0; x < items.length; ++x) {
					for (var m = 0; m < mediaTypes.length; ++m) {
						if ($(items[x]).find("mediaTypeCode").text() === mediaTypes[m].trim()) {
							LangText = textInLang;
							printReceiptCko(0, "");
							return;
						}
					}
				}
			} 
			defaultFunc();
		},
		error: function() {
			defaultFunc();
		}
	});
}

function updatePrintOptionsDisplay(content) {
  var element = document.getElementById("print_receipt_option_group");
  element.innerHTML=content;

  // one of the print and email will be picked.
  var toPrint;
  var toEmail;
  if ((LangText.printerStatus == 0) && (LangText.printReceipt != "0")) {
    toPrint = 1;
  } else {
    toPrint = 0;
  }

  if (LangText.sendEmailReceipt == "Yes") {
    toEmail = 1;
  } else {
    toEmail = 0;
  }

  if (toPrint == 1)  {
    visibleElement('receipt_options_print_button_border', true);
    if (toEmail == 1)
      visibleElement('receipt_options_print_email_button_border', true);
    else
      visibleElement('receipt_options_print_email_button_border', false);
  } else {
    visibleElement('receipt_options_print_button_border', false);
    visibleElement('receipt_options_print_email_button_border', false);
  }

  if (toEmail == 1) {
    visibleElement('receipt_options_email_button_border', true);
  } else {
    visibleElement('receipt_options_email_button_border', false);
  }

  element.style.visibility = "visible";
}

function showPrintReceiptOptions() {
  // visibleElement('printReceiptDiv', true);
  url = '/selfCheck?action=refresh&contentTemplate=/printReceiptOptions.htm';
  ajaxRequest(url, updatePrintOptionsDisplay, null, "GET", updatePrintOptionsDisplay);
}

function doPrintReceipt(template, receiptPrinterName, actionName, statusPrinter, receiptMode, emailAddress, emailSubject, emailFormat) {
  if ((statusPrinter != "0") && ((receiptMode == "0") || (receiptMode == "2")))
    window.location = '/printError.htm';
  else {
    showPleaseWait();
    initiatePrintReceiptAction(template, receiptPrinterName, actionName, receiptMode, emailAddress, emailSubject, emailFormat);
  }
}

function initiatePrintReceiptAction(template, receiptPrinterName, actionName, receiptMode,emailAddress, emailSubject, emailFormat) {
  var target = "/selfcheck?action=" + actionName + "&amp;template=" + template + "&amp;nextPage=/resetSession.htm";
  if (receiptPrinterName != "") {
    target += ("&amp;printer=" + receiptPrinterName);
  }
  target += "&amp;receiptMode=" + receiptMode +
            "&amp;emailAddress=" + emailAddress +
            "&amp;emailSubject=" + emailSubject +
            "&amp;emailFormat=" + emailFormat;
  window.location = target;
}

var receiptMode;
function doReceiptMode(circType, modeSelected) {
  doReceiptMode(circType, modeSelected, false);
}

function doReceiptMode(circType, modeSelected, fromEmailAddrCancel) {
  // circType: cki,cko
  // mode: 0(print), 1(email), 2(print&email), 3(neither)
  // fromEmailAddrCancel: bool, if pressing 'Cancel' on input_email_address page.
  receiptMode = modeSelected;
  switch (modeSelected)  {
  case 0:
    if (circType == "cko")
      printReceiptCko(receiptMode,"");
    else
      printReceiptCki(receiptMode,"");
    break;
  case 1:
  case 2:
    // visibleElement('printReceiptDiv', false);
    showInputEmailAddress();
    break;
  case 3:
    if (fromEmailAddrCancel)  {
      // var element = document.getElementById("input_email_address_group");
      // element.style.display = "none";
      if (circType == "cko")
        doPrintOptionsCko(LangText);
      else
        doPrintOptionsCki(LangText);
    } else {
      window.location = '/resetSession.htm';
    }
    break;
  }
}

function showInputEmailAddress() {
  url = '/selfCheck?action=refresh&contentTemplate=/inputString.htm';
  ajaxRequest(url, updateInputEmailAddress, null, "GET", updateInputEmailAddress);
}

function updateInputEmailAddress(content) {
  var element = document.getElementById("input_email_address_group");
  element.innerHTML = content;
  // visibleElement('input_email_address_group', true);
  $('#input_email_address_group').modal();

  var eleTitle = document.getElementById("input_string_title");
  eleTitle.innerHTML = LangText.txtPrintReceiptOptionsPage_provideEmailAddress;

  var eleInputString = enterForm.inputString;
  eleInputString.value = getEmailAddress();

  if (eleInputString.value == "")
    enableElement("ok_button", false);
  else
    enableElement("ok_button", true);

  var eleBtnGo = document.getElementById("ok_button");
  eleBtnGo.value = LangText.txtPrintReceiptOptionsPage_buttonGo;
  keypad_renderEmailKeyboard("keypad", "enterForm.inputString");
}

function checkStringInput() {
  enableElement("ok_button", (enterForm.inputString.value != ""));
}

function doSelectReceiptMode(circType, modeSelected) {
  receiptMode = modeSelected;
  doReceiptMode(circType, modeSelected);
}

function printReceiptCko(receiptMode,emailAddress) {
  var template = "%%Preferences.WebServerDocumentRoot%%/receipts/" +
                 (("%%Preferences.CheckoutShowExistingItemsOnReceipt%%" == "Yes") ? "receipt_detail_" : "receipt_") +
                 LangText.currentLanguage+'.htm';
  doPrintReceipt(template, '%%Preferences.ReceiptPrinterName%%', 'printCheckoutReceipt', '%%SESSION.PRINTERSTATUS%%',
                 receiptMode,emailAddress,
                 LangText.txtCheckoutReceiptEmailSubject, '%%Preferences.EmailReceiptFormat%%');
}

function doPrintOptionsCko(text) {
  var printReceiptPref = "%%Preferences.CheckoutPrintReceipt%%";
  var sendEmailReceiptPref = "%%Preferences.CheckoutSendEmailReceipt%%";
  doPrintOptions(checkOutCirculationAction, text, printReceiptPref, sendEmailReceiptPref);
}

function printReceiptCki(receiptMode,emailAddress) {
  doPrintReceipt('%%Preferences.WebServerDocumentRoot%%/receipts/checkin_receipt_'+LangText.currentLanguage + '.htm',
                 '%%Preferences.ReceiptPrinterName%%', 'printCheckinReceipt', '%%SESSION.PRINTERSTATUS%%',
                 receiptMode,emailAddress,
                 LangText.txtCheckinReceiptEmailSubject, '%%Preferences.EmailReceiptFormat%%');
}

function doPrintOptionsCki(text) {
  var printReceiptPref = "%%Preferences.CheckinPrintReceipt%%";
  var sendEmailReceiptPref = "%%Preferences.CheckinSendEmailReceipt%%";
  doPrintOptions(checkInCirculationAction, text, printReceiptPref, sendEmailReceiptPref);
}

function doPrintOptions(circulationAction, text, printReceiptPref, sendEmailReceiptPref) {
  LangText = text;
  if (((printReceiptPref == "0") || (LangText.printerStatus != 0)) && (sendEmailReceiptPref == "No"))
    window.location = '/resetSession.htm';
  else  {
    if (printReceiptPref == "1") {
      if (sendEmailReceiptPref == "No")
        (circulationAction == checkOutCirculationAction) ? printReceiptCko(0, "") : printReceiptCki(0, "");
      else
        showPrintReceiptOptions();
    }
    else {
      if (printReceiptPref == "2")
        showPrintReceiptOptions();
      else {
        if (sendEmailReceiptPref == "No")
          window.location = '/resetSession.htm';
        else
          showPrintReceiptOptions();
      }
    }
  }
}