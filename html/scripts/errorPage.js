loadStylesheet();

var timer;

function initialize(headerTitle, timeoutSecondsLabel, pageFilename) {
  adjustElementsByScreenHeight();
  renderAdminPageHeader(headerTitle, "%%Preferences.PageTimeout%%", "");

  timer = new Timer("%%Preferences.PageTimeout%%", timeoutSecondsLabel);
  timer.start();

  initializeHelpRequestButtons();
}