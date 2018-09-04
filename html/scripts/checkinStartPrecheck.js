
function initialize() {
  if ("%%SESSION.PRINTERSTATUS%%" == "0") {
    window.location ='/selfCheck?action=startCheckinSession&amp;nextPage=/checkinStart.htm';
  } else {
    if ("%%Preferences.CheckinAllowCheckinWhenPrinterDown%%" == "0") {
      window.location ='/printerErrorNoCheckin.htm';
    } else {
      if ("%%Preferences.ReceiptPrinterShowStatus%%" != "0" && "%%Preferences.CheckinPrintReceipt%%" != "0")
        window.location ='/printErrorPromptCheckin.htm';
      else
        window.location ='/selfCheck?action=startCheckinSession&amp;nextPage=/checkinStart.htm';
    }
  }
}