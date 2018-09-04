var errorItems = new Array();
var acknowledgedErrorItems = new Array();

function initScanItemsForm(hideItemIdPreference, targetForm, inputFieldId, instructionsText) {
  if ("%%Preferences.CheckoutHideItemIdField%%" == "1") {
    hideElement("entry_field_container");
    addClass('circulation_content_group_extended', 'circulation_content_group');
    addClass('circulation_group_extended', 'circulation_group');
    addClass('circulation_list_group_extended', 'circulation_list_group');
    addClass('circulation_splash_group_extended', 'circulation_splash_group');
    addClass('circulation_list_container_extended', 'circulation_list_container');
    addClass('circulation_list_container_extended', 'circulation_list_container');
  } else {
    initEntryForm(targetForm, inputFieldId);
  }

  if ("%%Preferences.useRfid%%" == "Yes") {
    document.getElementById("circulation_instructions_text").innerHTML = "%%Text.txtScanItemsPage_RfidInstructions%%";
  }
}

function initializeScrollBar(listContainer) {
  var checkinListHeight = $('#' + listContainer).height() + 'px';
  $('#' + listContainer).slimscroll({
    alwaysVisible: true,
    disableFadeOut: true,
    height: checkinListHeight,
    color: 'gray'
  });
}

function initializeAnimation() {
  hideElement("circulation_rfid_splash_animation_container");
  hideElement("circulation_barcode_splash_animation_container");
  hideElement("circulation_content_group");

  document.getElementById("circulation_rfid_splash_animation_video").addEventListener("playing", function() {
    showSplashAnimation();
  });

  document.getElementById("circulation_barcode_splash_animation_video").addEventListener("playing", function() {
    showSplashAnimation();
  });
}

function showSplashAnimation() {
  var circulationContentIsVisible = document.getElementById("circulation_content_group").style.visibility;
  if (!circulationContentIsVisible && getTotalCirculationCounts() == 0) {
    showElement("circulation_splash_group");
    visibleElement("circulation_rfid_splash_animation_container", ("%%Preferences.useRfid%%" == "Yes"));
    visibleElement("circulation_barcode_splash_animation_container", !("%%Preferences.useRfid%%" == "Yes"));
  }
}

function hideScrollButtons() {
  toggleScrollButtonVisibility(false);
}

function toggleScrollButtonVisibility(isVisible) {
  visibleElement("scroll_up_button_border", isVisible);
  visibleElement("scroll_down_button_border", isVisible);
}

function ajaxRefresh() {
  url = '/selfCheck?action=refresh&contentTemplate=/' + listTemplateFile;
  ajaxRequest(url, refreshItems, null, "GET", refreshItems);
}

function refreshItems(content) {
  var xmlContent = getXMLContent(content, itemsParentNode);
  if (xmlContent[0] == null)
    return;
  processItemsInEachItemGroup(xmlContent);
  var totalCirculationCountsBeforeUpdate = getTotalCirculationCounts();
  updateCirculationCounts();
  evaluateTimeoutTimerReset(totalCirculationCountsBeforeUpdate);
  evaluateSplashAnimationAndActionButtonsVisibility(xmlContent);
  evaluateScrollToBottom(totalCirculationCountsBeforeUpdate);
  evaluateScrollButtonsVisibility();

  if ("%%Preferences.useRfid%%" == "Yes") {
    timeOutFunc = setTimeout("ajaxRefresh()", 500);
  } else if ("%%Preferences.Checkout:DisplayFailureNotificationsForBarcodeCheckOut%%" == "1") {
	setTimeout("showCirculationErrors()", 0);
  }
}

function showCirculationErrors() {
	if (typeof(displayCirculationError) != 'undefined') {
		while (errorItems.length > 0) {
			var item = errorItems.shift();
			if (!feeIsOwedOnItem(item) && (acknowledgedErrorItems.indexOf(item.id) < 0)) {
				displayCirculationError(item.id, item.title, item.message);
			}
		}
	}
}

function acknowledgeCirculationErrorForItem(itemId) {
	var index = acknowledgedErrorItems.indexOf(itemId);
	if (index < 0) {
		acknowledgedErrorItems.push(itemId);
	}
}

function processItem(item) {
  var table = getCirculationListTable();
  var row = findRowById(table, item.id);
  if (row == null) {
	addCirculationItemRow(table, item);
	if (("%%Preferences.NovelistEnabled%%" == "Yes") 
	&& 	(typeof populateRecommendations != 'undefined')
	&&	!novelist_update_timer) {
		setTimeout(populateRecommendations, 2500);
		novelist_update_timer = setInterval(populateRecommendations, ('%%Preferences.Novelist:UiUpdateInterval%%' || 10) * 1000)
	}
  } else {
    var cells = row.cells;
    updateItemFields(item, cells);
  }
  
  if (item.itemGroup.code == "NOT_CIRCULATED") {
	  if (acknowledgedErrorItems.indexOf(item.itemId) == -1) {		// error has not already been acknowledged for this item
		errorItems.push(item);
	  }
  }
}

