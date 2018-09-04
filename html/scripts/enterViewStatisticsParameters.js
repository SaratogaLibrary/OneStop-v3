loadStylesheet();

function enableParameterEntry(enabled) {
  enableElement('transStatus', enabled);
  enableElement('transType', enabled);
  enableElement('mediaType', enabled);
  enableElement('dateFrom', enabled);
  enableElement('dateTo', enabled);
}

function validateDates() {
  if ((document.getElementById('isodateFrom').value) > (document.getElementById('isodateTo').value)) {
    enableParameterEntry(false);
    visibleElement('invalidDateDiv', true);
    return false;
  } else
    return true;
}

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_StaffMenuHeader%%", 0, "");

  var TextString = new Object();
  TextString.txtCalendar_day1_sh = "%%Text.txtCalendar_day1_sh%%";
  TextString.txtCalendar_day2_sh = "%%Text.txtCalendar_day2_sh%%";
  TextString.txtCalendar_day3_sh = "%%Text.txtCalendar_day3_sh%%";
  TextString.txtCalendar_day4_sh = "%%Text.txtCalendar_day4_sh%%";
  TextString.txtCalendar_day5_sh = "%%Text.txtCalendar_day5_sh%%";
  TextString.txtCalendar_day6_sh = "%%Text.txtCalendar_day6_sh%%";
  TextString.txtCalendar_day7_sh = "%%Text.txtCalendar_day7_sh%%";

  TextString.txtCalendar_day1 = "%%Text.txtCalendar_day1%%";
  TextString.txtCalendar_day2 = "%%Text.txtCalendar_day2%%";
  TextString.txtCalendar_day3 = "%%Text.txtCalendar_day3%%";
  TextString.txtCalendar_day4 = "%%Text.txtCalendar_day4%%";
  TextString.txtCalendar_day5 = "%%Text.txtCalendar_day5%%";
  TextString.txtCalendar_day6 = "%%Text.txtCalendar_day6%%";
  TextString.txtCalendar_day7 = "%%Text.txtCalendar_day7%%";


  TextString.txtCalendar_Month1_sh = "%%Text.txtCalendar_Month1_sh%%";
  TextString.txtCalendar_Month2_sh = "%%Text.txtCalendar_Month2_sh%%";
  TextString.txtCalendar_Month3_sh = "%%Text.txtCalendar_Month3_sh%%";
  TextString.txtCalendar_Month4_sh = "%%Text.txtCalendar_Month4_sh%%";
  TextString.txtCalendar_Month5_sh = "%%Text.txtCalendar_Month5_sh%%";
  TextString.txtCalendar_Month6_sh = "%%Text.txtCalendar_Month6_sh%%";
  TextString.txtCalendar_Month7_sh = "%%Text.txtCalendar_Month7_sh%%";
  TextString.txtCalendar_Month8_sh = "%%Text.txtCalendar_Month8_sh%%";
  TextString.txtCalendar_Month9_sh = "%%Text.txtCalendar_Month9_sh%%";
  TextString.txtCalendar_Month10_sh = "%%Text.txtCalendar_Month10_sh%%";
  TextString.txtCalendar_Month11_sh = "%%Text.txtCalendar_Month11_sh%%";
  TextString.txtCalendar_Month12_sh = "%%Text.txtCalendar_Month12_sh%%";

  TextString.txtCalendar_Monthup_title = "%%Text.txtCalendar_Monthup_title%%";
  TextString.txtCalendar_Monthdn_title = "%%Text.txtCalendar_Monthdn_title%%";
  TextString.txtCalendar_Clearbtn_caption = "%%Text.txtCalendar_Clearbtn_caption%%";
  TextString.txtCalendar_Clearbtn_title = "%%Text.txtCalendar_Clearbtn_title%%";
  TextString.txtCalendar_Maxrange_caption = "%%Text.txtCalendar_Maxrange_caption%%";

  initializeChangeLanguageButtons("enterViewStatisticsParameters.htm");
  initializeHelpRequestButtons();

  hideElement("please_wait_div");

  fromCalendar  = new Epoch('epoch_popup', 'popup', document.getElementById('dateFrom'), false, TextString );
  toCalendar    = new Epoch('epoch_popup', 'popup', document.getElementById('dateTo'), false, TextString);

  defaultFromDate = new Date();
  defaultFromDate.setDate(1);
  document.getElementById('dateFrom').value = defaultFromDate.dateFormat('%%Preferences.DateFormat%%');
  document.getElementById('isodateFrom').value = defaultFromDate.dateFormat('Y-m-d');

  defaultToDate = new Date();
  document.getElementById('dateTo').value = defaultToDate.dateFormat('%%Preferences.DateFormat%%');
  document.getElementById('isodateTo').value = defaultToDate.dateFormat('Y-m-d');
}

function goToResults() {
  if (enterViewStatisticsForm.onsubmit())
    enterViewStatisticsForm.submit();
}