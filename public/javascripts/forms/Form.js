function Form(opt_other_models) {
  this.isVisible = ko.observable(false);
  this.other_models = opt_other_models ? opt_other_models : [];
  this.message = ko.observable('');
}

Form.prototype.show = function() {
  this.isVisible(true);
};

Form.prototype.hide = function() {
  this.isVisible(false);
};

Form.prototype.init = function() {
  this.message('');
};

Form.prototype.validate = function() {
  return true;
};

Form.prototype.setError = function(err) {
  if (typeof err == 'object') {
    if (err.code) {
      this.message(err.code);
    } else if (err.errno) {
      this.message(err.errno);
    } else {
      this.message(err.toString());
    }
  } else {
    this.message(err);
  }
};

Form.postChange = function(form, model) {
  form.postChange_(function (result) {
    if (result.err) {
      this.setError(result.err);
    } else {
      this.message('Record Added');
      model.load();
      this.other_models.forEach(function(omodel) {
        omodel.load();
      }.bind(this));
    }
  }.bind(form));
};

Form.putChange = function(form, opt_object) {
  if (form.validate()) {
    var object = opt_object == null ? form.object() : opt_object();
    var changeset = form.changeset();
    object.update(changeset, function(result) {
      if (result) {
        if (result.err) {
          this.setError(result.err);
        } else {
          object.refresh(function(result) {
            if (result.err) {
              this.setError(result.err);
            } else {
              this.init(object);
              this.message('Change accepted');
            }
          }.bind(this));
        }
      } else {
        this.setError('Unknown error on update');
      }
    }.bind(form));
  }
};

function AddBand() {
  Form.call(this);
  this.name = ko.observable(null);
}
util.inherits(AddBand, Form);

AddBand.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  svc.set('./band', function(result) {
    callback(result);
    this.name(null);
  }.bind(this), {name: this.name()});
};

function EditBand() {
  Form.call(this);
  this.name = ko.observable(null);
  this.band = ko.observable(null);
}
util.inherits(EditBand, Form);

EditBand.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  svc.set('./band', function(result) {
    callback(result);
    this.name(null);
  }.bind(this), {name: this.name()});
};

EditBand.prototype.show = function(band) {
  this.init(band);
  Form.prototype.show.call(this);
};

EditBand.prototype.init = function(band) {
  this.band(band);
  Form.prototype.init.call(this);
  this.name(this.band().name());
};

EditBand.prototype.changeset = function(callback) {
  return {
    name: this.name(),
  };
};

function AddPerson() {
  Form.call(this);
  this.name = ko.observable(null);
  this.full_name = ko.observable(null);
  this.email = ko.observable(null);
  this.system_admin = ko.observable(false);
}
util.inherits(AddPerson, Form);

AddPerson.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  var params = {
    name: this.name(),
    full_name: this.full_name(),
    email: this.email(),
    system_admin: this.system_admin()
  };
  svc.set('./person', function(result) {
    callback(result);
    this.name(null);
    this.full_name(null);
    this.email(null);
    this.system_admin(false);
  }.bind(this), params);
};

function EditProfile() {
  Form.call(this);
  this.name = ko.observable(manager.current_person().name());
  this.full_name = ko.observable(manager.current_person().full_name());
  this.email = ko.observable(manager.current_person().email());
}
util.inherits(EditProfile, Form);

EditProfile.prototype.show = function() {
  this.init();
  Form.prototype.show.call(this);
};

EditProfile.prototype.init = function() {
  Form.prototype.init.call(this);
  this.name(manager.current_person().name());
  this.full_name(manager.current_person().full_name());
  this.email(manager.current_person().email());
};

EditProfile.prototype.changeset = function(callback) {
  return {
    name: this.name(),
    full_name: this.full_name(),
    email: this.email(),
  };
};

function ChangePassword() {
  Form.call(this);
  this.old_password = ko.observable('');
  this.new_password = ko.observable('');
  this.confirm_new_password = ko.observable('');
}
util.inherits(ChangePassword, Form);

ChangePassword.prototype.show = function() {
  this.init();
  Form.prototype.show.call(this);
};

ChangePassword.prototype.init = function() {
  Form.prototype.init.call(this);
  this.old_password('');
  this.new_password('');
  this.confirm_new_password('');
};

