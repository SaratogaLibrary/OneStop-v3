loadStylesheet();

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", 0, "");
  initializeChangeLanguageButtons("reconcileCash.htm");
  initializeHelpRequestButtons();
}

function processCriteria() {
  var collectCash = document.getElementById("cashCollectionField");
  var emptyCashBox = document.getElementById("emptyCashBoxField");
  if (collectCash && emptyCashBox) {
    if (emptyCashBox.checked)
      collectCash.value = "1";
  }
  return true;
}

function submitReconcileCashForm() {
  if (reconcileCashForm.onsubmit())
    reconcileCashForm.submit();
}