function createCirculationListHeaderCell(headerRow, headerId, headerText){
	var headerCell = document.createElement("th");
	headerCell.id = headerId;
	var headerDiv = document.createElement("div");
	headerDiv.id = "circulation_list_header_text";
	var headerText = document.createTextNode(headerText);
	headerDiv.appendChild(headerText);
	headerCell.appendChild(headerDiv);
	headerRow.appendChild(headerCell);
}

function getCirculationListHeaderTable(){
	return document.getElementById("circulation_list_header");

}

function getCirculationListTable() {
  return document.getElementById("circulation_list");
}

function processItemsInEachItemGroup(xmlContent) {
  for (var itemGroupKey in itemGroups) {
      itemGroup = itemGroups[itemGroupKey];
      var itemGroupRecords = xmlContent[0].getElementsByTagName(itemGroup.elementName);
      var itemRecords = itemGroupRecords[0].getElementsByTagName("itemRecord");
    for (var i = 0; i < itemRecords.length; i++) {
      var itemRecord = itemRecords[i];
      processItem(createItem(itemRecord, itemGroup));
    }
  }
}

function findRowById(table, itemId) {
  var numRows = table.rows.length;
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    var row = table.rows[rowIndex];
    if (row.id == itemId)
      return row;
  }
  return null;
}

function initColumnsOrder(columnsOrderList){    
	columnsOrder = columnsOrderList.split(",");
	
	var i;
	for(i = 0; i < columnsOrder.length; i++){
		columnsOrder[i] = columnsOrder[i].trim();
		if (columnsOrder[i].toLowerCase().indexOf("status") > -1)
			statusCell = i;
	}
}

function buildTableHeaderBasedOnColumnsOrder(circulationType){
	var table = getCirculationListHeaderTable();
	var headerRow = document.getElementById("circulation_list_header_row");

	var i;
	for(i = 0; i < columnsOrder.length; i++){
		switch(columnsOrder[i].toLowerCase()){
			case "check in status":
				createCirculationListHeaderCell(headerRow, "checkin_list_status_header", "%%Text.txtCheckInPage_CheckinListStatusHeader%%");
				break;
				
			case "check out status":
				createCirculationListHeaderCell(headerRow, "checkout_list_status_header", "%%Text.txtScanItemsPage_CheckoutListStatusHeader%%");
				break;
				
			case "title":
				circulationType == "checkout"? createCirculationListHeaderCell(headerRow, "checkout_list_title_header", "%%Text.txtScanItemsPage_CheckoutListTitleHeader%%")
				: createCirculationListHeaderCell(headerRow, "checkin_list_title_header", "%%Text.txtCheckInPage_CheckinListTitleHeader%%");
				break;
				
			case "item id":
				circulationType == "checkout"? createCirculationListHeaderCell(headerRow, "checkout_list_item_id_header", "%%Text.txtScanItemsPage_CheckoutListItemIdHeader%%")
				: createCirculationListHeaderCell(headerRow, "checkin_list_item_id_header", "%%Text.txtCheckInPage_CheckinListItemIdHeader%%");
				break;
				
			case "due date":				
				createCirculationListHeaderCell(headerRow, "checkout_list_due_date_header", "%%Text.txtScanItemsPage_CheckoutListDueDateHeader%%");
				break;
		}
	}
	
	table.appendChild(headerRow);
}

function getItemRowBackgroundColorClass(numRows) {
  return (numRows % 2 == 0) ? "even_row" : "odd_row";
}

function updateItemTitle(titleCell, item) {
  var matchingTitle = constructItemTitle(item);
  if (titleCell.innerHTML.toLowerCase() != matchingTitle.toLowerCase())
    titleCell.innerHTML = matchingTitle;
}

function constructItemTitlePieces(item) {
  titlePieces = new Array();
  var title = (item.title != '') ? item.title : "%%Text.txtScanItemsPage_CirculationListTitleUnavailable%%";
  titlePieces.push(title);
  if (item.itemGroup.code == "NOT_CIRCULATED")
    titlePieces.push("%%Text.txtScanItemsPage_CirculationListTitleError%%: " + item.message);
  return titlePieces;
}

function updateItemId(itemIdCell, item) {
  var matchingItemId = constructItemId(item);
  if (itemIdCell.innerHTML.toLowerCase() != matchingItemId.toLowerCase())
    itemIdCell.innerHTML = matchingItemId;
}

function updateItemDueDate(dueDateCell, item) {
  var matchingDueDate = constructDueDate(item);
  if (dueDateCell.innerHTML.toLowerCase() != matchingDueDate.toLowerCase())
    dueDateCell.innerHTML = matchingDueDate;
}

function updateItemStatus(statusCell, item) {
  if (statusCell.id != item.itemGroup.code) {
    statusCell.id = item.itemGroup.code;
    statusCell.className = "base_status";
    statusCell.innerHTML = generateItemStatusIcon(item);
  }
}

