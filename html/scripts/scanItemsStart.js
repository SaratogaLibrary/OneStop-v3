loadStylesheet();

function initialize() {
  adjustElementsByScreenHeight();
  if ("%%User.CardReportedLost%%" == "Yes") {
    window.location = "/lostCardError.htm";
    return;
  } else if ("%%User.ChargePrivilegesDenied%%" == "Yes") {
    window.location = "/myAccount.htm";
    return;
  }

  hideElement("please_wait_div");

  redirect();
}

function redirect() {
	var nextPage = ("%%Preferences.NovelistEnabled%%" == "Yes") ? '/scanItemsNovelist.htm' : '/scanItems.htm';
	if ("%%Preferences.UseRfid%%" == "Yes") {
		showPleaseWait();
		window.location = '/selfcheck?action=startRFIDCheckout&amp;nextpage=' + nextPage;
	} else {
		window.location = nextPage;
	}
}