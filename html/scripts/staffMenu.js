loadStylesheet();
function initialize() {
  adjustElementsByScreenHeight();
  setTextDecoder();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", 0, "");

  visibleElement("staff_menu_load_escrow_button_container", ("%%Preferences.UseKioskHardware%%" == "Yes"));
  visibleElement("staff_menu_reconcile_cash_button_container", ("%%Preferences.UseKioskHardware%%" == "Yes"));

  initializeChangeLanguageButtons("staffMenu.htm");
  initializeHelpRequestButtons();

  if ("%%Session.PRINTERSTATUS%%" != "0") {
    printerMessage("%%Session.PRINTERSTATUS%%");
  }

}