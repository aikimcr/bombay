function app_form(model, editor) {
  this.model_ = model;
  this.editor_ = editor;
};

app_form.prototype.render = function(parent) {
  this.createDom(parent);
  this.renderDocument();
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

app_form.prototype.getElement = function() {
  return this.element_;
};

app_form.prototype.getModel = function() {
  return this.model_;
};

app_form.prototype.fireChange = function() {
  this.element_.dispatchEvent(new CustomEvent('app_form_change'));
};

app_form.Filters = function(model, editor) {
  app_form.call(this, model, editor);
};
util.inherits(app_form.Filters, app_form);

app_form.Filters.prototype.renderDocument = function() {
  app_form.prototype.renderDocument.call(this);  

  var filter_fields = this.getFilterFields_();
  var model = this.getModel();

  filter_fields.sort_type.value = model.sort_type;

  for(var i = 0; i < filter_fields.filters.length; i++) {
    var filter = filter_fields.filters[i];
    var filter_name = filter.attributes.item('name').value;

    if (model.filters[filter_name]) {
      filter.value = model.filters[filter_name];
    }
  }

  this.element_.addEventListener('change', function(e) {
    this.element_.dispatchEvent(new CustomEvent('app_filter_change'));
  }.bind(this));

};

app_form.Filters.prototype.getFilterFields_ = function() {
  return {
    sort_type: this.getElement().querySelector('.sort > :not(label)'),
    filters: this.getElement().querySelectorAll('.filter > :not(label')
  };
};

app_form.Filters.prototype.getFilterValues = function() {
  var filter_fields = this.getFilterFields_();

  var result = {
    'sort_type': filter_fields.sort_type.value,
    'filters': {}
  };

  for(var i = 0; i < filter_fields.filters.length; i++) {
    var filter = filter_fields.filters[i];
    var value = filter.value;

    var filter_name = filter.attributes.item('name').value;
    if (value != null) {
      if (value !== '') {
	var int_value = parseInt(value);
	if (!isNaN(int_value)) {
	  if (int_value >= 0) {
	    result.filters[filter_name] = int_value;
	  }
	} else {
	  result.filters[filter_name] = value;
	}
      }
    }
  }

  return result;
};

app_form.Filters.prototype.getFilterQuery = function() {
  var filters = this.getFilterValues();
  var result = [
    'sort_type=' + filters['sort_type'],
    'filters=' + JSON.stringify(filters['filters'])
  ];

  return result.join('&');
};

app_form.Filters.BandSong = function(model, editor) {
  app_form.Filters.call(this, model, editor);
};
util.inherits(app_form.Filters.BandSong, app_form.Filters);
app_form.Filters.BandSong.prototype.template_name_ = 'song/display/filters';

app_form.List = function(model, editor) {
  app_form.call(this, model, editor);
};
util.inherits(app_form.List, app_form);

app_form.List.prototype.renderDocument = function() {
  app_form.prototype.renderDocument.call(this);

  if (this.editor_) {
    var delete_buttons = this.element_.querySelectorAll('.delete');
    var button_handler = this.handleDelete.bind(this);

    for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
      delete_buttons[button_idx].addEventListener('click', button_handler);
    }
  }
};

app_form.List.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var identity = row.attributes.item(this.identity_name_).value;
  var object = this.getRowForIdentity(identity);

  var confirm_delete = new dialog(this.getConfirmMessage(object));
  confirm_delete.show(function(result) {
    if (result) {
      service.getInstance().delete(
        this.getServiceUrl(identity),
	this.fireChange.bind(this)
      );
    } else {
      this.fireChange();
    }
  }.bind(this));

  return true;
};

