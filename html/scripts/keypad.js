// keypad.js
//
// Copyright(c)2006-2007 EnvisionWare, Inc. - All Rights Reserved
//
// This file provides Javascript functions to populate an
// input field with keypresses from a keypad.
//

var _keyboardCase = "upper";		// lower & upper are values here

var _divId;

var _shortKeypadButtonBorderClass = "keypad_button_border short_keypad_button_border";
var _shortKeypadButtonClass = "keypad_button short_keypad_button";
var _mediumKeypadButtonBorderClass = "keypad_button_border medium_keypad_button_border";
var _mediumKeypadButtonClass = "keypad_button medium_keypad_button";
var _largeKeypadButtonBorderClass = "keypad_button_border large_keypad_button_border";
var _largeKeypadButtonClass = "keypad_button large_keypad_button";
var _keyboardButtonBorderClass = "keypad_button_border keyboard_button_border";
var _keyboardButtonClass = "keypad_button keyboard_button";
var _shortKeyboardButtonBorderClass = "keypad_button_border short_keyboard_button_border";
var _shortKeyboardButtonClass = "keypad_button short_keyboard_button";
var _mediumKeyboardButtonBorderClass = "keypad_button_border medium_keyboard_button_border";
var _mediumKeyboardButtonClass = "keypad_button medium_keyboard_button";
var _largeKeyboardButtonBorderClass = "keypad_button_border large_keyboard_button_border";
var _largeKeyboardButtonClass = "keypad_button large_keyboard_button";
var _longButtonBorderClass = "keypad_button_border short_keyboard_long_button_border";
var _longKeyboardButtonClass = "keypad_button short_keyboard_long_button";
var _longButtonTextClass = "shift_button_text";

function keypad_keypress(key, field) {
  field.value += key;
  focusAndUpdate(field);
  checkMaxFieldLength();
}

function keypad_clearInput(field) {
  field.value = "";
  focusAndUpdate(field);
}

function keypad_backspace(field) {
  field.value = field.value.substring(0, field.value.length - 1);
  focusAndUpdate(field);
}

function focusAndUpdate(field) {
  field.focus();
  if (field.update != undefined)
    field.update();
}

function keypad_renderKeypad(targetField, showAlpha) {
  var row, column, button;
  var content = "";

  for (row = 0; row < 3; ++row) {
    content += "<div class='keypad_row enter_pin_keypad_row'>";
    for (column = 0; column < 3; ++column) {
      button = (row * 3) + (column + 1);
      content += _createShortKeypadButton(button, "keypad_keypress(\"" + button + "\", " + targetField + ")", "");
    }
    content += "</div>";
  }

  content += "<div class='keypad_row enter_pin_keypad_row'>";
  content += _createShortKeypadButton('-', "keypad_keypress(\"-\", " + targetField + ")", "");
  content += _createShortKeypadButton('0', "keypad_keypress(\"0\", " + targetField + ")", "");
  content += _createShortKeypadButton('%%Text.txtKeypad_Clear%%', "keypad_clearInput(" + targetField + ")", "clear_keypad_button_text");
  content += "</div>";

  content += "<div class='keypad_row enter_pin_keypad_row'>";
  if (showAlpha == 1) {
    content += _createMediumKeypadButton('%%Text.txtKeypad_AToZ%%', "showAlphaKeypad(" + targetField + ")", "a_to_z_keypad_button_text");
    content += _createMediumKeypadButton('%%Text.txtKeypad_Backspace%%', "keypad_backspace(" + targetField + ")", "medium_backspace_keypad_button_text");
  } else {
    content += _createLargeKeypadButton('%%Text.txtKeypad_Backspace%%', "keypad_backspace(" + targetField + ")", "large_backspace_keypad_button_text");
  }
  content += "</div>";

  return content;
}

function _createShortKeypadButton(label, onClickAction, buttonTextClass) {
  var buttonTextClass = "keypad_button_text " + buttonTextClass;
  return _createKeypadButton(label, onClickAction, _shortKeypadButtonBorderClass, _shortKeypadButtonClass, buttonTextClass);
}

function _createMediumKeypadButton(label, onClickAction, buttonTextClass) {
  var buttonTextClass = "keypad_button_text " + buttonTextClass;
  return _createKeypadButton(label, onClickAction, _mediumKeypadButtonBorderClass, _mediumKeypadButtonClass, buttonTextClass);
}

function _createLargeKeypadButton(label, onClickAction, buttonTextClass) {
  var buttonTextClass = "keypad_button_text " + buttonTextClass;
  return _createKeypadButton(label, onClickAction, _largeKeypadButtonBorderClass, _largeKeypadButtonClass, buttonTextClass);
}


