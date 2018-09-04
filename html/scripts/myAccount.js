loadStylesheet();

var timer = null;
var canRenew = false;


function initialize() {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckOutHeader%%", "%%Preferences.PageTimeout%%", "");
  timer = new Timer("%%Preferences.PageTimeout%%", "%%Text.txtMyAccountPage_Seconds%%");
  timer.start();

  initializeChangeLanguageButtons("myAccount.htm");
  initializeHelpRequestButtons();
  hideElement("please_wait_div");

  var feesAmount = "%%User.FeeAmount%%";
  var owesFee = userOwesFee(feesAmount);
  var payFinesAllowed = isFlagSet("%%Preferences.PayFinesAllowed%%");
  var canCheckOutItems = !isFlagSet("%%User.ChargePrivilegesDenied%%");

  visibleElement("home_address", isFlagSet("%%Preferences.MyAccount:ShowUserAddress%%"));
  visibleElement("ils_status", isFlagSet("%%Preferences.MyAccount:ShowIlsStatus%%"));
  visibleElement("next_button_border", canCheckOutItems);

  var numOverdueItems = "%%User.OverdueItemsCount%%";
  var numHoldItems = "%%User.HoldItemsCount%%";
  var numChargedItems = "%%User.ChargedItemsCount%%";
  var canRenewChargedItems = isFlagSet("%%Preferences.MyAccount:AllowUserToRenewChargedItems%%");
  var renewalPrivilegesDenied = isFlagSet("%%User.RenewalPrivilegesDenied%%");
  if (numChargedItems > 0 && canRenewChargedItems && !renewalPrivilegesDenied) {
    canRenew = true;
  }

  if ("%%Session.NumberOfItemsCheckedOut%%" != "0") {
    document.getElementById("start_over_button").innerHTML = "%%Text.txtMyAccountPage_Done%%";
  }

  initializeHoldItemsButton(isFlagSet("%%Preferences.MyAccount:AllowUserToViewHoldItems%%"), numHoldItems);
  initializeOverdueItemsButton(isFlagSet("%%Preferences.MyAccount:AllowUserToViewOverdueItems%%"), numOverdueItems);
  initializeChargedItemsButton(isFlagSet("%%Preferences.MyAccount:AllowUserToViewChargedItems%%"), canRenew, numChargedItems);
  initializeFeesButton((payFinesAllowed && owesFee));
  initializeErrorMessage(canCheckOutItems, numChargedItems, canRenewChargedItems, renewalPrivilegesDenied);

  hideElement("all_items_detail_group");
  hideElement("charged_items_detail_group");
  hideElement("hold_items_detail_group");
  hideElement("overdue_items_detail_group");
}

function initializeHoldItemsButton(canViewHoldItems, numHoldItems) {
  var enableHoldItemsButton = (canViewHoldItems && numHoldItems != 0);
  enableElement("hold_items_button", enableHoldItemsButton);
  if (enableHoldItemsButton)
    document.getElementById("hold_items_button_text").innerHTML = "%%Text.txtMyAccountPage_View%%";
  else
    addClass("disabled_my_account_content_button_border", "hold_items_button_border");
}

function initializeOverdueItemsButton(canViewOverdueItems, numOverdueItems) {
  var enableOverdueItemsButton = (canViewOverdueItems && numOverdueItems != 0);
  enableElement("overdue_items_button", enableOverdueItemsButton);
  if (enableOverdueItemsButton)
    document.getElementById("overdue_items_button_text").innerHTML = "%%Text.txtMyAccountPage_View%%";
  else
    addClass("disabled_my_account_content_button_border", "overdue_items_button_border");
}

function initializeChargedItemsButton(canViewChargedItems, canRenewItems, numChargedItems) {
  var enableChargedItemsButton = (canViewChargedItems && numChargedItems != 0);
  enableElement("charged_items_button", enableChargedItemsButton);
  var buttonText = "";
  if (enableChargedItemsButton && canRenewItems) {
    buttonText = "%%Text.txtMyAccountPage_ViewOrRenew%%";
  } else if (enableChargedItemsButton) {
    buttonText = "%%Text.txtMyAccountPage_View%%";
  } else {
    addClass("disabled_my_account_content_button_border", "charged_items_button_border");
  }
  document.getElementById("charged_items_button_text").innerHTML = buttonText;
}

function initializeFeesButton(canPayFees) {
  enableElement("fees_button", canPayFees);
  var buttonText = "";
  if (canPayFees)
    document.getElementById("fees_button_text").innerHTML = "%%Text.txtMyAccountPage_PayFeeOwed%%";
  else
    addClass("disabled_my_account_content_button_border", "fees_button_border");
}

