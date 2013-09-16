AppContext = function() {
  this.context_list = [];
};

AppContext.prototype.render = function() {
  var app_container = document.querySelector('.app_container');
  if (!app_container) return;

  this.context_list.push(new AppContext.Person());
  this.context_list.push(new AppContext.MemberBand());
  this.context_list.push(new AppContext.BandMember());
  this.context_list.push(new AppContext.Artist());
  this.context_list.push(new AppContext.BandSong());

  this.context_list.forEach(function(context) { context.render(app_container); }, this);
};

AppContext.prototype.redraw = function() {
  this.context_list.forEach(function(context) { context.redraw(); }, this);
};

// Person App App Object
AppContext.Person = function() {
  this.tab_id = 'person_profile',
  this.tab_text = 'Profile',
  this.url = './person_profile.json',
  this.template = 'person_profile',
  this.fields = null;
};

AppContext.Person.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  Util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

AppContext.Person.prototype.redraw = function() {
  this.service = new Service(this.url, Util.bind(this.handleAPIReturn, this));
  this.service.get();
};

AppContext.Person.prototype.handleAPIReturn = function(data) {
  this.model = data;
  Util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {editor: 1}});
  Util.appendTextElement(this.context_item, container_text);

  var editor = document.querySelector('#' + this.tab_id + ' .editor');
  var editor_text = Templates['person/editor'](this.model);
  Util.appendTextElement(editor, editor_text);

  this.form = document.querySelector('div.editor form[name="person"]');
  this.setupTabOrder_();
  var validator = Util.bind(this.validateForm, this);
  this.form.addEventListener('change', validator);
  this.form.addEventListener('submit', validator);
  this.form.addEventListener('reset', validator);
  this.form.addEventListener('blur', validator);
};

AppContext.Person.prototype.setupTabOrder_ = function() {
  this.tab_order = {
    old_password: 'new_password',
    new_password: 'verify_new_password',
    verify_new_password: 'name',
    name: 'full_name',
    full_name: 'email',
    email: null
  };
  var edits = this.form.querySelectorAll('td.editor');
  this.fields = {};
  var i;

  for(i = 0; i < edits.length; i++) {
    var edit = edits[i];
    var field = edit.firstChild;
    var field_name = field.attributes.name.value;
    this.fields[field_name] = field;
  };

  this.submit_button = this.form.querySelector('[type="submit"]');
};

AppContext.Person.prototype.disableFields_ = function(state) {
  var names = Object.keys(this.fields);
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    if (this.fields.hasOwnProperty(name)) {
      this.fields[name].disabled = state;
    }
  }
  this.submit_button.disabled = state;
};

AppContext.Person.prototype.validateForm = function(e) {
  var form = e.target.tagName.toLowerCase() == 'form' ? form = e.target : form = e.target.form;

  this.disableFields_(true);
  this.fields.old_password.disabled = false;
  if (e.type == 'reset') { 
    this.fields.old_password.focus();
    return;
  }

  if (this.fields.old_password.value == this.model.person.password) {
    this.disableFields_(false);

    var next_field_name = this.tab_order[e.target.name];
    var next_field = this.submit_button;

    if (next_field_name) {
      next_field = this.fields[next_field_name];
    }

    if (this.fields.new_password.value == '') {
      next_field.focus();
    } else if (this.fields.new_password.value == this.fields.verify_new_password.value) {
      this.submit_button.disabled = false;
      next_field.focus();
    } else {
      this.disableFields_(true);
      this.submit_button.disabled = true;
      this.fields.old_password.disabled = false;
      this.fields.new_password.disabled = false;
      this.fields.verify_new_password.disabled = false;
      this.fields.verify_new_password.focus()
    }
  } else {
    this.fields.old_password.focus();
  }
};

// Member Band App Object
AppContext.MemberBand = function() {
  this.tab_id = 'member_bands',
  this.tab_text = 'Bands',
  this.url = './member_bands.json',
  this.template = 'member_bands'
};

AppContext.MemberBand.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  Util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

AppContext.MemberBand.prototype.redraw = function() {
  this.service = new Service(this.url, Util.bind(this.handleAPIReturn, this));
  this.service.get();
};

