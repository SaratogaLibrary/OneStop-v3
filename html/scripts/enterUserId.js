
function initialize() {
  redirect();
}

function redirect() {
 if (("%%Preferences.UseRfid%%" == "Yes") && ("%%Preferences.UseRfidLibraryCard%%" == "Yes"))
	window.location = "/selfCheck?action=startRFIDGetLibraryCard&amp;nextPage=/enterUserIdStart.htm"
 else
    window.location = '/enterUserIdNext.htm';
}