function initializeErrorMessage(canCheckOutItems, numChargedItems, canRenewChargedItems, renewalPrivilegesDenied) {
  var hasCheckOutError = !canCheckOutItems;
  var hasRenewError = (canRenewChargedItems && renewalPrivilegesDenied);
  var errorMessage = "";

  if (hasCheckOutError && hasRenewError)
    errorMessage = "%%Text.txtMyAccountPage_NoCheckOutNoRenewErrorMessage%%";
  else {
    if (hasCheckOutError && !hasRenewError)
      errorMessage = "%%Text.txtMyAccountPage_NoCheckOutErrorMessage%%";
    else if (hasRenewError && numChargedItems > 0)
      errorMessage = "%%Text.txtMyAccountPage_NoRenewErrorMessage%%";
  }

  if (errorMessage != "")
    document.getElementById("my_account_error_message_text").innerHTML = errorMessage;
}

function payFines() {
  var owesFee = userOwesFee("%%User.FeeAmount%%");
  var payFinesAllowed = isFlagSet("%%Preferences.PayFinesAllowed%%");
  if (payFinesAllowed && owesFee) {
    timer.stop();
    url = "/selfCheck?action=payFines";
    ajaxRequest(url, pay_fines_complete, null, "GET", pay_fines_complete);
  }
}

function pay_fines_complete() {
  window.location = "/selfCheck?action=getUserRecord&nextPage=/myAccount.htm&userId=%%Session.UserId%%&pin=%%Session.UserPin%%&requestDetail=1";
}

function showError(status, text) {
  document.getElementById("errorMsg").innerHTML = "%%Text.txtMyAccountPage_Error%%:" + status + " - " + text;
  visibleElement("errorDiv", true);
}

function deleteRowsFromTable(tableId) {
  var table = document.getElementById(tableId);
  var body = table.tBodies[0];
  while (body.rows.length > 0) {
    var r = body.rows[body.rows.length - 1];
    while (r.cells.length > 0) {
      r.deleteCell(r.cells.length - 1);
    }
    body.deleteRow(body.rows.length - 1);
  }
}

function prepareItemsDetail(title, tableId, divId) {
  hideItemDetailTables();
  $('#all_items_detail_group').modal();
  visibleElement(divId, true);
  deleteRowsFromTable(tableId);
}

function populateItemsDetailTable(tableId, columnClasses, items, showRenewButton) {
  var table = document.getElementById(tableId);
  var maxItems = 9;
  var firstItemInPage = items.firstVisibleItem;
  var numRemainingItems = items.count() - firstItemInPage + 1;
  var maxItemsInPage = (numRemainingItems < maxItems) ? numRemainingItems : maxItems;
  var itemsInPage = 0;
  var currentItemIndex;
  for (currentItemIndex = items.firstVisibleItem - 1; itemsInPage < maxItemsInPage; ++currentItemIndex) {
    var row = document.createElement("tr");
    row.className = ((itemsInPage % 2 == 0) ? "even_row" : "odd_row") + " items_detail_items_table_row";
    for (var y = 0; y < columnClasses.length; ++y) {
      var cell = items.getItemRecord(currentItemIndex).cellForRowAndColumn(currentItemIndex, y);
      cell.className = columnClasses[y];
      row.appendChild(cell);
    }
    table.tBodies[0].appendChild(row);
    itemsInPage++;
  }
  items.lastVisibleItem = currentItemIndex;

  var countCell = document.getElementById("items_detail_display_count");
  countCell.innerText = "%%Text.txtMyAccountPage_Displaying%% "
                      + firstItemInPage
                      + "-"
                      + items.lastVisibleItem
                      + " %%Text.txtMyAccountPage_Of%% "
                      + items.count();

  visibleElement("items_detail_previous_button_border", items.canNavigateBackwards());
  visibleElement("items_detail_next_button_border", items.canNavigateForwards());
  visibleElement("renew_all_items_button_border", showRenewButton);
}

function escapeSpecialCharactersInItemInformation(str) {
  return str
      .replace(/ &quot;/g, " [")
      .replace(/&quot; /g, "] ")
      .replace(/&59;/g, "&59")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "&39")
	  .replace(/&92;/g, "\\\\");
}

function getHoldItemsDetail() {
  items = new Items(escapeSpecialCharactersInItemInformation("%%User.HoldItems%%").split(";"), showHoldItemsDetail, showError);
  items.getDetail();
}

function holdItemsColumnClasses() {
  return ['items_detail_column hold_items_detail_first_column', 'items_detail_column hold_items_detail_title_column',
          'items_detail_column hold_items_detail_media_type_column'];
}

function showHoldItemsDetail(items) {
  prepareItemsDetail("%%Text.txtMyAccountPage_HoldItems%%", "hold_items_detail_items_table", "hold_items_detail_group");
  populateItemsDetailTable("hold_items_detail_items_table", holdItemsColumnClasses(), items, false);
}