AppContext.MemberBand.prototype.handleAPIReturn = function(data) {
  this.model = data;
  Util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {creator: 1, display: 1}, tab_id: this.tab_id});
  Util.appendTextElement(this.context_item, container_text);

  var creator = document.querySelector('#' + this.tab_id + ' .creator');
  var creator_text = Templates['band/creator'](data);
  Util.appendTextElement(creator, creator_text);

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['band/display'](data);
  Util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['band/display/list'](data);
  Util.appendTextElement(list, list_text);

  var form = document.querySelector('#' + this.tab_id + ' .creator form');
  form.addEventListener('submit', Util.bind(this.handleCreateSubmit, this));

  var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
  var button_handler = Util.bind(this.handleDelete, this);

  for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
    delete_buttons[button_idx].addEventListener('click', button_handler);
  }

  var band_selector = Util.getBandSelector();
  Util.removeAllChildren(band_selector);

  this.model.member_bands.forEach(function(band) {
    var new_option = document.createElement('option');
    new_option.innerHTML = band.name;
    new_option.value = band.id;
    band_selector.appendChild(new_option);
  });
};

AppContext.MemberBand.prototype.handleCreateSubmit = function(e) {
  var form = e.target;
  var data = {
    band_name: form.firstChild.value
  };

  this.service = new Service('./member_bands.json', Util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

AppContext.MemberBand.prototype.handleAdd = function(data) {
  this.redraw();
};

AppContext.MemberBand.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var band_id = row.attributes.item('band_id').value;
  var band = this.model.member_bands.filter(function (mb) { return mb.id == band_id })[0];

  var confirm_delete = new dialog('Quit band ' + band.name + '?');
  confirm_delete.show(Util.bind(function(result) {
    if (result) {
      this.service = new Service('./member_bands.json?band_id=' + band_id,
        Util.bind(function(result) {
          this.redraw();
        }, this));
      this.service.delete();
    } else {
      this.redraw();
    }
  }, this));

  return true;
};

// Band Member App Object
AppContext.BandMember = function() {
  this.tab_id = 'band_members',
  this.tab_text = 'Band Members',
  this.url = './band_members.json',
  this.template = 'band_members'
};

AppContext.BandMember.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  Util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

AppContext.BandMember.prototype.redraw = function() {
  var service_url = this.url + '?band_id=' + Util.getBandId();
  this.service = new Service(service_url, Util.bind(this.handleAPIReturn, this));
  this.service.get();
};

AppContext.BandMember.prototype.handleAPIReturn = function(data) {
  this.model = data;

  this.model.band_admin = data.permissions.is_band_admin || data.permissions.is_sysadmin;
  Util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({
    sections: {creator: this.model.band_admin, display: true},
    tab_id: this.tab_id
  });
  Util.appendTextElement(this.context_item, container_text);

  if (this.model.band_admin) {
    var creator = document.querySelector('#' + this.tab_id + ' .creator');
    var creator_text = Templates['member/creator'](this.model);
    Util.appendTextElement(creator, creator_text);
  }

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['member/display'](this.model);
  Util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['member/display/list'](this.model);
  Util.appendTextElement(list, list_text);

  if (this.model.band_admin) {
    var add_form = document.querySelector('#' + this.tab_id + ' .creator div.add form');
    add_form.addEventListener('submit', Util.bind(this.handleAddSubmit, this));

    var new_form = document.querySelector('#' + this.tab_id + ' .creator div.new form');
    new_form.addEventListener('submit', Util.bind(this.handleNewSubmit, this));

    var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
    var button_handler = Util.bind(this.handleDelete, this);

    for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
      delete_buttons[button_idx].addEventListener('click', button_handler);
    }
  }
};