ChangePassword.prototype.validate = function() {
  if (this.old_password() == '') {
    this.setError('Please provide your old password');
    return false;
  }

  if (this.new_password() == '') {
    this.setError('Please provide a new password');
    return false;
  }

  if (this.confirm_new_password() == '') {
    this.setError('Please confirm your new password');
    return false;
  }

  if (this.confirm_new_password() != this.new_password()) {
    this.setError('New password and confirmation do not match');
    return false;
  }

  return true;
};

ChangePassword.prototype.changeset = function(callback) {
  var pk = document.querySelector('input[name="pubkey"]').value;
  var ct = JSON.stringify([
    this.old_password(),
    this.new_password()
  ]);
  var encrypted_ct = encodeURIComponent(util.encrypt(pk, ct));
  return { token: encrypted_ct };
};

function AddArtist() {
  Form.call(this);
  this.name = ko.observable(null);
}
util.inherits(AddArtist, Form);

AddArtist.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  svc.set('./artist', function(result) {
    callback(result);
    this.name (null);
  }.bind(this), {name: this.name()});
};

function EditArtist() {
  Form.call(this);
  this.name = ko.observable(null);
  this.artist = ko.observable(null);
}
util.inherits(EditArtist, Form);

EditArtist.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  svc.set('./artist', function(result) {
    callback(result);
    this.name(null);
  }.bind(this), {name: this.name()});
};

EditArtist.prototype.show = function(artist) {
  this.init(artist);
  Form.prototype.show.call(this);
};

EditArtist.prototype.init = function(artist) {
  this.artist(artist);
  Form.prototype.init.call(this);
  this.name(this.artist().name());
};

EditArtist.prototype.changeset = function(callback) {
  return {
    name: this.name(),
  };
};

function AddSong() {
  Form.call(this);
  this.name = ko.observable(null);
  this.artist = ko.observable(null);
}
util.inherits(AddSong, Form);

AddSong.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  svc.set('./song', function(result) {
    callback(result);
    this.name(null);
    this.artist(null);
  }.bind(this), {name: this.name(), artist_id: this.artist().id()});
};

function EditSong() {
  Form.call(this);
  this.name = ko.observable(null);
  this.artist = ko.observable(null);
  this.song = ko.observable(null);
}
util.inherits(EditSong, Form);

EditSong.prototype.object = function() {
  return this.song();
};

EditSong.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  svc.set('./song', function(result) {
    callback(result);
    this.name(null);
  }.bind(this), {name: this.name()});
};

EditSong.prototype.show = function(song) {
  this.init(song);
  Form.prototype.show.call(this);
};

EditSong.prototype.init = function(song) {
  this.song(song);
  Form.prototype.init.call(this);
  this.name(this.song().name());
  this.artist(manager.artists.getById(this.song().artist_id()));
};

EditSong.prototype.changeset = function(callback) {
  return {
    name: this.name(),
    artist_id: this.artist().id()
  };
};

function JoinBand() {
  Form.call(this, [manager.song_ratings]);
  this.band = ko.observable(null);
}
util.inherits(JoinBand, Form);

JoinBand.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  var params = {
    band_id: this.band().id(),
  };
  svc.set('./band_member', function(result) {
    callback(result);
    this.band(null);
  }.bind(this), params);
};

function AddBandMember() {
  Form.call(this, [manager.song_ratings]);
  this.person = ko.observable(null);
}
util.inherits(AddBandMember, Form);

AddBandMember.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  var params = {
    band_id: manager.current_band().id(),
    person_id: this.person().id(),
  };
  svc.set('./band_member', function(result) {
    callback(result);
    this.person(null);
  }.bind(this), params);
};

function AddBandSong() {
  Form.call(this, [manager.song_ratings]);
  this.song = ko.observable(null);
}
util.inherits(AddBandSong, Form);

AddBandSong.prototype.postChange_ = function(callback) {
  var svc = service.getInstance();
  var params = {
    band_id: manager.current_band().id(),
    song_id: this.song().id(),
    song_status: -1
  };
  svc.set('./band_song', function(result) {
    callback(result);
    this.song(null);
  }.bind(this), params);
};