function _createKeypadButton(label, onClickAction, buttonBorderClass, buttonClass, buttonTextClass) {
  return "<div class='" + buttonBorderClass + "'>" +
         "  <button class='" + buttonClass + "' onclick='" + onClickAction + "'>" +
         "    <div class='" + buttonTextClass + "'>" + label + "</div>" +
         "  </button>" +
         "</div>";
}

function _createKeyboardButton(label, onClickAction, buttonTextClass, keyboardSize) {
  var buttonBorderClass = (keyboardSize == 'short') ? _shortKeyboardButtonBorderClass : _keyboardButtonBorderClass;
  var buttonClass = (keyboardSize == 'short') ? _shortKeyboardButtonClass : _keyboardButtonClass;
  var buttonTextClass = _constructKeyboardButtonText(buttonTextClass);
  return _createKeypadButton(label, onClickAction, buttonBorderClass, buttonClass, buttonTextClass);
}

function _constructKeyboardButtonText(additionalButtonTextClass) {
  var buttonTextClass = "keypad_button_text";
  if (additionalButtonTextClass) {
    buttonTextClass += " " + additionalButtonTextClass;
  }
  return buttonTextClass;
}

function _createMediumKeyboardButton(label, onClickAction, buttonTextClass) {
  var buttonTextClass = _constructKeyboardButtonText(buttonTextClass);
  return _createKeypadButton(label, onClickAction, _mediumKeyboardButtonBorderClass, _mediumKeyboardButtonClass, buttonTextClass);
}

function _createLargeKeyboardButton(label, onClickAction, buttonTextClass) {
  var buttonTextClass = _constructKeyboardButtonText(buttonTextClass);
  return _createKeypadButton(label, onClickAction, _largeKeyboardButtonBorderClass, _largeKeyboardButtonClass, buttonTextClass);
}

function _switchKeyboardCase()
{
	if(_keyboardCase == "upper")
	{
		keypad_renderShortLowercaseKeyboard(_divId, _targetField);
	}
	else
	{
		keypad_renderShortUppercaseKeyboard(_divId, _targetField);
	}
}

function _createShiftAndExitButtons(targetField)
{
	return [_createShiftKeyboardButton(), _createExitKeyboardButton(targetField)];
}

function _createShiftKeyboardButton() {
	return "<div class='" + _longButtonBorderClass + "'>" +
         "  <button class=\"" + _longKeyboardButtonClass + "\" onclick=\"_switchKeyboardCase();\">" +
		 "		<div class=" + _longButtonTextClass + ">Shift</div>" +
		 "	</button>" +
         "</div>"
}

function _createExitKeyboardButton(targetField) {
  return "<div class='" + _shortKeyboardButtonBorderClass + "'>" +
         "  <button class=\"" + _shortKeyboardButtonClass + "\" onclick=\"closeAlphaKeypad(" + targetField + ");\">" +
         "    <img class=\"keyboard_close_button_icon\" src='/images/closeBtn.jpg' height='20' width='20' />" +
         "  </button>" +
         "</div>";
}

function keypad_renderShortLowercaseKeyboard(divId, targetField) {
  
  _keyboardCase = "lower";
  
  if ("%%Preferences.AlphanumericKeypadStyle%%" == "2") {  // 2 = Qwerty, 1 = Alphabet order
    var row1 = renderKeyboardRow(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], targetField, null, 'short');
    var row2 = renderKeyboardRow(["a", "s", "d", "f", "g", "h", "j", "k", "l"], targetField, _createExitKeyboardButton(targetField), 'short');
    var row3 = renderKeyboardRow(["z", "x", "c", "v", "b", "n", "m"], targetField, _createShiftKeyboardButton(), 'short');
  } else {    // alphabet style
    var row1 = renderKeyboardRow(["a", "b", "c", "d", "e", "f", "g", "h", "i"], targetField, _createExitKeyboardButton(targetField), 'short');
    var row2 = renderKeyboardRow(["j", "k", "l", "m", "n", "o", "p", "q", "r"], targetField, null, 'short');
    var row3 = renderKeyboardRow(["s", "t", "u", "v", "w", "x", "y", "z"], targetField, _createShiftKeyboardButton(), 'short');
  }
  var content = renderKeyboardRows([row1, row2, row3], targetField);

  var div = document.getElementById(divId);
  if (div)
    div.innerHTML = content;
}

