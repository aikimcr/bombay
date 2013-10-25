dialog = function(message) {
  this.message_ = message;
};

dialog.prototype.show = function(callback) {
  var dialog_text = Templates['dialog']({message: this.message_});
  util.appendTextElement(document.body, dialog_text);

  var buttons = document.querySelectorAll('.dialog_button');
  var handler = this.handleButtonPress.bind(this, callback);

  for(var i=0; i< buttons.length; i++) {
    buttons[i].addEventListener('click', handler);
  }
};

dialog.prototype.handleButtonPress = function(callback, event) {
  window.console.log(event);

  var result = event.target.attributes.item('name').value;
  var dialog = document.querySelector('.dialog_background');
  document.body.removeChild(dialog);

  callback(result == 'okay');
};
