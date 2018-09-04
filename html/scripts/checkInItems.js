loadStylesheet();
var timeOutFunc;
var timer;
var totalItemCount = 0;
var itemGroups = new Array();
var listTemplateFile = 'checkinList.xml';
var itemsParentNode = 'checkinList';
var nextPage = 'checkinNext.htm';
var statusCell = 0;
var columnsOrder = new Array();

function initializeCheckIn() {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckInHeader%%", "%%Preferences.PageLongTimeout%%", "");
  initializeAnimation();
  initItemGroups();
  initScanItemsForm("%%Preferences.CheckinHideItemIdField%%", "scanItemForm", "itemIdField", "%%Text.txtCheckinPage_RfidInstructions%%");
  initColumnsOrder("%%Preferences.CheckinListColumnsOrder%%");
  buildTableHeaderBasedOnColumnsOrder("checkin");

  if (getPageFilename("%%Preferences.MainPage%%").toLowerCase() == "checkinstart.htm")  {
    hideElement("start_over_button_border");
  }

  hideScrollButtons();
  initializeScrollBar('circulation_list_container');

  if ("%%Session.NumberOfItemsCheckedIn%%" == "0") {
    hideElement("finished_button_border");
    showElement("start_over_button_border");
  } else {
    showElement("finished_button_border");
  }

  initializeHelpRequestButtons();
  initializeChangeLanguageButtons("checkin.htm");
  hideElement("please_wait_div");

  var btnText;
  if ((("%%Preferences.CheckinPrintReceipt%%" == "0") || ("%%Session.PrinterStatus%%" != "0")) && ("%%Preferences.CheckinSendEmailReceipt%%" == "No"))
    btnText = "%%Text.txtCheckInPage_Done%%";
  else
    btnText = "%%Text.txtCheckInPage_PrintReceipt%%";

  var button = document.getElementById("finished_button_text");
  if (button) {
    button.innerHTML = btnText;
  }

  timer = new Timer("%%Preferences.PageLongTimeout%%", "%%Text.txtCheckinPage_Seconds%%");
  timer.start();

  ajaxRefresh();

  document.getElementById("numCheckedIn").innerHTML = "0";
  document.getElementById("numNotCheckedIn").innerHTML = "0";
  document.getElementById("numReposition").innerHTML = "0";
}

function initItemGroups() {
  itemGroups[0] = new ItemGroup("CIRCULATED", "successful", "CheckedIn", "numCheckedIn", "%%Text.txtCheckinPage_CheckedInStatus%%", "circulated_badge", false, "checked_in_status.png");
  itemGroups[1] = new ItemGroup("REPOSITION", "pending", "Reposition", "numReposition", "%%Text.txtCheckinPage_RepositionStatus%%", "circulation_reposition_badge", true, "reposition_status.png");
  itemGroups[2] = new ItemGroup("NOT_CIRCULATED", "errors", "NotCheckedIn", "numNotCheckedIn", "%%Text.txtCheckinPage_NotCheckedInStatus%%", "not_circulated_badge", true, "not_checked_in_status.png");
}

function ItemGroup (code, elementName, itemGroupId, itemCountId, description, badgeId, hideIfNoItems, statusIcon) {
  this.code = code;
  this.elementName = elementName
  this.itemGroupId = itemGroupId;
  this.itemCountId = itemCountId;
  this.description = description;
  this.badgeId = badgeId;
  this.hideIfNoItems = hideIfNoItems;
  this.statusIcon = statusIcon;
}

function createItem(itemRecord, itemGroup) {
  var title = getNodeValue(itemRecord,'title');
  var itemId = getNodeValue(itemRecord,'barcode');
  var message = getNodeValue(itemRecord,'message');
  return new Item(itemId, title, message, itemGroup);
}

function Item (id, title, message, itemGroup) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.itemGroup = itemGroup;
}

function updateItemFields(item, cells) {
  var i;
	for(i = 0; i < columnsOrder.length; i++){
		switch(columnsOrder[i].toLowerCase()){
		case "title":
			updateItemTitle(cells[i], item);
			break;
		case "item id":
			updateItemId(cells[i], item);
			break;
		case "check out status":
			updateItemStatus(cells[i], item);
			break;
		}
	}
}

function addCirculationItemRow(table, item) {
  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);
  row.id = item.id;
  row.className = "circulation_list " + getItemRowBackgroundColorClass(rowCount);

  var lastRow = $("#" + table.id + " tr:last");
  lastRow.hide();

  var i;
  for (i = 0; i < columnsOrder.length; i++){ 
		switch(columnsOrder[i].toLowerCase()){
		case "check in status":
			var statusCell = row.insertCell(i);
			updateItemStatus(statusCell, item);
			break;
			
		case "title":
			var titleCell = row.insertCell(i);
			titleCell.className = "checkout_list_cell checkin_list_title_cell";
			updateItemTitle(titleCell, item);
			break;
			
		case "item id":
			var itemIdCell = row.insertCell(i);
			itemIdCell.className = "checkout_list_cell checkin_list_item_id_cell";
			updateItemId(itemIdCell, item);
			break;
		}
  }

  highlightRow(lastRow);
}

function constructItemTitle(item) {
  var titlePieces = constructItemTitlePieces(item);
  return "<div class=\"checkin_list_cell_text checkin_list_title_cell_text\">" + titlePieces.join(" - ") + "</div>";
}

function constructItemId(item) {
  return "<div class=\"checkin_list_cell_text checkin_list_item_id_cell_text\">" + item.id + "</div>";
}

function evaluateSplashAnimationAndActionButtonsVisibility(xmlContent) {
  var numCirculatedItems = getNodeValue(xmlContent[0], "itemCnt");
  var numRepositionItems = getNodeValue(xmlContent[0], "pendingCnt");
  var numErrorItems = getNodeValue(xmlContent[0], "errorCnt");
  if (numCirculatedItems == 0 && numErrorItems == 0 && numRepositionItems == 0) {
    hideElement("finished_button_border");
    showElement("start_over_button_border");
  } else {
    hideElement("circulation_splash_group");
    hideElement("circulation_rfid_splash_animation_container");
    hideElement("circulation_barcode_splash_animation_container");
    showElement("circulation_content_group");
    showElement("finished_button_border");
  }
}

function generateScannedItemUrl(itemId) {
  return "/selfCheck?action=checkin&itemId=" + itemId;
}