function keypad_renderShortUppercaseKeyboard(divId, targetField) {
  
  _divId = divId;
  _targetField = targetField;
  _keyboardCase = "upper";
  
  if ("%%Preferences.AlphanumericKeypadStyle%%" == "2") {  // 2 = Qwerty, 1 = Alphabet order
    var row1 = renderKeyboardRow(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], targetField, null, 'short');
    var row2 = renderKeyboardRow(["A", "S", "D", "F", "G", "H", "J", "K", "L"], targetField, _createExitKeyboardButton(targetField), 'short');
    var row3 = renderKeyboardRow(["Z", "X", "C", "V", "B", "N", "M"], targetField, _createShiftKeyboardButton(), 'short');
  } else {    // alphabet style
    var row1 = renderKeyboardRow(["A", "B", "C", "D", "E", "F", "G", "H", "I"], targetField, _createExitKeyboardButton(targetField), 'short');
    var row2 = renderKeyboardRow(["J", "K", "L", "M", "N", "O", "P", "Q", "R"], targetField, null, 'short');
    var row3 = renderKeyboardRow(["S", "T", "U", "V", "W", "X", "Y", "Z"], targetField, _createShiftKeyboardButton(), 'short');
  }
  var content = renderKeyboardRows([row1, row2, row3], targetField);

  var div = document.getElementById(divId);
  if (div)
    div.innerHTML = content;
}

function renderKeyboardRows(rows, targetField) {
  var content = "";
  for (var rowsIdx = 0; rowsIdx < rows.length; rowsIdx++) {
    content += rows[rowsIdx];
  }
  return content;
}

function renderKeyboardRow(row, targetField, extraButtons, keyboardSize) {
  var keyboard_row_class = (keyboardSize == 'short') ? 'short_keyboard_row' : 'keyboard_row';
  var content = "<div class='keypad_row " + keyboard_row_class + "'>";
  for (var rowIdx = 0; rowIdx < row.length; rowIdx++) {
    content += _createKeyboardButton(row[rowIdx], "keypad_keypress(\"" + row[rowIdx] + "\", " + targetField + ")", "", keyboardSize);
  }
  if (extraButtons) {
    for (var buttonIdx = 0; buttonIdx < extraButtons.length; buttonIdx++) {
      content += extraButtons[buttonIdx];
    }
  }
  content += "</div>";

  return content;
}

function keypad_renderEmailKeyboard(divId, targetField) {
  var row1 = renderKeyboardRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], targetField, null, '');
  if ("%%Preferences.AlphanumericKeypadStyle%%" == "2") {  // 2 = Qwerty, 1 = Alphabet order
    var row2 = renderKeyboardRow(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"], targetField, null, '');
    var row3 = renderKeyboardRow(["A", "S", "D", "F", "G", "H", "J", "K", "L", "@"], targetField, null, '');
    var row4 = renderKeyboardRow(["Z", "X", "C", "V", "B", "N", "M", ".", "-", "+"], targetField, null, '');
  } else {    // alphabet style
    var row2 = renderKeyboardRow(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], targetField, null, '');
    var row3 = renderKeyboardRow(["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"], targetField, null, '');
    var row4 = renderKeyboardRow(["U", "V", "W", "X", "Y", "Z", "@", ".", "-", "+"], targetField, null, '');
  }

  var dotComButton = _createMediumKeyboardButton(".com", "keypad_keypress(\".COM\", " + targetField + ")", "medium_keyboard_button_text");
  var dotNetButton = _createMediumKeyboardButton(".net", "keypad_keypress(\".NET\", " + targetField + ")", "medium_keyboard_button_text");
  var dotOrgButton = _createMediumKeyboardButton(".org", "keypad_keypress(\".ORG\", " + targetField + ")", "medium_keyboard_button_text");
  var dotGovButton = _createMediumKeyboardButton(".gov", "keypad_keypress(\".GOV\", " + targetField + ")", "medium_keyboard_button_text");
  var separator = "<div id=\"keyboard_button_separator\"></div>";
  var underscoreButton = _createKeyboardButton("_", "keypad_keypress(\"_\", " + targetField + ")", "", "");
  var backspaceButton = _createLargeKeyboardButton("%%Text.txtKeypad_Backspace%%", "keypad_backspace(" + targetField + ")", "large_keyboard_button_text");
  var row5 = renderKeyboardRow([], targetField, [dotComButton, dotNetButton, dotOrgButton, dotGovButton, separator, underscoreButton, backspaceButton], '');

  var content = renderKeyboardRows([row1, row2, row3, row4, row5], targetField, '');

  var div = document.getElementById(divId);
  if (div)
    div.innerHTML = content;
}