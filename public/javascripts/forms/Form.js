function Form(opt_other_models) {
  this.isVisible = ko.observable(false);
  this.other_models = opt_other_models ? opt_other_models : [];
  this.message = ko.observable('');
  this.object = ko.observable();
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

Form.prototype.postChange = function(form_element, opt_callback) {
  this.postChange_(function (result_code, result) {
    if (result_code && result_code != 200 && result_code != 304) {
      this.setError(result);
    } else {
      this.message('Record Added');
    }
    if (opt_callback) opt_callback(result_code, result);
  }.bind(this));
};

Form.prototype.putChange = function(form_element, opt_callback) {
  if (this.validate()) {
    var changeset = this.changeset();
    this.object().update(changeset, function(result_code, result) {
      if (result_code && result_code != 200 && result_code != 304) {
        this.setError(result);
      } else {
        this.message('Change Accepted');
        this.resetValues();
      }
      if (opt_callback) opt_callback(result_code, result);
    }.bind(this));
  } else {
    if (opt_callback) opt_callback(this.message(), result);
  }
};

function AddBand() {
  Form.call(this);
  this.name = ko.observable(null);
}
util.inherits(AddBand, Form);

AddBand.prototype.postChange_ = function(callback) {
  manager.bands.create({name: this.name()}, function(result_code, result) {
    callback(result_code, result);
    this.name(null);
  }.bind(this))
};

function EditBand() {
  Form.call(this);
  this.name = ko.observable(null);
}
util.inherits(EditBand, Form);

EditBand.prototype.postChange_ = function(callback) {
  throw new Error('Attempt to post from edit form');
};

EditBand.prototype.show = function(band) {
  this.init(band);
  Form.prototype.show.call(this);
};

EditBand.prototype.init = function(band) {
  this.object(band);
  Form.prototype.init.call(this);
  this.name(this.object().name());
};

EditBand.prototype.changeset = function(callback) {
  return {
    name: this.name(),
  };
};

EditBand.prototype.resetValues = function() {
  this.name(null);
};

function AddPerson() {
  Form.call(this);
  this.name = ko.observable(null);
  this.full_name = ko.observable(null);
  this.email = ko.observable(null);
}
util.inherits(AddPerson, Form);

AddPerson.prototype.postChange_ = function(callback) {
  var params = {
    name: this.name(),
    full_name: this.full_name(),
    email: this.email()
  };
  manager.persons.create(params, function(result_code, result) {
    callback(result_code, result);
    this.name(null);
    this.full_name(null);
    this.email(null);
  }.bind(this));
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

EditProfile.prototype.init = function(person) {
  this.object(person || manager.current_person());
  Form.prototype.init.call(this);
  this.name(this.object().name());
  this.full_name(this.object().full_name());
  this.email(this.object().email());
};

EditProfile.prototype.changeset = function(callback) {
  return {
    name: this.name(),
    full_name: this.full_name(),
    email: this.email(),
  };
};

EditProfile.prototype.resetValues = function() {
  this.name(null);
  this.full_name(null);
  this.email(null);
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

ChangePassword.prototype.init = function(person) {
  this.object(person || manager.current_person());
  Form.prototype.init.call(this);
  this.old_password(null);
  this.new_password(null);
  this.confirm_new_password(null);
};

ChangePassword.prototype.validate = function() {
  if (this.old_password() == null) {
    this.setError('Please provide your old password');
    return false;
  }

  if (this.new_password() == null) {
    this.setError('Please provide a new password');
    return false;
  }

  if (this.confirm_new_password() == null) {
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
  var encrypted_ct = util.encrypt(pk, ct);
  return { token: encrypted_ct };
};

ChangePassword.prototype.resetValues = function() {
  this.old_password(null);
  this.new_password(null);
  this.confirm_new_password(null);
};

function AddArtist() {
  Form.call(this);
  this.name = ko.observable(null);
}
util.inherits(AddArtist, Form);

AddArtist.prototype.postChange_ = function(callback) {
  manager.artists.create({name: this.name()}, function(result_code, result) {
    callback(result_code, result);
    this.name (null);
  }.bind(this));
};

function EditArtist() {
  Form.call(this);
  this.name = ko.observable(null);
}
util.inherits(EditArtist, Form);

EditArtist.prototype.postChange_ = function(callback) {
  throw new Error('Attempt to post from edit form');
};

EditArtist.prototype.show = function(artist) {
  this.init(artist);
  Form.prototype.show.call(this);
};
 
EditArtist.prototype.init = function(artist) {
  this.object(artist);
  Form.prototype.init.call(this);
  this.name(this.object().name());
};

EditArtist.prototype.changeset = function(callback) {
  return {
    name: this.name(),
  };
};

EditArtist.prototype.resetValues = function() {
  this.name(null);
};

function AddSong() {
  Form.call(this);
  this.name = ko.observable(null);
  this.artist = ko.observable(null);
  this.key_signature = ko.observable(null);
}
util.inherits(AddSong, Form);

AddSong.prototype.postChange_ = function(callback) {
  manager.songs.create(
    {
      name: this.name(),
      artist_id: this.artist().id(),
      key_signature: this.key_signature()
    }, function(result_code, result) {
      callback(result_code, result);
      this.name(null);
      this.artist(null);
      this.key_signature(null);
    }.bind(this)
  );
};

function EditSong() {
  Form.call(this);
  this.name = ko.observable(null);
  this.artist = ko.observable(null);
  this.key_signature = ko.observable(null);
}
util.inherits(EditSong, Form);

EditSong.prototype.object = function() {
  return this.song();
};

EditSong.prototype.postChange_ = function(callback) {
  manager.songs.create(
    {name: this.name(), artist_id: this.artist().id()},
    function(result_code, result) {
      callback(result_code, result);
    }
  );
};

EditSong.prototype.show = function(song) {
  this.init(song);
  Form.prototype.show.call(this);
};

EditSong.prototype.init = function(song) {
  this.object(song);
  Form.prototype.init.call(this);
  this.name(this.object().name());
  this.artist(manager.artists.getById(this.object().artist_id()));
  this.key_signature(this.object().key_signature());
};

EditSong.prototype.changeset = function(callback) {
  return {
    name: this.name(),
    artist_id: this.artist().id(),
    key_signature: this.key_signature()
  };
};

EditSong.prototype.resetValues = function() {
  this.name(null);
  this.artist(null);
  this.key_signature(null);
};

function JoinBand() {
  Form.call(this, [manager.song_ratings, manager.requests]);
  this.band = ko.observable(null);
}
util.inherits(JoinBand, Form);

JoinBand.prototype.postChange_ = function(callback) {
  manager.requests.joinBand(
    this.band().id(),
    function(result_code, result) {
      callback(result_code, result);
      this.band(null);
    }.bind(this)
  );
};

function AddBandMember() {
  Form.call(this, [manager.song_ratings, manager.requests]);
  this.person = ko.observable(null);
}
util.inherits(AddBandMember, Form);

AddBandMember.prototype.postChange_ = function(callback) {
  manager.requests.addBandMember(
    this.person().id(),
    function(result_code, result) {
      callback(result_code, result);
      this.person(null);
    }.bind(this)
  );
};

function AddBandSong() {
  Form.call(this, [manager.song_ratings]);
  this.song = ko.observable(null);
  this.key_signature = ko.observable(null);
}
util.inherits(AddBandSong, Form);

AddBandSong.prototype.postChange_ = function(callback) {
  manager.band_songs.create(
    {
      band_id: manager.current_band().id(),
      song_id: this.song().id(),
      song_status: -1,
      key_signature: this.key_signature()
    },
    function(result_code, result) {
      callback(result_code, result);
      this.song(null);
      this.key_signature(null);
    }.bind(this)
  );
};

function CreateRehearsalPlan() {
  Form.call(this, [manager.song_ratings]);
  this.rehearsal_date = ko.observable(new Date().toDateString());
  this.run_through_unselected = ko.observableArray();
  this.run_through_preselected = ko.observableArray();
  this.run_through_selected = ko.observableArray();
  this.run_through_deselected = ko.observableArray();
  this.learning_unselected = ko.observableArray();
  this.learning_selected = ko.observableArray();
}
util.inherits(CreateRehearsalPlan, Form);

CreateRehearsalPlan.prototype.show = function() {
  this.init();
  Form.prototype.show.call(this);
};

CreateRehearsalPlan.prototype.init = function() {
  var svc = service.getInstance();

  function mapSongs(list) {
    var sequence = 0;
    return list.map(function(song) {
        sequence++;
        return {
          sort_key: ko.observable(sequence),
          value: ko.observable(song.band_song_id),
          description: ko.computed(function() {
            var display_date = song.last_rehearsal_date ?
              new Date(song.last_rehearsal_date).toDateString() :
              'Never';

            var display_status = manager.song_status_map.filter(function(map_row) {
              return map_row.value == song.song_status;
            })[0].value_text;

            return '(' + sequence + ')' + song.song_name + ': ' + display_status + '(' + display_date + ')';
          }.bind(this))
        };
      }.bind(this));
  }

  var query_date = new Date(this.rehearsal_date()).toISOString().substr(0, 10);
  svc.get(
    '/plan_lists?band_id=' + manager.current_band().id() + '&rehearsal_date=' + query_date,
    function(result_code, result) {
      if (result_code != 200 && result_code != 304) {
        throw new Error('Get Plan Lists got result_code ' + result_code);
      }

      this.run_through_unselected(mapSongs(result.run_through_songs));
      this.learning_unselected(mapSongs(result.learning_songs));
    }.bind(this)
  );
  Form.prototype.init.call(this);
};

CreateRehearsalPlan.prototype.moveList_ = function(source, destination, control) {
  var i;
  while(i = control.shift()) {
    var rows = source.remove(function(item) {
      return item.band_song_id() == i;
    });

    var row;
    while(row = rows.shift()) {
      destination.push(row);
    }
  }
};

CreateRehearsalPlan.prototype.moveToSelected = function() {
  this.moveList_(
    this.run_through_unselected,
    this.run_through_selected,
    this.run_through_preselected
  );
};

CreateRehearsalPlan.prototype.moveToUnselected = function() {
  this.moveList_(
    this.run_through_selected,
    this.run_through_unselected,
    this.run_through_deselected
  );
};
