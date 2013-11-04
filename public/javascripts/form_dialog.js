form_dialog = function(dialog_title) {
  this.dialog_div_ = document.createElement('div');
  this.dialog_div_.setAttribute('role', 'dialog');
  this.dialog_div_.setAttribute('class', 'dialog');
  this.dialog_div_.tabIndex = -1;

  var title_bar = document.createElement('div');
  title_bar.setAttribute('class', 'title_bar');
  this.dialog_div_.appendChild(title_bar);

  var title = document.createElement('div');
  title.setAttribute('class', 'title');
  title.innerHTML = dialog_title;
  title_bar.appendChild(title);

  this.close_button_ = document.createElement('div');
  this.close_button_.setAttribute('class', 'close_button');
  this.close_button_.innerHTML = 'X';
  title_bar.appendChild(this.close_button_);

  this.element_ = document.createElement('div');
  this.element_.setAttribute('class', 'dialog_body');
  this.dialog_div_.appendChild(this.element_);

  this.dialog_open_ = false;
};

form_dialog.active_ = {};

form_dialog.getDialog = function(title, form, callback) {
  var result = new form_dialog(title);
  result.addForm(form);
  result.addEventListener('dialog_dismissed', callback);
  return result;
};

form_dialog.prototype.dialogOpen = function() {
  return this.dialog_open_;
};

form_dialog.prototype.getElement = function() {
  return this.element_;
};

form_dialog.prototype.addForm = function(form) {
  this.form_ = form;
  this.model_ = form.getModel();
  form.render(this.getElement());
  form.listen('app_form_change', this.handleFormChange_.bind(this));
};

form_dialog.prototype.show = function() {
  if (this.dialogOpen()) { return; }
  document.addEventListener('focus', this.keepFocus_.bind(this), true);
  document.addEventListener('keydown', this.handleKeys_.bind(this), true);
  this.close_button_.addEventListener('click', this.handleClick_.bind(this), true);
  
  this.last_focus_ = document.activeElement;
  document.body.appendChild(this.dialog_div_);
  if (this.form_) { this.form_.redraw(this.model_); }
  this.dialog_open_ = true;
  this.dialog_div_.focus();
};

form_dialog.prototype.dismiss = function() {
  if (!this.dialogOpen()) { return; }
  document.removeEventListener('keydown', this.handleKeys_.bind(this), true);
  document.removeEventListener('focus', this.keepFocus_.bind(this), true);
  this.close_button_.removeEventListener('click', this.handleClick_.bind(this), true);

  this.dialog_open_ = false;
  document.body.removeChild(this.dialog_div_);
  this.last_focus_.focus();
  this.fireDismissed();
};

form_dialog.prototype.keepFocus_ = function(e) {
  var dialog = this.dialog_div_;

  if (this.dialogOpen() && !dialog.contains(e.target)) {
    e.stopPropagation();
    dialog.focus();
  }
};

form_dialog.prototype.handleKeys_ = function(e) {
  if (this.dialogOpen() && e.keyCode == 27) {
    this.dismiss();
  };
};

form_dialog.prototype.handleClick_ = function(e) {
  this.dismiss();
};

form_dialog.prototype.handleFormChange_ = function(e) {
  this.dismiss();
};

form_dialog.prototype.addEventListener = function(type, callback) {
  this.dialog_div_.addEventListener(type, callback);
};

form_dialog.prototype.removeEventListener = function(type, callback) {
  this.dialog_div_.removeEventListener(type, callback);
};

form_dialog.prototype.fireDismissed = function() {
  this.dialog_div_.dispatchEvent(new CustomEvent('dialog_dismissed', {bubbles: true}));
};
