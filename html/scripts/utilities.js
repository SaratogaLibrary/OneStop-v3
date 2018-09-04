// utilities.js
//
// Copyright(c)2006-2010 EnvisionWare, Inc. - All Rights Reserved
//
// This file provides basic Javascript utility functions
//
var TextString = new Object();
var textInLang = new Object();

function isBlank(id) {
  return document.getElementById(id).value == "";
}

function getPageFilename(path) {
  var index = path.lastIndexOf('/');
  return (index == -1) ? path : path.substring(index + 1);
}

function isFlagSet(flag) {
  return ((flag == "1") || (flag == "Yes")) ? true : false;
}

function enableElement(id, enabled) {
  var dlg = document.getElementById(id);
  if (dlg)
    dlg.disabled = !(enabled == true);
}

function visibleElement(id, visible) {
  var dlg = document.getElementById(id);
  if (dlg)
    dlg.style.visibility = (visible) ? "visible" : "hidden";
    dlg.style.display = (visible) ? "" : "none";
}

function showPleaseWait() {
  $('#please_wait_div').modal();
}

function userOwesFee(feeAmount) {
  return (feeAmount > 0);
}

function adjustElementsByScreenHeight() {
  var oneStopFooterHeight = 27;
  var currentMainHeight = parseInt($("#main").css("height"), 10);
  var currentScreenHeight = screen.height;
  var newMainHeight = currentScreenHeight - oneStopFooterHeight;
  $("#main").css("height", newMainHeight);
  var screenHeightDiff = (currentScreenHeight - currentMainHeight - oneStopFooterHeight) / 2;
  if (screenHeightDiff > 0)
    $("#content").css("padding-top", screenHeightDiff);
}

function loadStylesheet()
{
  var screenWidth = screen.width;

  var styleSheet = "./styles/layout_";

  if (screenWidth < 1280)
  {
    styleSheet += "1024";
  }
  else if (screenWidth == 1280)
  {
    styleSheet += "1280";
  }
  else if (screenWidth == 1366)
  {
    styleSheet += "1366";
  }
  else
  {
    styleSheet += "1440";
  }

  styleSheet += ".css";

  document.getElementById("layout_stylesheet").href = styleSheet;
}

function loadNovelistStylesheet()
{
  var screenWidth = screen.width;

  var novelistStyleSheet = "./styles/novelist_";

  if (screenWidth < 1280)
  {
    novelistStyleSheet += "1024";
  }
  else if (screenWidth == 1280)
  {
    novelistStyleSheet += "1280";
  }
  else if (screenWidth == 1366)
  {
    novelistStyleSheet += "1366";
  }
  else
  {
    novelistStyleSheet += "1440";
  }

  novelistStyleSheet += ".css";

  document.getElementById("novelist_stylesheet").href = novelistStyleSheet;
}

function setSpanText(id, text) {
  var span = document.getElementById(id);
  if (span)
    span.innerHTML = text;
}

function hideElement(elementId) {
  var element = document.getElementById(elementId);
  if (element != null)
    element.style.display = "none";
}

function showElement(elementId) {
  var element = document.getElementById(elementId);
  if (element != null)
    element.style.display = "";
}

function scrollToBottomOfList(list) {
  if (list)
    list.scrollTop = list.scrollHeight + list.clientHeight;
}

function initializeHelpRequestButtons() {
  if ("%%Preferences.ShowHelpRequestOnAllPages%%" == "1")
    setupHelpRequestButtons("%%Session.PendAlertRequestHelp%%");
  else
    hideHelpRequestButtons();
}

function setupHelpRequestButtons(isActive) {
  refreshHelpRequestButtons(isActive)
}

function hideHelpRequestButtons() {
  hideElement("help_button_border");
  hideElement("cancel_help_button_border");
}

function requestHelp(details) {
  submitAjaxHelpRequest('create', details);
}

function cancelHelpRequest(details) {
  submitAjaxHelpRequest('cancel', details);
}

function requestHelpWithPatronName(details) {
  submitAjaxHelpRequest('create', appendPatronNameToDetails(details));
}

