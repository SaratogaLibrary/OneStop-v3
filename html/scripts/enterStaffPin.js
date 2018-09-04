loadStylesheet();
var timer;

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", "%%Preferences.PageTimeout%%", "");
  initializeChangeLanguageButtons("enterStaffPin.htm");
  initializeHelpRequestButtons();
  hideElement("please_wait_div");

  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtEnterStaffPinPage_Seconds%%");
  initEntryForm('enterStaffPinForm', 'password', false);
  timer.start();

  enableElement('next_button', false);

  var passwordField = document.getElementById("password");
  passwordField.update = function() {
    enableElement('next_button', !isBlank('password'));
  }
}

function submitForm() {
  if (enterStaffPinForm.onsubmit())
    enterStaffPinForm.submit();
}