app_form.List.Band = function(model, editor) {
  app_form.List.call(this, model, editor);
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

app_form.List.BandMember = function(model, editor) {
  app_form.List.call(this, model, editor);
};
util.inherits(app_form.List.BandMember, app_form.List);
app_form.List.BandMember.prototype.template_name_ = 'member/display/list';
app_form.List.BandMember.prototype.identity_name_ = 'member_id';

app_form.List.BandMember.prototype.getRowForIdentity = function(person_id) {
  return this.getModel().band_members.filter(function (mem) { return mem.id == person_id })[0];
};

app_form.List.BandMember.prototype.getConfirmMessage = function(person) {
  return 'Remove ' + person.full_name + ' from ' + this.getModel().band.name + '?'
};

app_form.List.BandMember.prototype.getServiceUrl = function(person_id) {
  return './band_member?person_id=' + person_id + '&band_id=' + this.getModel().band.id;
};

app_form.List.BandMember.prototype.renderDocument = function() {
  app_form.List.prototype.renderDocument.call(this);

  var fields = this.getElement().querySelectorAll('tr[member_id] td.band_admin');
  for(var i = 0; i < fields.length; i++) {
    var field = fields[i];
    field.addEventListener('change', this.handleBandAdminChange.bind(this));
  }
};

app_form.List.BandMember.prototype.handleBandAdminChange = function(e) {
  var cell = e.target;
  var row = cell.parentElement.parentElement;
  var data = {
    person_id: row.attributes.getNamedItem('member_id').value,
    band_id: util.getBandId(),
    band_admin: cell.checked ? 1 : 0
  };

  service.getInstance().put(
    './band_member',
    this.fireChange.bind(this),
    data
  );
};

app_form.List.Artist = function(model, editor) {
  app_form.List.call(this, model, editor);
};
util.inherits(app_form.List.Artist, app_form.List);
app_form.List.Artist.prototype.template_name_ = 'artist/display/list';
app_form.List.Artist.prototype.identity_name_ = 'artist_id';

app_form.List.Artist.prototype.getRowForIdentity = function(artist_id) {
  return this.getModel().artists.filter(function (art) { return art.id == artist_id })[0];
};

app_form.List.Artist.prototype.getConfirmMessage = function(artist) {
  return 'Remove ' + artist.name + '?';
};

app_form.List.Artist.prototype.getServiceUrl = function(artist_id) {
  return './artist?artist_id=' + artist_id;
};

app_form.List.BandSong = function(model, editor) {
  app_form.List.call(this, model, editor);
};
util.inherits(app_form.List.BandSong, app_form.List);
app_form.List.BandSong.prototype.template_name_ = 'song/display/list';
app_form.List.BandSong.prototype.identity_name_ = 'band_song_id';

app_form.List.BandSong.prototype.renderDocument = function() {
  app_form.List.prototype.renderDocument.call(this);

  this.getModel().band_songs.forEach(function(band_song) {
    var rating = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_rating"]');
    rating.value = band_song.rating;
    rating.addEventListener('change', this.handleRatingChange.bind(this));

    var avg_rating = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] [name="avg_rating"] div');
    var max_width = 100;
    avg_rating.style.overflow = 'hidden';
    avg_rating.style.width = parseInt(max_width * (band_song.avg_rating / 5)) + 'px';

    var status = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_status"]');
    status.value = band_song.song_status;
    if (this.getModel().band_admin) {
      status.addEventListener('change', this.handleStatusChange.bind(this));
    } else {
      status.disabled = true;
    }
  }, this);
};

app_form.List.BandSong.prototype.handleRatingChange = function(e) {
  var input = e.target;
  var row = input.parentElement.parentElement;
  var band_song_id = row.attributes.getNamedItem('band_song_id').value; 

  var data = {
    'band_song_id': band_song_id,
    'rating': input.value
  };

  input.disabled = true;
  service.getInstance().set(
    './song_rating',
    this.fireChange.bind(this),
    data
  );
  return true;
};

app_form.List.BandSong.prototype.handleStatusChange = function(e) {
  var input = e.target;
  var row = input.parentElement.parentElement;
  var band_song_id = row.attributes.getNamedItem('band_song_id').value; 

  var data = {
    'band_song_id': band_song_id,
    'song_status': input.value
  };

  input.disabled = true;
  service.getInstance.set(
    './song_status',
    this.fireChange.bind(this),
    data
  );
  return true;
};

app_form.List.BandSong.prototype.getRowForIdentity = function(band_song_id) {
  return  this.getModel().band_songs.filter(function (song) { return song.band_song_id == band_song_id })[0];
};

app_form.List.BandSong.prototype.getConfirmMessage = function(band_song) {
  return 'Remove ' + band_song.name + '?';
};

app_form.List.BandSong.prototype.getServiceUrl = function(band_song_id) {
  return './band_song?band_song_id=' + band_song_id;
};

app_form.Editor = function(model, editor) {
  app_form.call(this, model, editor);
};
util.inherits(app_form.Editor, app_form);

app_form.Editor.prototype.renderDocument = function() {
  app_form.prototype.renderDocument.call(this);
  this.element_.addEventListener('submit', this.handleSubmit.bind(this));
  this.element_.addEventListener('change', this.handleChange.bind(this));
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
  service.getInstance.set(
    this.edit_url_,
    this.handleEdit.bind(this),
    data
  );
  e.preventDefault();
  return false;
};

app_form.Editor.prototype.handleChange = function(e) {};

app_form.Editor.prototype.handleEdit = function(result) {
  this.fireChange();
};

