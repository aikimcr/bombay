confirm_dialog = function() {
  this.isVisible = ko.observable(false);
  this.messageText = ko.observable('');
  this.callback = null;
}

confirm_dialog.prototype.show = function(messageText, opt_event, callback) {
  callback(true);
};
