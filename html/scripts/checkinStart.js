
function initialize() {
  redirect();
}

function redirect() {
  window.location = ("%%Preferences.UseRfid%%" == "Yes") ? '/selfcheck?action=startRFIDCheckIn&amp;nextpage=/checkin.htm' : '/checkin.htm';
}