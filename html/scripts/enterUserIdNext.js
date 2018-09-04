loadStylesheet();

var timer;

var skipStartRfid = false;


function isMainPage() {
  return (getPageFilename("%%Preferences.MainPage%%").toLowerCase() == "enteruserid.htm");
}

function preprocessEnterUserIdForm() {
  var userId = enterUserIdForm.userIdField.value;
  if ( (userId.length != 0) && (userId == "%%Preferences.StaffUserId%%") ) {
    window.location = "/staffMenu.htm";
    return false;
  }

  return getInputAndDisableControl(enterUserIdForm.userIdField, enterUserIdForm.userId, ('%%Preferences.IlsRequireUserPin%%' != '1'));
}

function initialize() {	  
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckOutHeader%%", "%%Preferences.PageTimeout%%", "");
    
  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtEnterUserIdPage_Seconds%%");

  var keypad = document.getElementById("keypad");
  if (keypad)
    keypad.innerHTML = keypad_renderKeypad("enterUserIdForm.userIdField", "%%Preferences.ShowAlphanumericKeypadOnUserIdPage%%");

  if ("%%Preferences.ShowAlphanumericKeypadOnUserIdPage%%" == "1")
    keypad_renderShortUppercaseKeyboard("alpha_keypad", "enterUserIdForm.userIdField");

  if ("%%Preferences.ShowKeypadOnUserIdPage%%" == "0")
    hideElement("keypad");


  changeNavButtonsDisableState(false);
  var userIdField = document.getElementById("userIdField");
  userIdField.update = function() {
    changeNavButtonsDisableState(!isBlank('userIdField'));
  }

  initializeChangeLanguageButtons("enterUserId.htm");
  initializeHelpRequestButtons();

  hideElement("please_wait_div");
  hideElement("alpha_keypad");
  hideElement("timer_container_background");
  visibleElement("other_options_button_border", "%%Preferences.CheckOutScreen:ShowOtherOptionsButton%%" == "1");

  initEntryForm('enterUserIdForm', 'userIdField', true);
  
  if (("%%Preferences.UseRfid%%" == "Yes") && ("%%Preferences.UseRfidLibraryCard%%" == "Yes"))
  {	
	ajaxRefresh();
  }

  if (("%%Preferences.Checkout:AlwaysShowMyAccountPage%%" == "1") && ("%%Session.ILSOffLine%%" != "1") && ("%%Preferences.MyAccount:DisplayOnlyWhenPatronIsBlocked%%" == "0"))
    document.getElementById("nextPage").value = "/checkPrinterStatusMyAccount.htm"

  if 	(("%%Session.ILSOffLine%%" == "1")
	||	(("%%Preferences.MyAccount:DisplayOnlyWhenPatronIsBlocked%%" == "1") && ("%%Patron.ChargePrivilegesDenied%%" != "Yes")))
    document.getElementById("feeOwedPage").value = "";

  hideElement("barcode_scan_animation");
  document.getElementById("barcode_scan_animation_video").addEventListener("playing", function() {
    displayAnimation();
  });
      
  if (!isMainPage()) {
    timer.start();
    showElement("timer_container_background");
  }
  else
	startAutoUpload();  
}

function ajaxRefresh() {
  url = '/selfCheck?action=getLibraryCard';
  ajaxRequest(url, refreshUserIdField, null, "GET", refreshUserIdField);
}

function refreshUserIdField(content) {
	var xmlContent = getXMLContent(content, "libraryCards");
	if (xmlContent[0] == null)
		return;

	var libraryCardId;
	var libraryCards = xmlContent[0].getElementsByTagName("libraryCard");
	for (var i = 0; i < libraryCards.length; ++i) {
		libraryCardId = getNodeValue(libraryCards[i], 'id');
	}

	if (libraryCardId)
	{
		enterUserIdForm.userIdField.value = libraryCardId;
		submitUserId();
	}
	else if (("%%Preferences.useRfid%%" == "Yes") && ("%%Preferences.useRfidLibraryCard%%")) {
		timeOutFunc = setTimeout("ajaxRefresh()", 500);
	}
}

function submitUserId() {  

window.location='/selfcheck?action=finishRFID';
  if (enterUserIdForm.onsubmit())
    enterUserIdForm.submit();	

}

function showAlphaKeypad(field) {
  showElement('alpha_keypad');
  hideElement('barcode_scan_animation');
  field.focus();
}

function closeAlphaKeypad(field) {
  hideElement('alpha_keypad');
  showElement('barcode_scan_animation');
  field.focus();
}

function displayAnimation() {
  showElement("barcode_scan_animation");
}

function checkFieldIsEmpty() {
  changeNavButtonsDisableState(!isBlank('userIdField'))
  return true;
}

function changeNavButtonsDisableState(isUserIdFieldPopulated) {
  enableElement('next_button', isUserIdFieldPopulated);
  enableElement('start_over_button', isUserIdFieldPopulated);
  var start_over_button_arrow_icon = document.getElementById("start_over_button_arrow_icon");
  var next_button_arrow_icon = document.getElementById("next_button_arrow_icon");
  start_over_button_arrow_icon.src = (isUserIdFieldPopulated) ? "./images/left-arrow.png" : "./images/left-arrow-disabled.png";
  next_button_arrow_icon.src = (isUserIdFieldPopulated) ? "./images/right-arrow.png" : "./images/right-arrow-disabled.png";
}

function checkMaxFieldLength() {
  var maxUserIdLength = "%%Preferences.MaxUserIdLength%%";
  var userIdField = enterUserIdForm.userIdField;
  if (hasReachedMaxFieldLength(maxUserIdLength, userIdField) && preprocessEnterUserIdForm())
    enterUserIdForm.submit();
  return true;
}

function showTimerBackground() {
  showElement("timer_container_background");
}