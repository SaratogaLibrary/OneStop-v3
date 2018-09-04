/*
*  Objects and Functions for managing item details views
*
*  Author: rwalsh
*  Copyright(c)2013 EnvisionWare, Inc. - All Rights Reserved
*/

// Global variable representing the active set of item records
var items = null;

// Items container
function Items(ids, displayItemsCallback, errorCallback) {
  this.ids = ids;
  this.currentItemIndex = 0;
  this.itemRecords = null;
  this.firstVisibleItem = 1;
  this.previousFirstVisibleItem = new Array();//this.firstVisibleItem;
  this.lastVisibleItem = 0;
  this.displayItemsCallback = displayItemsCallback;
  this.errorCallback = errorCallback;
}

Items.prototype.getDetail = function() {
  if (this.itemRecords == null) {
    visibleElement("please_wait_div", true);
    this.currentItemIndex = 0;
    this.itemRecords = new Array();
  }

  if (this.currentItemIndex >= this.ids.length) {
    // All items have been retrieved
    this.currentItemIndex = 0;
    this.lastVisibleItem = this.count();
    visibleElement("please_wait_div", false);
    this.displayItems();
  } else {
    // Get the next item
    var id = this.extractId(this.ids[this.currentItemIndex]);
    var request = new AjaxRequest("/selfCheck?action=getItemRecord&itemId="
                      + id
                      + "&nextPage=itemInformation.xml"
					  + "&timestamp=" + new Date().getTime(), // stop cache issues.
                    this,
                    addToItems);
    var result = request.send();
    if (result != AjaxRequest.RESULT.SUCCESS) {
      showError(result, requst.lastError);
    }
  }
}

Items.prototype.extractId = function(str) {
  var space = str.indexOf(' ');
  if (space > 0) {
    return str.substring(0, space);
  }
  return str;
}

Items.prototype.count = function () {
  return this.itemRecords.length;
}

Items.prototype.addItemRecord = function(itemRecord) {
  if (this.itemRecords == null) {
    this.itemRecords = new Array();
  }
  this.itemRecords[this.count()] = itemRecord;
  ++this.currentItemIndex;
}

Items.prototype.getItemRecord = function(whichRecord) {
  return this.itemRecords[whichRecord];
}

Items.prototype.canNavigateBackwards = function() {
  return (this.firstVisibleItem > 1);
}

Items.prototype.navigateBackwards = function() {
  this.firstVisibleItem = this.previousFirstVisibleItem.pop();//this.previousFirstVisibleItem;
  this.displayItems();
}

Items.prototype.canNavigateForwards = function() {
  return (this.lastVisibleItem < this.count());
}

Items.prototype.navigateForwards = function() {
  this.previousFirstVisibleItem.push(this.firstVisibleItem);
  this.firstVisibleItem = this.lastVisibleItem + 1;
  this.lastVisibleItem = this.count();
  this.displayItems();
}

Items.prototype.displayItems = function() {
  this.displayItemsCallback(this);
}

// Item record (used for holds, overdues, and charged items)
function ItemRecord(id, title, mediaType, dueDate, hasBeenRenewed) {
  this.id = id;
  this.title = title;
  this.mediaType = mediaType;
  this.dueDate = dueDate;
  this.hasBeenRenewed = hasBeenRenewed;
}

ItemRecord.prototype.cellForRowAndColumn = function(row, column) {
  var cell = document.createElement("td");
  switch (column) {
  case 0:
    cell.innerText = row + 1;
    break;

  case 1:
    cell.innerHTML = this.title;
    break;

  case 2:
    cell.innerHTML = this.mediaType;
    cell.style.textAlign = "center";
    break;

  case 3:
    cell.innerHTML = this.dueDate;
    cell.style.textAlign = "center";
    cell.id = "item_due_date_" + row;
    break;

  case 4:
    if (this.hasBeenRenewed == false) {
      if (!canRenew) {
        cell.innerHTML = "&nbsp;";
      } else {
        var button = document.createElement("button");
        button.className = "items_detail_renew_button";
        button.itemIndex = row;
        button.onclick = function(e) {
          renewItem(this.itemIndex);
          return false;
        }
        button.innerText = "%%Text.txtMyAccountPage_Renew%%";
        var buttonBorder = document.createElement("div");
        buttonBorder.className = "items_detail_renew_button_border";

        buttonBorder.appendChild(button);
        cell.appendChild(buttonBorder);
      }
    } else {
      cell.innerText = "%%Text.txtMyAccountPage_Renewed%%";
    }
    cell.id = "renew_item_" + row;
    cell.style.textAlign = "center";
    break;
  }
  return cell;
}

function addToItems(context, status, textContent, xmlContent) {
  var itemDetail = getXMLContent(textContent, "itemInformation");
  context.addItemRecord(new ItemRecord(  getNodeValue(itemDetail[0], "barcode"),
                      getNodeValue(itemDetail[0], "title").replace(/&59;/g, ";"),
                      getNodeValue(itemDetail[0], "mediaType"),
                      getNodeValue(itemDetail[0], "dueDate"),
                      false /* Has Item been renewed? */));
  setTimeout(function() { context.getDetail(false); }, 0);
}

// Fine Item record
function FineItemRecord() {
  this.id = "";
  this.type = "";
  this.amount = "";
  this.title = "";
}

FineItemRecord.prototype.cellForRowAndColumn = function(row, column) {
  var cell = document.createElement("td");
  switch (column) {
  case 0:
    cell.innerText = row + 1;
    break;

  case 1:
    cell.innerHTML = this.type;
    cell.style.textAlign = "center";
    break;

  case 2:
    cell.innerHTML = this.title;
    break;

  case 3:
    cell.innerHTML = this.amount;
    cell.style.textAlign = "right";
    break;
  }
  return cell;
}