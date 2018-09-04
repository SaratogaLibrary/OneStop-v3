loadStylesheet();
var useDemoMode = ("%%Preferences.UseDemoMode%%" == "1");
var timeOutfunc;
var timer;
var itemGroups = new Array();
var listTemplateFile = 'checkoutList.xml';
var itemsParentNode = 'checkoutList';
var nextPage = 'scanItemsNext.htm';
var statusCell = 0;
var columnsOrder = new Array();

function initializeScanItems(pageName) {
  adjustElementsByScreenHeight();
  renderPageHeader("%%Text.txtPageHeader_CheckOutHeader%%", "%%Preferences.PageLongTimeout%%", "%%User.fullName%%");
  initializeAnimation();
  initItemGroups();
  initScanItemsForm("%%Preferences.CheckoutHideItemIdField%%", "scanItemForm", "itemIdField", "%%Text.txtScanItemsPage_RfidInstructions%%");
  initColumnsOrder("%%Preferences.CheckoutListColumnsOrder%%");
  buildTableHeaderBasedOnColumnsOrder("checkout");

  if ("%%User.CardReportedLost%%" == "Yes") {
    window.location = "/lostCardError.htm";
    return;
  } else if ("%%User.ChargePrivilegesDenied%%" == "Yes") {
    window.location = "/myAccount.htm";
    return;
  }

  hideScrollButtons();
  initializeScrollBar('circulation_list_container');

  if ("%%Session.NumberOfItemsCheckedOut%%" == "0") {
    hideElement("finished_button_border");
    showElement("start_over_button_border");
    if ("%%Session.ILSOffLine%%" == "1")
      hideElement("my_account_button_border");
    else
      showElement("my_account_button_border");
  } else {
    showElement("finished_button_border");
    hideElement("start_over_button_border");
    hideElement("my_account_button_border");
  }

  initializeChangeLanguageButtons(pageName || "scanItems.htm");
  initializeHelpRequestButtons();
  hideElement("please_wait_div");
  hideElement("confirm_checkout_fee_div");
  
  var btnText;
  if ((("%%Preferences.CheckoutPrintReceipt%%" == "0") || ("%%Session.PrinterStatus%%" != "0")) && ("%%Preferences.CheckoutSendEmailReceipt%%" == "No")) {
    btnText = "%%Text.txtScanItemsPage_Done%%";
  } else {
    btnText = "%%Text.txtScanItemsPage_PrintReceipt%%";
  }

  var button = document.getElementById("finished_button_text");
  if (button) {
    button.innerHTML = btnText;
  }

  timer = new Timer("%%Preferences.PageLongTimeout%%", "%%Text.txtScanItemsPage_Seconds%%");
  timer.start();

  ajaxRefresh();

  document.getElementById("numCheckedOut").innerHTML = "0";
  document.getElementById("numNotCheckedOut").innerHTML = "0";
  document.getElementById("numReposition").innerHTML = "0";
}

function initItemGroups() {
  itemGroups[0] = new ItemGroup("CIRCULATED", "successful", "CheckedOut", "numCheckedOut", "%%Text.txtScanItemsPage_CheckedOutStatus%%", "%%Text.txtScanItemsPage_RenewedStatus%%", "circulated_badge", false, "checked_out_status.png", "renewed_status.png");
  itemGroups[1] = new ItemGroup("REPOSITION", "pending", "Reposition", "numReposition", "%%Text.txtScanItemsPage_RepositionStatus%%", "%%Text.txtScanItemsPage_RepositionStatus%%", "circulation_reposition_badge", true, "reposition_status.png", "");
  itemGroups[2] = new ItemGroup("NOT_CIRCULATED", "errors", "NotCheckedOut", "numNotCheckedOut", "%%Text.txtScanItemsPage_NotCheckedOutStatus%%", "%%Text.txtScanItemsPage_NotRenewedStatus%%", "not_circulated_badge", true, "not_checked_out_status.png", "");
}

function ItemGroup(code, elementName, itemGroupId, itemCountId, description, renewDescription, badgeId, hideIfNoItems, statusIcon, renewStatusIcon) {
  this.code = code;
  this.elementName = elementName
  this.itemGroupId = itemGroupId;
  this.itemCountId = itemCountId;
  this.description = description;
  this.renewDescription = renewDescription;
  this.badgeId = badgeId;
  this.hideIfNoItems = hideIfNoItems;
  this.statusIcon = statusIcon;
  this.renewStatusIcon = renewStatusIcon;
}

function createItem(itemRecord, itemGroup) {
  var title = getNodeValue(itemRecord,'title');
  var itemId = getNodeValue(itemRecord,'barcode');
  var dueDate = getNodeValue(itemRecord,'dueDate');
  var feeType = getNodeValue(itemRecord,'feeType');
  var feeAmount = getNodeValue(itemRecord,'feeAmount');
  var message = getNodeValue(itemRecord,'message');
  var isRenewed = isItemRenewed(getNodeValue(itemRecord, 'renewed'));
  return new Item(itemId, title, dueDate, feeType, feeAmount, message, itemGroup, isRenewed);
}

function isItemRenewed(renewalText) {
  return (renewalText.indexOf("(*)") !== -1);
}

