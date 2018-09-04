// languageUtilities.js
//
// Copyright(c)2006-2008 EnvisionWare, Inc. - All Rights Reserved
//
// This file provides basic Javascript utility function for
// working with multiple languages
//

var currentLanguageTextIndex = 0;
var languages = new Array;
var languageCodes = new Array;

function drawLanguageMenu(spanId, referrer) {
  var supportedLanguages = "%%Preferences.SupportedLanguages%%".split(",");
  var numLanguages = supportedLanguages.length;
  if (numLanguages > 1) {
    for (var x = 0; x < numLanguages; ++x) {
      var languageParts = supportedLanguages[x].split(":");
      if (languageParts.length >= 2) {
        languages.push(languageParts[0]);
        languageCodes.push(languageParts[1]);
      }
    }

    var span = document.getElementById(spanId);
    if (span) {
      addLanguageButtons(languages, languageCodes, referrer, span);
      setInterval('rotateChangeLanguageButtonText()', 3000);
    }
  }
}

function rotateChangeLanguageButtonText() {
  var button = document.getElementById("change_language_button");
  if (button) {
    ++currentLanguageTextIndex;
    if (currentLanguageTextIndex >= languages.length)
      currentLanguageTextIndex = 0;

    button.innerHTML = languages[currentLanguageTextIndex];
  }
}

function addLanguageButtons(languages, languageCodes, referrer, pane) {
  for (var x = 0; x < languages.length; ++x) {
    var btnContainer = document.createElement("div");
    btnContainer.className = "language_button_container";

    var btnBorder = document.createElement("div");
    btnBorder.className = "language_button_border";

    var btn = document.createElement("button");
    btn.className = "language_button";
    btn.setAttribute("languagecode", languageCodes[x]);
    btn.setAttribute("targetpage", referrer);

    btn.onclick = changeLanguage;

    var btnIconContainer = document.createElement("div");
    btnIconContainer.className = "language_button_icon_container";

    var btnIcon = document.createElement("img");
    btnIcon.className = "language_button_icon";
    btnIcon.src = "./images/" + languageCodes[x] + "_lang.png";

    btnIconContainer.appendChild(btnIcon);
    btn.appendChild(btnIconContainer);

    var btnText = document.createElement("div");
    btnText.className = "language_button_text";
    btnText.innerHTML = languages[x];
    btn.appendChild(btnText);

    btnBorder.appendChild(btn);
    btnContainer.appendChild(btnBorder);
    pane.appendChild(btnContainer);
  }
}

function changeLanguage(evt) {
  evt = (evt) ? evt : ((window.event) ? window.event : null);
  if (evt) {
    var btn = event.srcElement;
    var target = btn.getAttribute("targetpage");
    var code = btn.getAttribute("languagecode");
    window.location = "/selfCheck?action=changeLanguage&amp;languageCode=" + code + "&amp;nextPage=/" + target;
  }
}
