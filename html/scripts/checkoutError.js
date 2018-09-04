
function initializeCheckoutError(headerTitle, timeoutSecondsLabel, pageFilename) {
  initialize(headerTitle, timeoutSecondsLabel, pageFilename);

  if ("%%Item.Title%%" != "")
    setSpanText("itemId", " (%%Item.Title%%) ");

  if ("%%Item.ScreenMessage%%" != "")
    setSpanText("screenMessage", "%%Text.txtCheckOutErrorPage_ErrorDescription%% %%Item.ScreenMessage%%");
}