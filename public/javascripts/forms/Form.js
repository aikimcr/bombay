function Form() {
  this.isVisible = ko.observable(false);
}

Form.prototype.show = function() {
  this.isVisible(true);
}

Form.prototype.hide = function() {
  this.isVisible(false);
}

function AddBand() {
  Form.call(this);
}
util.inherits(AddBand, Form);

AddBand.prototype.name = null;

AddBand.prototype.postChange = function(callback) {
  var svc = service.getInstance();
  svc.set('./band', function(result) {
    callback(result);
    this.name = null;
  }.bind(this), {name: this.name});
};

function AddPerson() {
  Form.call(this);
}
util.inherits(AddPerson, Form);

AddPerson.prototype.name = null;
AddPerson.prototype.full_name = null;
AddPerson.prototype.email = null;
AddPerson.prototype.system_admin = false;

AddPerson.prototype.postChange = function(callback) {
  var svc = service.getInstance();
  var params = {
    name: this.name,
    full_name: this.full_name,
    email: this.email,
    system_admin: this.system_admin
  };
  svc.set('./person', function(result) {
    callback(result);
    this.name = null;
    this.full_name = null;
    this.email = null;
    this.system_admin = false;
  }.bind(this), params);
};

function AddArtist() {
  Form.call(this);
}
util.inherits(AddArtist, Form);

AddArtist.prototype.name = null;

AddArtist.prototype.postChange = function(callback) {
  var svc = service.getInstance();
  svc.set('./artist', function(result) {
    callback(result);
    this.name = null;
  }.bind(this), {name: this.name});
};