AppContext.BandMember.prototype.handleAddSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    person_id: form.querySelector('[name="person_id"]').value
  };

  this.service = new Service('./band_members.json', Util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

AppContext.BandMember.prototype.handleNewSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    name: form.querySelector('[name="name"]').value,
    full_name: form.querySelector('[name="full_name"]').value
  };

  this.service = new Service('./persons.json', Util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

AppContext.BandMember.prototype.handleAdd = function(data) {
  this.redraw();
  app.context_list.forEach(function(context) {
    if (context.tab_id == 'band_songs') {
      context.redraw();
    }
  });
};

AppContext.BandMember.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var member_id = row.attributes.item('member_id').value;
  var member = this.model.members.filter(function (mem) { return mem.id == member_id })[0];

  var confirm_delete = new dialog('Remove ' + member.full_name + ' from ' + this.model.band.name + '?');
  confirm_delete.show(Util.bind(function(result) {
    if (result) {
      var url = './band_members.json?member_id=' + member_id + '&band_id=' + this.model.band.id;
      this.service = new Service(url, Util.bind(function(result) {
        this.redraw();
        app.context_list.forEach(function(context) {
          if (context.tab_id == 'band_songs') {
            context.redraw();
          }
        });
      }, this));
      this.service.delete();
    } else {
      this.redraw();
    }
  }, this));

  return true;
};

// Artist App Object
AppContext.Artist = function() {
  this.tab_id = 'artists',
  this.tab_text = 'Artists',
  this.url = './artists.json',
  this.template = 'artists'
};

AppContext.Artist.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  Util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

AppContext.Artist.prototype.redraw = function() {
  var band_id = Util.getBandId();
  var url = this.url + '?band_id=' + band_id;
  this.service = new Service(url, Util.bind(this.handleAPIReturn, this));
  this.service.get();
};

AppContext.Artist.prototype.handleAPIReturn = function(data) {
  this.model = data;

  this.model.band_admin = data.permissions.is_band_admin || data.permissions.is_sysadmin;
  Util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({
    sections: {creator: this.model.band_admin, display: 1},
    tab_id: this.tab_id
  });
  Util.appendTextElement(this.context_item, container_text);

  if (this.model.band_admin) {
    var creator = document.querySelector('#' + this.tab_id + ' .creator');
    var creator_text = Templates['artist/creator'](this.model);
    Util.appendTextElement(creator, creator_text);
  }

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['artist/display'](this.model);
  Util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['artist/display/list'](this.model);
  Util.appendTextElement(list, list_text);

  if (this.model.band_admin) {
    var form = document.querySelector('#' + this.tab_id + ' .creator form');
    form.addEventListener('submit', Util.bind(this.handleCreateSubmit, this));
  }

  if (this.model.permissions.is_sysadmin) {
    var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
    var button_handler = Util.bind(this.handleDelete, this);

    for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
      delete_buttons[button_idx].addEventListener('click', button_handler);
    }
  }
};

AppContext.Artist.prototype.handleCreateSubmit = function(e) {
  var form = e.target;
  var data = {
    artist_name: form.firstChild.value
  };

  this.service = new Service('./artists.json', Util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

AppContext.Artist.prototype.handleAdd = function(data) {
  this.redraw();
  app.context_list.forEach(function(context) {
    if (context.tab_id == 'band_songs') {
      context.redraw();
    }
  });
};

AppContext.Artist.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var artist_id = row.attributes.item('artist_id').value;
  var artist = this.model.artists.filter(function (art) { return art.id == artist_id })[0];

  var confirm_delete = new dialog('Remove ' + artist.name + '?');
  confirm_delete.show(Util.bind(function(result) {
    if (result) {
      var url = './artists.json?artist_id=' + artist_id;
      this.service = new Service(url, Util.bind(function(result) {
        this.redraw();
        app.context_list.forEach(function(context) {
          if (context.tab_id == 'band_songs') {
            context.redraw();
          }
        });
      }, this));
      this.service.delete();
    } else {
      this.redraw();
    }
  }, this));

  return true;
};

// BandSong App Object
AppContext.BandSong = function() {
  this.tab_id = 'band_songs';
  this.tab_text = 'Songs';
  this.url = './songs.json';
  this.template = 'songs';
  this.context = null;
  this.model = null;
};

AppContext.BandSong.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  Util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

AppContext.BandSong.prototype.redraw = function() {
  var service_url = this.url + '?band_id=' + Util.getBandId();
  this.service = new Service(service_url, Util.bind(this.handleAPIReturn, this));
  this.service.get();
};

AppContext.BandSong.prototype.handleAPIReturn = function(data) {
  this.model = data;

  this.model.band_admin = data.permissions.is_band_admin || data.permissions.is_sysadmin;
  Util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({
    sections: {creator: this.model.band_admin, display: 1},
    tab_id: this.tab_id
  });
  Util.appendTextElement(this.context_item, container_text);

  if (this.model.band_admin) {
    var creator = document.querySelector('#' + this.tab_id + ' .creator');
    var creator_text = Templates['song/creator'](this.model);
    Util.appendTextElement(creator, creator_text);
  }

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['song/display'](this.model);
  Util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['song/display/list'](this.model);
  Util.appendTextElement(list, list_text);

  this.model.band_songs.forEach(function(band_song) {
    var rating = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_rating"]');
    rating.value = band_song.rating;
    rating.addEventListener('change', Util.bind(this.ratingChangeHandler, this));

    var status = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_status"]');
    status.value = band_song.song_status;
    if (this.model.band_admin) {
      status.addEventListener('change', Util.bind(this.statusChangeHandler, this));
    } else {
      status.disabled = true;
    }
  }, this);

  //XXX Why is this here?
  var anchor = this.context.querySelector('a');
  anchor.addEventListener('click', function(e) { 
    return false;
  });

  if (this.model.band_admin) {
    var add_form = document.querySelector('#' + this.tab_id + ' .creator div.add form');
    add_form.addEventListener('submit', Util.bind(this.handleAddSubmit, this));

    var new_form = document.querySelector('#' + this.tab_id + ' .creator div.new form');
    new_form.addEventListener('submit', Util.bind(this.handleNewSubmit, this));

    var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
    var button_handler = Util.bind(this.handleDelete, this);

    for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
      delete_buttons[button_idx].addEventListener('click', button_handler);
    }
  }
};