function cancelHelpRequestWithPatronName(details) {
  submitAjaxHelpRequest('cancel', appendPatronNameToDetails(details));
}

function appendPatronNameToDetails(details) {
  return details + " : " + $('<div/>').html("%%User.fullName%%").text();
}

function refreshHelpRequestButtons(isActive) {
  hideElement((isActive == "1") ? "help_button_border" : "cancel_help_button_border");
  showElement((isActive == "1") ? "cancel_help_button_border" : "help_button_border");
}

function submitAjaxHelpRequest(helpRequestCommand, details) {
  var helpRequestDetails = encodeURIComponent(details);
  var url ='/selfCheck?action=requestHelp&details=' + helpRequestDetails + '&contentTemplate=/helpRequest.xml&helpRequestCommand=' + helpRequestCommand;
  ajaxRequest(url, completeHelpRequest, null, "GET", completeHelpRequest);
}

function completeHelpRequest(content) {
  var helpRequestElement = getXMLContent(content, "helpRequest");
  var isActive = getNodeValue(helpRequestElement[0], "status");
  refreshHelpRequestButtons(isActive);
}

function Timer(interval, secondsText) {
  this.interval = parseInt(interval);
  this.timeRemaining = this.interval;
  this.secondsText = secondsText;
  this.id = -1;
  this.start = startTimer;
  this.reset = resetTimer;
  this.stop = stopTimer;
}

function startTimer() {
  if (this.interval > 0) {
    this.timeRemaining = this.interval;
    updateTimeRemaining();
    this.id = setInterval('timeout()', 1000);
  }
  return true;
}

function resetTimer() {
  this.stop();
  this.start();
  return true;
}

function stopTimer() {
  clearInterval(this.id);
}

function timeout() {
  timer.timeRemaining -= 1;
  if (timer.timeRemaining <= 0) {
	timer.stop();
	if ( 		("%%Preferences.Checkout:ForceReceiptForMediaTypes%%".length > 0)		// force receipt preference is set
			&& 	("%%Preferences.CheckoutPrintReceipt%%" != "0")							// receipt printing is allowed
			&& 	("%%Session.PrinterStatus%%" == "0")									// printer is available
			&&  (window.location.href.indexOf("scanItemsNext.htm") < 0)					// user is not currently on the scanItemsNext pageName
			&&	(typeof maybeForceReceipt === 'function')								// maybeForeceReceipt is defined as a function (receiptUtilities.js has been included)
	) {
		setLangText();
		maybeForceReceipt(resetSession);		
	} else {
		resetSession();
	}	  
  }
  else
    updateTimeRemaining();
}

function updateTimeRemaining() {
  var timerText = document.getElementById("time_remaining");
  if (timerText) {
    timerText.innerText = timer.timeRemaining + " " + timer.secondsText;
  }
  var timerContainerBackground = document.getElementById('timer_container_background');
  if (timerContainerBackground)
    timerContainerBackground.style.visibility = "visible";
}

function getXHR() {
  if (window.XMLHttpRequest && !(window.ActiveXObject))
    return new XMLHttpRequest();

  if (window.ActiveXObject) {
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch(e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch(e) {
      }
    }
  }
  return null;
}

function ajaxRequest(url, callback, data, method, errorCallback) {
  url = url + "&timestamp=" + new Date().getTime(); // stop cache issues.
  var xmlHttpRequest = getXHR();

  if (xmlHttpRequest) {
    xmlHttpRequest.onreadystatechange = function() {
      processReqChange(xmlHttpRequest, callback, errorCallback);
    }
    xmlHttpRequest.open(method, url, true);
    xmlHttpRequest.send("");
  } else{
    alert("The XMLHttpRequest Object is not supported");
  }
}

function processReqChange(xmlHttpRequest, callback, errorCallback) {
  if (xmlHttpRequest.readyState == 4) {
    if (xmlHttpRequest.status == 200 || xmlHttpRequest.status == 0) {
      callback(xmlHttpRequest.responseText);
    } else if (errorCallback) {
      errorCallback(xmlHttpRequest.status, xmlHttpRequest.statusText);
    }
    xmlHttpRequest.abort();
  }
}