function overdueItemsColumnClasses() {
  return ['items_detail_column overdue_items_detail_first_column', 'items_detail_column overdue_items_detail_title_column',
          'items_detail_column overdue_items_detail_media_type_column', 'items_detail_column overdue_items_detail_due_date_column'];
}

function getOverdueItemsDetail() {
  items = new Items(escapeSpecialCharactersInItemInformation("%%User.OverdueItems%%").split(";"), showOverdueItemsDetail);
  items.getDetail();
}

function showOverdueItemsDetail(items) {
  prepareItemsDetail("%%Text.txtMyAccountPage_OverdueItems%%", "overdue_items_detail_items_table", "overdue_items_detail_group");
  populateItemsDetailTable("overdue_items_detail_items_table", overdueItemsColumnClasses(), items, false);
}

function getChargedItemsDetail() {
  items = new Items(escapeSpecialCharactersInItemInformation("%%User.ChargedItems%%").split(";"), showChargedItemsDetail);
  items.getDetail();
}

function chargedItemsColumnClasses() {
  return ['items_detail_column charged_items_detail_first_column', 'items_detail_column charged_items_detail_title_column',
          'items_detail_column charged_items_detail_media_type_column', 'items_detail_column charged_items_detail_due_date_column',
          'items_detail_column charged_items_detail_renew_column'];
}

function showChargedItemsDetail(items) {
  prepareItemsDetail("%%Text.txtMyAccountPage_CheckedOutItems%%", "charged_items_detail_items_table", "charged_items_detail_group");
  populateItemsDetailTable("charged_items_detail_items_table", chargedItemsColumnClasses(), items, canRenew);
}

function hideItemDetailTables() {
  hideElement("charged_items_detail_group");
  hideElement("hold_items_detail_group");
  hideElement("overdue_items_detail_group");
}

var renewItemIndex = -1;
var renewAll = false;
var hasRenewedItems = false;

function renewAllItems() {
  renewAll = true;
  renewItem(0);
}

function renewItem(which) {
  if (items == null) {
    return;
  }

  renewItemIndex = which;
  if (items.getItemRecord(which).hasBeenRenewed == false) { // Item has not already been renewed
    visibleElement("please_wait_div", true);
    var request = new AjaxRequest("/selfCheck?action=renewItem&userId="
                      + "%%Session.UserId%%"
                      + "&itemId="
                      + items.getItemRecord(which).id
                      + "&nextPage=itemInformation.xml"
					  + "&timestamp=" + new Date().getTime(), // stop cache issues.
                    items,
                    processRenewItemResponse);
    var result = request.send();
    if (result != AjaxRequest.RESULT.SUCCESS) {
      showError(result, request.lastError);
    }
  } else if (renewAll && (++which < items.count())) {
    renewItem(which);
  } else {
    renewAll = false;
  }
}

function processRenewItemResponse(context, status, textContent, xmlContent) {
  visibleElement("please_wait_div", false);
  if (context == null) {
    return;
  }

  var element = null;
  var itemDetail = getXMLContent(textContent, "itemInformation");
  if (isFlagSet(getNodeValue(itemDetail[0], "result"))) {
    context.getItemRecord(renewItemIndex).dueDate = getNodeValue(itemDetail[0], "dueDate");
    element = document.getElementById("item_due_date_" + renewItemIndex);
    if (element != null) {
      element.innerText = context.getItemRecord(renewItemIndex).dueDate;
    }
    element = document.getElementById("renew_item_" + renewItemIndex);
    if (element != null) {
      element.innerText = "%%Text.txtMyAccountPage_Renewed%%";
    }
    context.getItemRecord(renewItemIndex).hasBeenRenewed = true;
    hasRenewedItems = true;
    document.getElementById("start_over_button").innerText = "%%Text.txtMyAccountPage_Done%%";
  } else {
    element = document.getElementById("renew_item_" + renewItemIndex);
    if (element != null) {
      element.innerText = "%%Text.txtMyAccountPage_RenewFailed%%";
    }
  }

  if (renewAll && (++renewItemIndex < context.count())) {
    renewItem(renewItemIndex);
  } else {
    renewAll = false;
  }
}

function previousChargedItemsDetail() {
  if (items != null) {
    items.navigateBackwards();
  }
}

function nextChargedItemsDetail() {
  if (items != null) {
    items.navigateForwards();
  }
}

function hideItemsDetail() {
  items = null;
  hideElement("charged_items_detail_group");
  hideElement("hold_items_detail_group");
  hideElement("items_detail_previous_button_border");
  hideElement("items_detail_next_button_border");
}

function done() {
  if ("%%Session.NumberOfItemsCheckedOut%%" != "0") {
    if (isFlagSet("%%Preferences.useRfid%%")) {
      window.location='/selfcheck?action=finishRFID&amp;nextpage=/scanItemsNext.htm';
    } else
      window.location='/scanItemsNext.htm';
  } else {
    window.location='/resetSession.htm';
  }
}