AppContext.BandSong.prototype.handleAddSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    song_id: form.querySelector('[name="song_id"]').value
  };

  this.service = new Service('./songs.json', Util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

AppContext.BandSong.prototype.handleNewSubmit = function(e) {
  var form = e.target;
  var data = {
    song_name: form.querySelector('[name="song_name"]').value,
    artist_id: form.querySelector('[name="artist_id"]').value
  };

  this.service = new Service('./song_master.json', Util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

AppContext.BandSong.prototype.handleAdd = function(data) {
  this.redraw();
};

AppContext.BandSong.prototype.ratingChangeHandler = function(e) {
  var input = e.target;
  var row = input.parentElement.parentElement;
  var band_song_id = row.attributes.getNamedItem('band_song_id').value; 

  var data = {
    'band_song_id': band_song_id,
    'rating': input.value
  };

  input.disabled = true;
  this.service = new Service('./song_rating.json', function(data) {
    var row = document.querySelector('#band_songs .list tr[band_song_id="' + data.band_song_id + '"]');
    var input = row.querySelector('select[name="song_rating"]');
    input.value = data.song_rating.rating;
    input.disabled = false;
    row.lastChild.innerHTML = '';
    for(var i=0;i<data.song_rating.average_rating;i++) {
      row.lastChild.innerHTML += '&#x2605';
    }
  });
  this.service.set(data);
  return true;
};

AppContext.BandSong.prototype.statusChangeHandler = function(e) {
  var input = e.target;
  var row = input.parentElement.parentElement;
  var band_song_id = row.attributes.getNamedItem('band_song_id').value; 

  var data = {
    'band_song_id': band_song_id,
    'song_status': input.value
  };

  input.disabled = true;
  this.service = new Service('./song_status.json', function(data) {
    var row = document.querySelector('#band_songs .list tr[band_song_id="' + data.band_song_id + '"]');
    var input = row.querySelector('select[name="song_status"]');
    input.value = data.song_status;
    input.disabled = false;
  });
  this.service.set(data);
  return true;
};

AppContext.BandSong.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var band_song_id = row.attributes.item('band_song_id').value;
  var band_song = this.model.band_songs.filter(function (song) { return song.band_song_id == band_song_id })[0];

  var confirm_delete = new dialog('Remove ' + band_song.name + '?');
  confirm_delete.show(Util.bind(function(result) {
    if (result) {
      var url = './songs.json?band_song_id=' + band_song_id;
      this.service = new Service(url, Util.bind(function(result) { this.redraw(); }, this));
      this.service.delete();
    } else {
      this.redraw();
    }
  }, this));

  return true;
};
