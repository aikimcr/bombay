dialog = function() {
  this.isVisible = false;
  this.messageText = '';
  this.callback = null;
};

dialog.prototype.show = function(messageText, callback) {
  this.callback = callback;
  this.isVisible = true;
};

dialog.prototype.doOkay = function() {
  this.callback('okay');
  this.isVisible = false;
};

dialog.prototype.doCancel = function() {
  this.callback('cancel');
  this.isVisible = false;
};
