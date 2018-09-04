loadStylesheet();

var timer;

function initialize() {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckOutHeader%%", "%%Preferences.PageTimeout%%", "");
  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtEnterUserPinPage_Seconds%%");

  var keypad = document.getElementById("keypad");
  if (keypad)
    keypad.innerHTML = keypad_renderKeypad("enterPinForm.pinField", "%%Preferences.ShowAlphanumericKeypadOnPinPage%%");

  if ("%%Preferences.ShowAlphanumericKeypadOnPinPage%%" == "1")
    keypad_renderShortUppercaseKeyboard("alpha_keypad", "enterPinForm.pin");

  initEntryForm('enterPinForm', 'pinField', true);

  if (("%%Preferences.Checkout:AlwaysShowMyAccountPage%%" == "1") && ("%%Session.ILSOffLine%%" != "1") && ("%%Preferences.MyAccount:DisplayOnlyWhenPatronIsBlocked%%" == "0"))
    document.getElementById("nextPage").value = "/checkPrinterStatusMyAccount.htm"

  if 	(("%%Session.ILSOffLine%%" == "1")
	|| 	(("%%Preferences.MyAccount:DisplayOnlyWhenPatronIsBlocked%%" == "1") && ("%%Patron.ChargePrivilegesDenied%%" != "Yes")))
    document.getElementById("feeOwedPage").value = "";

  enableElement('next_button', false);
  var pinField = document.getElementById("pinField");
  pinField.update = function() {
    changeNavButtonsDisableState(!isBlank('pinField'));
  }

  initializeChangeLanguageButtons("enterUserPin.htm");
  initializeHelpRequestButtons();

  hideElement("please_wait_div");
  hideElement("alpha_keypad");

  hideElement("enter_pin_animation");
  document.getElementById("enter_pin_animation_video").addEventListener("playing", function() {
    displayAnimation();
  });

  timer.start();
}

function preprocessEnterUserPinForm() {
  if (isBlank('pinField'))
    return false;
  return submitUserCredentials(true);
}

function submitUserPin() {
  if (enterPinForm.onsubmit()) {
    showPleaseWait();
    enterPinForm.submit();
  }
}

function showAlphaKeypad(field) {
  showElement('alpha_keypad');
  hideElement('enter_pin_animation');
  field.focus();
}

function closeAlphaKeypad(field) {
  hideElement('alpha_keypad');
  showElement('enter_pin_animation');
  field.focus();
}

function displayAnimation() {
  showElement("enter_pin_animation");
}

function checkFieldIsEmpty() {
  changeNavButtonsDisableState(!isBlank('pinField'));
  return true;
}

function changeNavButtonsDisableState(isPinFieldPopulated) {
  enableElement('next_button', isPinFieldPopulated);
  var next_button_arrow_icon = document.getElementById("next_button_arrow_icon");
  next_button_arrow_icon.src = (isPinFieldPopulated) ? "./images/right-arrow.png" : "./images/right-arrow-disabled.png";
}

function checkMaxFieldLength() {
  var maxUserPinLength = "%%Preferences.MaxUserPinLength%%";
  var userPinField = enterPinForm.pinField;
  if (hasReachedMaxFieldLength(maxUserPinLength, userPinField) && preprocessEnterUserPinForm())
    enterPinForm.submit();
  return true;
}