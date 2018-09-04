loadStylesheet();

var listTemplateFile = 'irsList.xml';
var itemsParentNode = 'irsList';

function initialize() {
  adjustElementsByScreenHeight();
  renderAdminPageHeader("%%Text.txtPageHeader_IRSHeader%%", 0, "");
  setTimeout("ajaxRefresh()", 1000);
  initializeChangeLanguageButtons("IntReturn.htm");
  initializeHelpRequestButtons();
  hideElement("please_wait_div");
}

function ajaxRefresh() {
  url = "/selfCheck?action=refresh&contentTemplate=/" + listTemplateFile + "&itemLimits=Session.CheckedInItems,50";

  $(document).ready(function() {
    $.ajax( {
        type : "GET",
        url : url,
        dataType : "xml",
        data: "",
        cache : false,
        async : true,
        timeout: 900000,
        success : function(response) { refreshItems(response) },
        error : function(response) { refreshItems(response) }
    });
  });
}

function refreshItems(content) {
  rootNode = $('checkinList', content);
  refreshItemCounts(rootNode);
  refreshItemsList(rootNode);
  setTimeout("ajaxRefresh()", 3000);
}

function refreshItemCounts(rootNode) {
  $('#numItemsCheckedIn').text(defaultToZero(rootNode.find("itemCnt").text()));
  $('#numHoldItemsCheckedIn').text(defaultToZero(rootNode.find("holdItemsCnt").text()));
  $('#numTransitionItemsCheckedIn').text(defaultToZero(rootNode.find("transitionItemsCnt").text()));
  $('#numErrors').text(defaultToZero(rootNode.find("errorCnt").text()));
}

function defaultToZero(str) {
  return str == '' ? 0 : str;
}

function refreshItemsList(xmlContent) {
  displayedProcessedItems = processItems(xmlContent);
  $('#checkInItemListTable').val(displayedProcessedItems);
  scrollToBottomOfList(document.getElementById("checkInItemListTable"));
}

function processItems(rootNode) {
  displayedProcessedItems = new Array();
  itemsNode = $('successful', rootNode);
  $('itemRecord', itemsNode).each(function () {
    var item = createItem(this);
    displayedProcessedItems.push(item.id + " " + item.title + " " + item.alertType + " " + item.destinationLocation);
  });
  return displayedProcessedItems.join("\n");
}

function createItem(itemRecordNode) {
  var title = $(itemRecordNode).find("title").text();
  var itemId = $(itemRecordNode).find("barcode").text();
  var alertType = $(itemRecordNode).find("alertType").text();
  var destinationLocation = $(itemRecordNode).find("destinationLocation").text();
  return new Item(itemId, title, alertType, destinationLocation);
}

function Item(id, title, alertType, destinationLocation) {
    this.id = id;
    this.title = title;
    this.alertType = alertType;
    this.destinationLocation = destinationLocation;
}