function feeIsOwedOnItem(item) {
  var feeAmount = parseFloat(item.feeAmount);
  return (item.itemGroup.code == "NOT_CIRCULATED") && (feeAmount != NaN) && (feeAmount > 0.0);
}

function generateItemStatusIcon(item) {
  var feeAmount = parseFloat(item.feeAmount);
  if (feeIsOwedOnItem(item)) {
    return "<button id='accept_checkout_fee_button' onclick='confirmFee(\"" + item.feeAmount + "\", \"" + item.title + "\", \"" + item.id + "\"); return false;'>" + item.feeAmount + "%%Text.txtScanItemsPage_CheckoutFeeOwed%%</button>";
  } else {
	icon = (item.isRenewed) ? item.itemGroup.renewStatusIcon : item.itemGroup.statusIcon;
	return "<img class=\"circulation_status_icon\" src=\"images/" + icon + "\" />";
  }
}

function highlightRow(row) {
  row.fadeIn(50);
  row.effect("highlight", {color: "gray"}, 250);
}

function removeClass(removedClassName, element) {
    var currentClassName = element.className;
    var regex = new RegExp("\\s?\\b" + removedClassName + "\\b", "g");
    currentClassName = currentClassName.replace(regex, '');
    element.className = currentClassName;
}

function scrollToBottomOfCirculationList() {
  $('#circulation_list_container').slimScroll({
    scrollTo : $('#circulation_list_container')[0].scrollHeight,
    alwaysVisible: true,
    disableFadeOut: true
  });
}

function getNumItemsByItemGroup(itemGroup) {
  var numItems = 0;
  var table = getCirculationListTable();
  var numRows = table.rows.length;
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    var row = table.rows[rowIndex];
    var itemStatusCell = row.cells[statusCell];
    if (itemStatusCell.id == itemGroup.code)
      numItems++;
  }
  return numItems;
}

function getTotalCirculationCounts() {
  var totalItems = 0;
  for (var itemGroupKey in itemGroups)
    totalItems += parseInt(document.getElementById(itemGroups[itemGroupKey].itemCountId).innerHTML);
  return totalItems;
}

function updateCirculationCounts() {
  for (var itemGroupKey in itemGroups) {
    var itemGroup = itemGroups[itemGroupKey];
    var numItemsBeforeUpdate = parseInt(document.getElementById(itemGroup.itemCountId).innerHTML);
    var numItemsAfterUpdate = getNumItemsByItemGroup(itemGroup);
    document.getElementById(itemGroup.itemCountId).innerHTML = numItemsAfterUpdate;
    evaluateCirculationBadgeVisibility(itemGroup, numItemsBeforeUpdate, numItemsAfterUpdate);
  }
}

function evaluateCirculationBadgeVisibility(itemGroup, numItemsBeforeUpdate, numItemsAfterUpdate) {
  if (itemGroup.hideIfNoItems) {
    if (numItemsBeforeUpdate == 0 && numItemsAfterUpdate > 0)
      document.getElementById(itemGroup.badgeId).style.display = "block";
    else if (numItemsBeforeUpdate > 0 && numItemsAfterUpdate == 0)
      document.getElementById(itemGroup.badgeId).style.display = "none";
  }
}

function evaluateTimeoutTimerReset(totalCirculationCountsBeforeUpdate) {
  var totalCirculationCountsAfterUpdate = getTotalCirculationCounts();
  if (timer != null && totalCirculationCountsAfterUpdate != totalCirculationCountsBeforeUpdate)
    timer.reset();
}

function evaluateScrollButtonsVisibility() {
  var circulationList = document.getElementById("circulation_list_container");
  toggleScrollButtonVisibility((circulationList.scrollHeight > circulationList.clientHeight));
}

function evaluateScrollToBottom(totalCirculationCountsBeforeUpdate) {
  if (totalCirculationCountsBeforeUpdate < getTotalCirculationCounts()) {
    scrollToBottomOfCirculationList();
  }
}

function completeCirculation() {
  if ("%%Preferences.useRfid%%" == "Yes") {
    clearTimeout(timeOutFunc);
    window.location='/selfcheck?action=finishRFID&amp;nextpage=/' + nextPage;
  }  else
    window.location='/' + nextPage;
}

function scanEnteredItem(itemIdField) {
  var url = generateScannedItemUrl(itemIdField.value);
  ajaxRequest(url, scanEnteredItemResult, null, "GET", scanEnteredItemResult);
  return true;
}

function scanEnteredItemResult(content) {
  if ("%%Preferences.useRfid%%" != "Yes") {
    ajaxRefresh();
  }
  clearScannedItemField();
}

function clearScannedItemField() {
  document.getElementById('itemIdField').value = '';
}

function scrollDownCirculationList() {
  $('#circulation_list_container').slimScroll({
    scrollBy: '50px',
    alwaysVisible: true,
    disableFadeOut: true
  });
}

function scrollUpCirculationList() {
  $('#circulation_list_container').slimScroll({
    scrollBy: '-50px',
    alwaysVisible: true,
    disableFadeOut: true
  });
}