app_form.Editor.PersonEdit = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.PersonEdit, app_form.Editor);
app_form.Editor.PersonEdit.prototype.template_name_ = 'person/editor';
app_form.Editor.PersonEdit.prototype.edit_url_ = './person';

app_form.Editor.PersonEdit.prototype.handleChange = function(e) {
  var form = e.target.form;
  var old_password = form.querySelector('[name="old_password"]');
  var new_password = form.querySelector('[name="new_password"]');
  var verify_new_password = form.querySelector('[name="verify_new_password"]');
  var submit_button = form.querySelector('[type="submit"]');

  if (old_password.value != '' && old_password.value != null) {
    if (old_password.value == this.getModel().person.password) {
      verify_new_password.disabled = false;

      if (new_password.value != '' && new_password.value != null) {
        if (new_password.value == verify_new_password.value) {
          submit_button.disabled = false;
        } else {
          submit_button.disabled = true;
        }
      } else {
        submit_button.disabled = false;
      }
    } else {
      verify_new_password.disabled = true;
      submit_button.disabled = true;
    }
  } else {
    verify_new_password.disabled = true;
    submit_button.disabled = false;
  }
};

app_form.Editor.PersonEdit.prototype.getFormData = function(form) {
  var data = {
    id: this.getModel().person.id,
    name: form.querySelector('[name="name"]').value,
    full_name: form.querySelector('[name="full_name"]').value,
    email: form.querySelector('[name="email"]').value
  };

  var old_password = form.querySelector('[name="old_password"]').value;
  var new_password = form.querySelector('[name="new_password"]').value;
  var verify_new_password = form.querySelector('[name="verify_new_password"]').value;

  if (old_password == this.getModel().person.password) {
    if (new_password != '' && new_password != null) {
      if (new_password == verify_new_password) {
        data.password = new_password;
      }
    }
  }

  return data;
};

app_form.Editor.BandCreator = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.BandCreator, app_form.Editor);
app_form.Editor.BandCreator.prototype.template_name_ = 'band/editor/create';
app_form.Editor.BandCreator.prototype.edit_url_ = './band';

app_form.Editor.BandCreator.prototype.getFormData = function(form) {
  return {
    name: form.querySelector('[name="band_name"]').value
  };
};

app_form.Editor.BandJoin = function(model, editor) {
  app_form.Editor.call(this, model, editor);
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

app_form.Editor.BandMemberNew = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.BandMemberNew, app_form.Editor);
app_form.Editor.BandMemberNew.prototype.template_name_ = 'member/editor/new';
app_form.Editor.BandMemberNew.prototype.edit_url_ = './create_person';

app_form.Editor.BandMemberNew.prototype.getFormData = function(form) {
  return {
    name: form.querySelector('[name="name"]').value,
    full_name: form.querySelector('[name="full_name"]').value
  };
};

app_form.Editor.BandMemberAdd = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.BandMemberAdd, app_form.Editor);
app_form.Editor.BandMemberAdd.prototype.template_name_ = 'member/editor/add';
app_form.Editor.BandMemberAdd.prototype.edit_url_ = './band_member';

app_form.Editor.BandMemberAdd.prototype.getFormData = function(form) {
  return {
    band_id: form.querySelector('[name="band_id"]').value,
    person_id: form.querySelector('[name="person_id"]').value
  };
};

app_form.Editor.ArtistNew = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.ArtistNew, app_form.Editor);
app_form.Editor.ArtistNew.prototype.template_name_ = 'artist/editor/new';
app_form.Editor.ArtistNew.prototype.edit_url_ = './artist';

app_form.Editor.ArtistNew.prototype.getFormData = function(form) {
  return {
    name: form.firstChild.value
  };
};

app_form.Editor.BandSongNew = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.BandSongNew, app_form.Editor);
app_form.Editor.BandSongNew.prototype.template_name_ = 'song/editor/new';
app_form.Editor.BandSongNew.prototype.edit_url_ = './song';

app_form.Editor.BandSongNew.prototype.getFormData = function(form) {
  return {
    name: form.querySelector('[name="song_name"]').value,
    artist_id: form.querySelector('[name="artist_id"]').value
  };
};

app_form.Editor.BandSongAdd = function(model, editor) {
  app_form.Editor.call(this, model, editor);
};
util.inherits(app_form.Editor.BandSongAdd, app_form.Editor);
app_form.Editor.BandSongAdd.prototype.template_name_ = 'song/editor/add';
app_form.Editor.BandSongAdd.prototype.edit_url_ = './band_song';

app_form.Editor.BandSongAdd.prototype.getFormData = function(form) {
  return {
    band_id: form.querySelector('[name="band_id"]').value,
    song_id: form.querySelector('[name="song_id"]').value
  };
};
