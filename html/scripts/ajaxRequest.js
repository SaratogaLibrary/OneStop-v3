/**
 * @author rwalsh
 */

function AjaxRequest(query, target, callback) {
  this.target = target;
  this.callback = callback;
  this.query = query;
  this.activeRequest = null;
  this.lastError = "";
}

AjaxRequest.RESULT = {
  SUCCESS : 0,
  ERROR : 1
}

AjaxRequest.STATE = {
  UNINITIALIZED : 0,
  LOADING : 1,
  LOADED : 2,
  INTERACTIVE : 3,
  COMPLETE : 4
}

AjaxRequest.HTTP_STATUS = {
  OK : 200
}

AjaxRequest.prototype.send = function() {
  var result = AjaxRequest.RESULT.ERROR;
  if (this.activeRequest == null) {
    this.activeRequest = createXmlHttpRequest();
  }
  if (this.activeRequest != null) {
    this.activeRequest.open("GET", this.query, true);
    var self = this;
    this.activeRequest.onreadystatechange = function() {
      var request = self.activeRequest;
      if (request.readyState == AjaxRequest.STATE.COMPLETE)
        self.callback(self.target, request.status, request.responseText, request.responseXML);
    }
    this.activeRequest.send(null);
    result = AjaxRequest.RESULT.SUCCESS;
    this.lastError = "";
  } else {
    this.lastError = "Failed to create XMLHttpRequest";
  }
  return result;
}

AjaxRequest.prototype.getLastError = function() {
  return this.lastError;
}

function createXmlHttpRequest() {
  if(window.XMLHttpRequest && !(window.ActiveXObject)) {
    return new XMLHttpRequest();
  }

  if(window.ActiveXObject) {
    try {
      return new ActiveXObject("MSXML2.ServerXMLHTTP");
    } catch(e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch(e) {
      }
    }
  }
}