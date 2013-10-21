function app_form(model) {
  this.model_ = model;
};

app_form.prototype.createDom = function(parent) {
  this.parent_ = parent;
};

app_form.prototype.renderDocument = function() {
  this.draw_();
};

app_form.prototype.draw_ = function() {
  var dom_text = Templates[this.template_name_](this.model_);
  util.appendTextElement(this.parent_, dom_text);
  this.element_ = this.parent_.firstChild;
};

app_form.prototype.redraw = function(new_model) {
  this.model_ = new_model;
  this.draw_();
};

app_form.prototype.addEventListener = function(type, callback) {
  this.element_.addEventListener(type, callback);
};

app_form.prototype.getModel = function() {
  return this.model_;
};

app_form.prototype.fireChange = function() {
  this.element_.dispatchEvent(new CustomEvent('app_form_change'));
};

app_form.List = function(model) {
  app_form.call(this, model);
};
util.inherits(app_form.List, app_form);

app_form.List.prototype.renderDocument = function() {
  app_form.prototype.renderDocument.call(this);

  var delete_buttons = this.element_.querySelectorAll('.delete');
  var button_handler = util.bind(this.handleDelete, this);

  for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
    delete_buttons[button_idx].addEventListener('click', button_handler);
  }
};

app_form.List.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var identity = row.attributes.item(this.identity_name_).value;
  var object = this.getRowForIdentity(identity);

  var confirm_delete = new dialog(this.getConfirmMessage(object));
  confirm_delete.show(util.bind(function(result) {
    if (result) {
      this.service = new service.generic(
        this.getServiceUrl(identity),
        util.bind(this.fireChange, this)
      );
      this.service.delete();
    } else {
      this.fireChange();
    }
  }, this));

  return true;
};

app_form.List.Band = function(model) {
  app_form.List.call(this, model);
};
util.inherits(app_form.List.Band, app_form.List);
app_form.List.Band.prototype.template_name_ = 'band/display/list';
app_form.List.Band.prototype.identity_name_ = 'band_id';

app_form.List.Band.prototype.getRowForIdentity = function(band_id) {
  return this.getModel().person_bands.filter(function (mb) { return mb.id == band_id })[0];
};

app_form.List.Band.prototype.getConfirmMessage = function(band) {
  return 'Quit band ' + band.name + '?';
};

app_form.List.Band.prototype.getServiceUrl = function(band_id) {
  return './person_band?band_id=' + band_id + '&person_id=' + this.getModel().person_id;
};

app_form.Editor = function(model) {
  app_form.call(this, model);
};
util.inherits(app_form.Editor, app_form);

app_form.Editor.prototype.renderDocument = function() {
  app_form.prototype.renderDocument.call(this);
  this.element_.addEventListener('submit', util.bind(this.handleSubmit, this));
  this.element_.addEventListener('change', util.bind(this.handleChange, this));
};

app_form.Editor.prototype.getFormData = function(form) {
  var inputs = form.querySelectorAll('[name]');
  var data = {};
  inputs.forEach(function (field) {
    data[field.getNamedItem('name')] = field.value;
  });
  return data;
}

app_form.Editor.prototype.handleSubmit = function(e) {
  var form = e.target;
  var data = this.getFormData(form);
  this.service = new service.generic(
    this.edit_url_,
    util.bind(this.handleEdit, this)
  );
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_form.Editor.prototype.handleChange = function(e) {};

app_form.Editor.prototype.handleEdit = function(result) {
  this.fireChange();
};

app_form.Editor.BandCreator = function(model) {
  app_form.Editor.call(this, model);
};
util.inherits(app_form.Editor.BandCreator, app_form.Editor);
app_form.Editor.BandCreator.prototype.template_name_ = 'band/editor/create';
app_form.Editor.BandCreator.prototype.edit_url_ = './band';

app_form.Editor.BandCreator.prototype.getFormData = function(form) {
  return {
    name: form.querySelector('[name="band_name"]').value
  };
};

app_form.Editor.BandJoin = function(model) {
  app_form.Editor.call(this, model);
};
util.inherits(app_form.Editor.BandJoin, app_form.Editor);
app_form.Editor.BandJoin.prototype.template_name_ = 'band/editor/add';
app_form.Editor.BandJoin.prototype.edit_url_ = './person_band';

app_form.Editor.BandJoin.prototype.getFormData = function(form) {
  return {
    band_id: form.querySelector('[name="band_id"]').value,
    person_id: form.querySelector('[name="person_id"]').value
  };
};
