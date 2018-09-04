// formUtilities.js
//
// Copyright(c)2006-2007 EnvisionWare, Inc. - All Rights Reserved
//
// This file provides Javascript utility functions for working
// with HTML forms.
//

function disableActionButtons() {
  var buttonsDiv = document.getElementById("actionButtons");
  if (buttonsDiv) {
    var buttonsDivElements = buttonsDiv.getElementsByTagName("*");
    if (buttonsDivElements) {
      for (var i = 0, maxI = buttonsDivElements.length; i < maxI; ++i) {
        var currElement = buttonsDivElements[i];
        if (currElement.type == "button")
          currElement.disabled = true;
      }
    }
  }
  return true;
}

function getInputAndDisableControl(control, field, showPleaseWaitMessage) {
  field.value = control.value;
  control.disabled = true;
  submitUserCredentials(showPleaseWaitMessage);
  return true;
}

function submitUserCredentials(showPleaseWaitMessage) {
  disableActionButtons();
  if ( (typeof timer != "undefined") && (timer != null) ) {
    timer.stop();
  }
  if (showPleaseWaitMessage) {
    showPleaseWait();
  }
  return true;
}

function initEntryForm(targetForm, inputFieldId, showKeypad) {
  var inputField = document.getElementById(inputFieldId);
  inputField.value = "";
  inputField.disabled = false;
  inputField.focus();
}

var demoItems = new Array();
demoItems["31081000014947"] = "The Shipping News";
demoItems["39154005162219"] = "Concise Dictionary of Canadianism";
demoItems["39154005162706"] = "Fugitive Pieces";
demoItems["31081000026701"] = "Never Say 'Boo' to a Ghost";
demoItems["31081000044662"] = "Jumanji";
demoItems["31081000039647"] = "Stolen Life";
demoItems["31081000020985"] = "Stolen Life";
demoItems["310810000109521"] = "Wake up and smell the planet";
demoItems["31081000020506"] = "Rabbit-proof fence";
demoItems["31081000023468"] = "Napoleon";
demoItems["31081000038821"] = "Road Atlas Australia";
demoItems["31081000011687"] = "You've got to read this book";
demoItems["31081000061310"] = "Starstruck";
demoItems[""] = "Barnaby's Bunny";

function setDemoItemInformation() {
  var item = document.getElementById('itemIdField').value;
  var dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 21);
  title = (demoItems[item]) ? demoItems[item] : demoItems[""];
  return new DemoItem(title, dueDate.toString().substr(0,10));
}

function DemoItem(title, dueDate) {
  this.title = title;
  this.dueDate = dueDate;
}