function Item (id, title, dueDate, feeType, feeAmount, message, itemGroup, isRenewed) {
    this.id = id;
    this.title = title;
    this.dueDate = dueDate;
	this.feeType = feeType;
	this.feeAmount = feeAmount;
    this.message = message;
    this.itemGroup = itemGroup;
    this.isRenewed = isRenewed;
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
		case "due date":	
			updateItemDueDate(cells[i], item);
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
		case "check out status":
			var statusCell = row.insertCell(i);
			updateItemStatus(statusCell, item);
			break;
			
		case "title":
			var titleCell = row.insertCell(i);
			titleCell.className = "checkout_list_cell checkout_list_title_cell";
			updateItemTitle(titleCell, item);
			break;
			
		case "item id":
			var itemIdCell = row.insertCell(i);
			itemIdCell.className = "checkout_list_cell checkout_list_item_id_cell";
			updateItemId(itemIdCell, item);
			break;
			
		case "due date":
			var dueDateCell = row.insertCell(i);
			dueDateCell.className = "checkout_list_cell checkout_list_due_date_cell";
			updateItemDueDate(dueDateCell, item);
			break;
		}
  }

  highlightRow(lastRow);
}

function constructItemTitle(item) {
	var titlePieces = constructItemTitlePieces(item);
	var failedDueToFee = checkoutFailedBecauseOfFee(item);
	var s = "<div class=\"checkout_list_cell_text checkout_list_title_cell_text\">";
	if (failedDueToFee)
		s = s + "<span class='item_with_fee_title'>";
	s = s + titlePieces.join(" - ");
	if (failedDueToFee)
		s = s + "</span>";
	s = s + "</div>";
	return s;
}

function constructItemId(item) {
  return "<div class=\"checkout_list_cell_text checkout_list_item_id_cell_text\">" + item.id + "</div>";
}

function constructDueDate(item) {
  return "<div class=\"checkout_list_cell_text checkout_list_due_date_cell_text\">" + item.dueDate + "</div>";
}

function evaluateSplashAnimationAndActionButtonsVisibility(xmlContent) {
  var numCirculatedItems = getNodeValue(xmlContent[0], "itemCnt");
  var numRepositionItems = getNodeValue(xmlContent[0], "pendingCnt");
  var numErrorItems = getNodeValue(xmlContent[0], "errorCnt");
  if (numCirculatedItems == 0 && numErrorItems == 0 && numRepositionItems == 0) {
    hideElement("finished_button_border");
    showElement("start_over_button_border");
    if ("%%Session.ILSOffLine%%" == "1") {
      hideElement("my_account_button_border");
    } else {
      showElement("my_account_button_border");
    }
  } else {
    hideElement("circulation_splash_group");
    hideElement("circulation_rfid_splash_animation_container");
    hideElement("circulation_barcode_splash_animation_container");
    showElement("circulation_content_group");
    showElement("finished_button_border");
    hideElement("start_over_button_border");
    hideElement("my_account_button_border");
  }
}

function generateScannedItemUrl(itemId, feeAcknowledged) {
  if (typeof(feeAcknowledged) === 'undefined') feeAcknowledged = false;
  var url = "/selfCheck?action=checkout&itemId=" + itemId;
  if (feeAcknowledged == true) {
	url += "&feeAcknowledged=Y&suppressDuplicateCheck=Y";
	if ("%%Preferences.UseRfid%%" == "Yes") {
		url += "&flagRfidTag=Y";
	}
  }
  if (useDemoMode == true) {
    var demoItem = setDemoItemInformation();
    url += "&itemTitle=" + demoItem.title + "&itemDueDate=" + demoItem.dueDate + "&demo=true";
  }
  return url;
}

function confirmFee(feeAmount, title, itemId) {
  document.getElementById('checkout_fee_amount').innerText = feeAmount;
  document.getElementById('checkout_fee_item_title').innerHTML = title;
  document.getElementById('checkout_fee_item_id').innerText = itemId;
  $("#confirm_checkout_fee_div").modal();
}

function acceptFee() {
  var itemId = document.getElementById('checkout_fee_item_id').innerText;
  var url = generateScannedItemUrl(itemId, true);
  ajaxRequest(url, scanEnteredItemResult, null, "GET", scanEnteredItemResult);
}

function cancelAcceptFee() {
}

function displayCirculationError(itemId, title, message) {
	document.getElementById('itemIdField').disabled = true;
	if ("%%Preferences.CheckoutHideItemIdField%%" != "1") {
		hideElement('itemIdField');
	}
	document.getElementById('checkout_error_item_id').innerText = itemId;
	document.getElementById('checkout_error_item_title').innerText = title;
	document.getElementById('checkout_error_message').innerText = message;
	$("#checkout_error_div").modal();
	// Force clicks on the background to acknowledge the error (the dialog is automatically closed when the background is clicked)
	$(".vignette").click(function(event) {
		acknowledgeCirculationError();
	});
}

function acknowledgeCirculationError() {
	var itemId = document.getElementById('checkout_error_item_id').innerText;
	acknowledgeCirculationErrorForItem(itemId);
	document.getElementById('itemIdField').disabled = false;
	if ("%%Preferences.CheckoutHideItemIdField%%" != "1") {
		showElement('itemIdField');
	}
	document.getElementById('itemIdField').focus();
}