function getXMLContent(xmlData, topElement) {
  var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
  xmlDoc.async = "false";
  xmlDoc.loadXML(xmlData);
  return xmlDoc.getElementsByTagName(topElement);
}

function getNodeValue(xmlElement, tag) {
  if (xmlElement == null) {
    return "";
  }

  var elements = xmlElement.getElementsByTagName(tag);
  if (elements == null) {
    return "";
  }

  if (elements[0] && elements[0].childNodes.length > 0) {
    var s = elements[0].childNodes[0].nodeValue;
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return "";
}

function appendMessage(msg, newmsg) {
  return (msg == "") ? newmsg : msg + " - " + newmsg;
}

function printerMessage(status) {
  if (TextString.txtPrinterStatusPage_Error == undefined)  {
    TextString.printerStatus = status;
    return;
  } else {
    TextString.printerStatus = -1;
  }

  var elePrinterStatus = document.getElementById("printerStatus");
  var msg = TextString.txtStaffMenuPage_PrinterStatus;

  if (status == 0)  {
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Normal);
    if (elePrinterStatus)
      elePrinterStatus.innerHTML = msg.toUpperCase();
    return msg;
  }

  if ((status & 0x00000001) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Paused);
  if ((status & 0x00000002) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Error);
  if ((status & 0x00000004) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Pending_Deletion);
  if ((status & 0x00000008) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Paper_Jam);
  if ((status & 0x00000010) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_PaperOut);
  if ((status & 0x00000020) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Manual_Feed);
  if ((status & 0x00000040) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Paper_Problem);
  if ((status & 0x00000080) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Offline);
  if ((status & 0x00000100) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_IO_Active);
  if ((status & 0x00000200) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Busy);
  if ((status & 0x00000400) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Printing);
  if ((status & 0x00000800) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Output_Bin_Full);
  if ((status & 0x00001000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Not_Available);
  if ((status & 0x00002000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Waiting);
  if ((status & 0x00004000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Processing);
  if ((status & 0x00008000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Initializing);
  if ((status & 0x00010000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Warming_Up);
  if ((status & 0x00020000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Toner_Low);
  if ((status & 0x00040000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_No_Toner);
  if ((status & 0x00080000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Page_Punt);
  if ((status & 0x00100000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_User_Intervention);
  if ((status & 0x00200000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Out_Of_Memory);
  if ((status & 0x00400000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Door_Open);
  if ((status & 0x00800000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Server_Unknown);
  if ((status & 0x01000000) != 0)
    msg = appendMessage(msg, TextString.txtPrinterStatusPage_Power_Save);

  if (elePrinterStatus)
    elePrinterStatus.innerHTML = msg.toUpperCase();

  return msg;
}

function refreshTextDecoder(content) {
  var textStringElement = getXMLContent(content, "LanguageText");

  TextString.txtCommon_Help        = getNodeValue(textStringElement[0], "txtCommon_Help");
  TextString.txtCommon_CancelHelp     = getNodeValue(textStringElement[0], "txtCommon_CancelHelp");

  TextString.txtStaffMenuPage_PrinterStatus    = getNodeValue(textStringElement[0], "txtStaffMenuPage_PrinterStatus");
  TextString.txtPrinterStatusPage_Normal     = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Normal");
  TextString.txtPrinterStatusPage_Paused     = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Paused");
  TextString.txtPrinterStatusPage_Error     = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Error");
  TextString.txtPrinterStatusPage_Pending_Deletion= getNodeValue(textStringElement[0], "txtPrinterStatusPage_Pending_Deletion");
  TextString.txtPrinterStatusPage_Paper_Jam    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Paper_Jam");
  TextString.txtPrinterStatusPage_PaperOut    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_PaperOut");
  TextString.txtPrinterStatusPage_Manual_Feed  = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Manual_Feed");
  TextString.txtPrinterStatusPage_Paper_Problem  = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Paper_Problem");
  TextString.txtPrinterStatusPage_Offline    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Offline");
  TextString.txtPrinterStatusPage_IO_Active    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_IO_Active");
  TextString.txtPrinterStatusPage_Busy     = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Busy");
  TextString.txtPrinterStatusPage_Printing    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Printing");
  TextString.txtPrinterStatusPage_Output_Bin_Full = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Output_Bin_Full");
  TextString.txtPrinterStatusPage_Not_Available  = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Not_Available");
  TextString.txtPrinterStatusPage_Waiting    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Waiting");
  TextString.txtPrinterStatusPage_Processing    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Processing");
  TextString.txtPrinterStatusPage_Initializing  = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Initializing");
  TextString.txtPrinterStatusPage_Warming_Up    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Warming_Up");
  TextString.txtPrinterStatusPage_Toner_Low    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Toner_Low");
  TextString.txtPrinterStatusPage_No_Toner    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_No_Toner");
  TextString.txtPrinterStatusPage_Page_Punt    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Page_Punt");
  TextString.txtPrinterStatusPage_User_Intervention= getNodeValue(textStringElement[0], "txtPrinterStatusPage_User_Intervention");
  TextString.txtPrinterStatusPage_Out_Of_Memory  = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Out_Of_Memory");
  TextString.txtPrinterStatusPage_Door_Open    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Door_Open");
  TextString.txtPrinterStatusPage_Server_Unknown  = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Server_Unknown");
  TextString.txtPrinterStatusPage_Power_Save    = getNodeValue(textStringElement[0], "txtPrinterStatusPage_Power_Save");

  var element;
  if (element=document.getElementById("helpButton"))
   element.value = TextString.txtCommon_Help;
  if (element=document.getElementById("cancelHelpButton"))
   element.value = TextString.txtCommon_CancelHelp;

  if (TextString.printerStatus != -1)
   printerMessage(TextString.printerStatus);
}

function setTextDecoder() {
  TextString.printerStatus = -1;
  url = '/selfCheck?action=refresh&contentTemplate=/textDecoder.xml';
  ajaxRequest(url, refreshTextDecoder, null, "GET", refreshTextDecoder);
}

function renderSchedule() {
  url = '/schedule/en.rss?';
  ajaxRequest(url, parseSchedule, null, "GET", parseSchedule);
}

function parseSchedule(content) {
  var maxItems = 6;
  var program_schedule_items_div = document.getElementById("program_schedule_items");
  try {
    var rssNode = getXMLContent(content, "rss")[0];
    var items = rssNode.getElementsByTagName("item");
    if (items.length > 0) {
      var html = "<table class='program_schedule_table'>";
      for (var i = 0; i < items.length; i++) {
        if (i > maxItems - 1) {
          break;
        }
        var item = items[i];
        var date = getNodeValue(item, "date");
        var time = getNodeValue(item, "time");
        var location = getNodeValue(item, "location");
        var description = getNodeValue(item, "description");
        html += "<tr><td class='program_schedule_date_cell'>" + date + "</td>" +
                "<td class='program_schedule_time_cell'>" + time + "</td>" +
                "<td class='program_schedule_location_cell'>" + location + "</td>" +
                "<td class='program_schedule_description_cell'>" + description + "</td>";
      }
      html += "</table>"
    } else {
      html = "<br>%%Text.txtPageHeader_LibraryProgramScheduleNoEvents%%";
    }
    program_schedule_items_div.innerHTML = html;
  } catch(e) {
    program_schedule_items_div.innerHTML = "<br>%%Text.txtPageHeader_LibraryProgramScheduleNoEvents%%";
  }
}

function initializeChangeLanguageButtons(pageName) {
  if (isFlagSet("%%Preferences.ShowLanguagesOnAllPages%%")) {
    drawLanguageMenu("language_buttons", pageName);
    hideElement("language_buttons_group");
  } else
    hideElement("change_language_button_border");
}

function displayLanguageOptionsDialog() {
  $('#language_buttons_group').modal();
}

function renderAdminPageHeader(pageTitle, pageTimeout, patronName) {
  _renderPageHeader(pageTitle, pageTimeout, patronName, false);
}

function renderPageHeader(pageTitle, pageTimeout, patronName) {
  _renderPageHeader(pageTitle, pageTimeout, patronName, true);
}

//TODO: break this down into separate functions
function _renderPageHeader(pageTitle, pageTimeout, patronName, displayPortalSection) {
  var page_header_group = document.getElementById("page_header_group");
  var portalSectionType = "%%Preferences.CheckOutScreen:Portlet%%";
  var displayPortalSection = (portalSectionType != '') && displayPortalSection;
  var displayRssLibrarySchedule = displayPortalSection && portalSectionType.toLowerCase() == 'rss library schedule';
  var html = "<div id=\"header_group\">" +
             "  <div id=\"library_logo\"></div>" +
             "  <div id=\"header_title_group\">" +
             "   <div id=\"header_tabs_group\">" +
             "    <div id=\"timer_tab_group\">" +
             renderTimerInHeader(pageTimeout) +
             "    </div>" +
             "    <div id=\"patron_name_tab_group\">" +
             renderPatronNameInHeader(patronName) +
             "    </div>" +
             "   </div>" +
             "   <div id=\"page_title\">" + pageTitle + "</div>" +
             renderPortalSectionInHeader(displayRssLibrarySchedule) +
             "  </div>" +
             "</div>";

  page_header_group.innerHTML = html;
  if (displayRssLibrarySchedule)
    renderSchedule();
}

function renderTimerInHeader(pageTimeout) {
  html = "";
  if (pageTimeout > 0) {
    html += "      <div class=\"header_tab_background\" id=\"timer_container_background\">" +
            "       <div class=\"header_tab_text\" id=\"time_remaining\">&nbsp;</div>" +
            "      </div>";
  }
  return html;
}

function renderPatronNameInHeader(patronName) {
  var html = "";
  if (isFlagSet('%%Preferences.CheckoutShowUserName%%') && patronName != '') {
  html += "       <div class=\"header_tab_text\" id=\"patron_name_text\">" + patronName + "</div>";
  }
  return html;
}

function renderPortalSectionInHeader(displayRssLibrarySchedule) {
  var html = "   <div id=\"portal_section_group\">";
  if (displayRssLibrarySchedule) {
   html += "    <div id=\"program_schedule_header_text\">%%Text.txtPageHeader_LibraryProgramScheduleHeader%%</div>" +
           "    <div id=\"program_schedule_items\">";
  }
  html +=  "   </div>";
  return html;
}

function isContextMenuAllowed() {
  return isFlagSet('%%Preferences.AllowContextMenu%%');
}

function addClass(addedClassName, elementId) {
  var element = document.getElementById(elementId);
  if (element)
    addClassByElement(addedClassName, element);
}

function addClassByElement(addedClassName, element) {
  var currentClassName = element.className;
  if (currentClassName.indexOf(addedClassName) != -1) {
    return;
  }
  if (currentClassName != '') {
    addedClassName = ' ' + addedClassName;
  }
  element.className = currentClassName + addedClassName;
}

function resetTimerInBody() {
  if (timer != null)
    timer.reset()
}

function goToCheckInPage() {
  window.location = '/selfCheck?action=startCheckinSession&nextPage=/checkinStart.htm';
}

function goToCheckIn() {
  window.location = '/checkin.htm';
}

function goToCheckinPrecheck() {
  window.location = '/checkinStartPrecheck.htm';
}

function goToStartOver() {
  resetSession();
}

function goToMyAccount() {
  window.location = '/myAccount.htm';
}

function goToResumeIrs() {
  window.location = '/resetSession.htm';
}

function goToMenuPage() {
  if (("%%Preferences.useRfid%%" == "Yes") && ("%%Preferences.useRfidLibraryCard%%" == "Yes")) {
     window.location='/selfcheck?action=finishRFID&amp;nextpage=/menu.htm';
  }
  else
	window.location = '/menu.htm';
}

function goToEnterStaffPin() {
  window.location = '/enterStaffPin.htm';
}

function goToStaffMenu() {
  window.location ='/staffMenu.htm';
}

function goToLoadEscrow() {
  window.location = '/selfCheck?action=loadEscrow&mode=start&nextPage=/loadEscrow.htm';
}

function goToReconcileCash() {
  window.location = '/reconcileCash.htm';
}

function goToViewStats() {
  window.location = '/enterViewStatisticsParameters.htm';
}

function goToShowDesktop() {
  window.location = '/selfCheck?action=minimizeOneStop&nextPage=/staffMenu.htm';
}

function goToPendingAlerts() {
  window.location = '/pendAlert.htm';
}

function goToCheckout() {
  window.location = '/scanItemsStart.htm';
}

function goToSwapBin() {
  window.location = '/IntReturnSwap.htm';
}

function goToEnterUserId() {

  if (( "%%Preferences.UseRfid%%" == "Yes" ) && ( "%%Preferences.UseRfidLibraryCard%%" == "Yes"))
  {
	window.location = "/selfCheck?action=startRFIDGetLibraryCard&amp;nextPage=/enterUserIdStart.htm"
  }
  else  
	window.location = '/enterUserIdNext.htm';
}

function goToNewReport() {
  window.location = '/enterViewStatisticsParameters.htm';
}

function redirect() {
  window.location = "/selfCheck?action=resetSession&amp;nextPage=" + getPageFilename('%%Preferences.MainPage%%');
}

function resetSession() {
  window.location = "/selfCheck?action=resetSession&amp;nextPage=" + getPageFilename('%%Preferences.MainPage%%');
}

function hasReachedMaxFieldLength(maxFieldLength, field) {
  if (maxFieldLength != "-1") {
    var fieldLength = field.value.length;
    if (fieldLength >= maxFieldLength) {
      field.value = field.value.substring(0, maxFieldLength);
      return true;
    }
  }
  return false;
}

function checkPrinterStatusBeforeCheckout(nextPage) {
  if ("%%SESSION.PRINTERSTATUS%%" == "0") {
    window.location = nextPage;
  } else {
    if ("%%Preferences.CheckoutAllowCheckoutWhenPrinterDown%%" == "0") {
      window.location = '/printerErrorNoCheckout.htm';
    } else {
      if ("%%Preferences.ReceiptPrinterShowStatus%%" != "0" && "%%Preferences.CheckoutPrintReceipt%%" != "0")
        window.location = '/printErrorPrompt.htm?nextPage=' + nextPage;
      else
        window.location = nextPage;
    }
  }
}

function formatAsCurrency(s, showSymbol) {
	var parts = s.split(".");
	if (parts.length == 1)
		s = s + ".00";
	else if (parts[1].length < 2) {
		while (parts[1].length < 2) {
			parts[1] = parts[1] + "0";
		}
		s = s + parts[1];
	}
	if (showSymbol) {
		s = "%%Text.txtMyAccountPage_CurrencySymbol%%" + s;
	}
	return s;
}

function checkoutFailedBecauseOfFee(item) {
	var feeAmount = parseFloat(item.feeAmount);
	return ((item.itemGroup.code == "NOT_CIRCULATED") && (feeAmount != NaN) && (feeAmount > 0.0))
}

function setLangText()  {
  textInLang.txtPrintReceiptOptionsPage_provideEmailAddress   = "%%Text.txtPrintReceiptOptionsPage_provideEmailAddress%%";
  textInLang.txtPrintReceiptOptionsPage_buttonGo        = "%%Text.txtPrintReceiptOptionsPage_buttonGo%%";
  textInLang.txtCheckoutReceiptEmailSubject   = "%%Text.txtCheckoutReceiptEmailSubject%%";
  textInLang.txtCheckinReceiptEmailSubject  = "%%Text.txtCheckinReceiptEmailSubject%%";
  textInLang.currentLanguage = "%%Session.CurrentLanguage%%";
  textInLang.printerStatus = "%%Session.PrinterStatus%%";
  textInLang.printReceipt = "%%Preferences.CheckoutPrintReceipt%%";
  textInLang.sendEmailReceipt = "%%Preferences.CheckoutSendEmailReceipt%%";
}

function startAutoUpload()
{
	var url = "/selfCheck?action=startAutoUploadAction";
	ajaxRequest(url, autoUploadStarted, null, "GET", null);	
}

function autoUploadStarted()
{
}

function autoUploadError()
{
}