loadStylesheet();

var timer;

function initialize() {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_MainMenuHeader%%", "%%Preferences.PageTimeout%%", "");
  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtEnterUserIdPage_Seconds%%");

  initializeMenuItems();

  if ("%%Preferences.ActivateScannerOnMainMenu%%" == "1")
    document.getElementById("userIdField").focus();
  else
    hideElement("entry_field_container");

  initializeChangeLanguageButtons("menu.htm");
  initializeHelpRequestButtons();

  hideElement("please_wait_div");
  hideElement("timer_container_background");

  if (!isMainPage()) {
    timer.start();
    showElement("timer_container_background");
  }
  else
	startAutoUpload();
}

function MenuItem(elementId, shouldDisplay) {
  this.elementId = elementId;
  this.shouldDisplay = shouldDisplay;
}

var menuItems = [ new MenuItem("main_menu_checkout_button_container", true),
                  new MenuItem("main_menu_checkin_button_container", ("%%Preferences.CheckinAllowed%%" == "1")),
                  new MenuItem("main_menu_pay_fines_button_container", ("%%Preferences.PayFinesAllowed%%" == "1" && "%%Preferences.MenuShowPayFines%%" == "1")),
                  new MenuItem("main_menu_print_jobs_button_container", ("%%Preferences.MenuShowPrintRelease%%" == "1")),
                  new MenuItem("main_menu_reserve_pc_button_container", ("%%Preferences.MenuShowMakeReservation%%" == "1")),
                  new MenuItem("main_menu_manage_account_button_container", ("%%Preferences.MenuShowAccountManager%%" == "1")),
                  new MenuItem("main_menu_staff_functions_button_container", ("%%Preferences.MenuShowStaffFunctions%%" == "1"))];

function initializeMenuItems() {
  var numButtons = 0;
  for (var menuItemCnt = 0; menuItemCnt < menuItems.length; menuItemCnt++) {
    var menuItem = menuItems[menuItemCnt];
    if (numButtons < 6 && menuItem.shouldDisplay) {
      showElement(menuItem.elementId);
      numButtons++;
    } else {
      hideElement(menuItem.elementId);
    }
  }
}

function isMainPage() {
  return (getPageFilename("%%Preferences.MainPage%%").toLowerCase() == "menu.htm");
}

function preprocessEnterUserIdForm() {
  var userId = enterUserIdForm.userIdField.value;
  if ( (userId.length != 0) && (userId == "%%Preferences.StaffUserId%%") ) {
    window.location = "./staffMenu.htm";
    return false;
  }

  return getInputAndDisableControl(enterUserIdForm.userIdField, enterUserIdForm.userId, ('%%Preferences.IlsRequireUserPin%%' != '1'));
}

function checkMaxFieldLength() {
  var maxUserIdLength = "%%Preferences.MaxUserIdLength%%";
  var userIdField = enterUserIdForm.userIdField;
  if (hasReachedMaxFieldLength(maxUserIdLength, userIdField) && preprocessEnterUserIdForm())
    enterUserIdForm.submit();
  return true;
}

function resetAndShowTimer() {
  if (!isMainPage()) {
    resetTimerInBody();
    showElement("timer_container_background");
  }
}