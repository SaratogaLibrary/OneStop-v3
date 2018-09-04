loadStylesheet();

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", 0, "");
  initializeChangeLanguageButtons("loadEscrow.htm");
  initializeHelpRequestButtons();
}

function loadEscrow() {
  window.location='/selfCheck?action=loadEscrow&amp;mode=stop&amp;nextPage=/staffMenu.htm';
}