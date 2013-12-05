confirm_dialog = function() {
  this.isVisible = ko.observable(false);
  this.messageText = ko.observable('');
  this.callback = null;
}

confirm_dialog.prototype.show = function(messageText, opt_event, callback) {
  this.callback = callback;
  this.messageText(messageText);
  this.isVisible(true);

  if (opt_event) {
    var dialog = document.querySelector('#confirm_dialog .dialog');
    var dialog_y = opt_event.pageY - dialog.offsetHeight;
    if (dialog_y <= 0) dialog_y = 10;
    dialog.setAttribute('style', 'top: ' + dialog_y + 'px');
  }
};

confirm_dialog.prototype.doOkay = function() {
  this.callback(true);
  this.isVisible(false);
  var dialog = document.querySelector('#confirm_dialog .dialog');
  dialog.removeAttribute('style');
};

confirm_dialog.prototype.doCancel = function() {
  this.callback(false);
  this.isVisible(false);
  var dialog = document.querySelector('#confirm_dialog .dialog');
  dialog.removeAttribute('style');
};
