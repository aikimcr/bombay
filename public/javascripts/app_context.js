app_context = function() {
  this.context_list = [];
};

app_context.prototype.render = function() {
  var app_container = document.querySelector('.app_container');
  if (!app_container) return;

  this.context_list.push(new app_context.Person());
  this.context_list.push(new app_context.MemberBand());
  this.context_list.push(new app_context.BandMember());
  this.context_list.push(new app_context.Artist());
  this.context_list.push(new app_context.BandSong());

  this.context_list.forEach(function(context) { context.render(app_container); }, this);
};

app_context.prototype.redraw = function() {
  this.context_list.forEach(function(context) { context.redraw(); }, this);
};

// Person App App Object
app_context.Person = function() {
  this.tab_id = 'person_profile',
  this.tab_text = 'Profile',
  this.url = './person_profile.json',
  this.template = 'person_profile',
  this.fields = null;
};

app_context.Person.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

app_context.Person.prototype.redraw = function() {
  this.service = new service.generic(this.url, util.bind(this.handleAPIReturn, this));
  this.service.get();
};

app_context.Person.prototype.handleAPIReturn = function(data) {
  this.model = data;
  util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {editor: 1}});
  util.appendTextElement(this.context_item, container_text);

  var editor = document.querySelector('#' + this.tab_id + ' .editor');
  var editor_text = Templates['person/editor'](this.model);
  util.appendTextElement(editor, editor_text);

  this.form = document.querySelector('div.editor form[name="person"]');
  this.setupTabOrder_();
  var validator = util.bind(this.validateForm, this);
  this.form.addEventListener('change', validator);
  this.form.addEventListener('submit', validator);
  this.form.addEventListener('reset', validator);
  this.form.addEventListener('blur', validator);
};

app_context.Person.prototype.setupTabOrder_ = function() {
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

app_context.Person.prototype.disableFields_ = function(state) {
  var names = Object.keys(this.fields);
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    if (this.fields.hasOwnProperty(name)) {
      this.fields[name].disabled = state;
    }
  }
  this.submit_button.disabled = state;
};

app_context.Person.prototype.validateForm = function(e) {
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
app_context.MemberBand = function() {
  this.tab_id = 'member_bands',
  this.tab_text = 'Bands',
  this.url = './member_bands.json',
  this.template = 'member_bands'
};

app_context.MemberBand.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

app_context.MemberBand.prototype.redraw = function() {
  this.service = new service.generic(this.url, util.bind(this.handleAPIReturn, this));
  this.service.get();
};

app_context.MemberBand.prototype.handleAPIReturn = function(data) {
  this.model = data;
  util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {creator: 1, display: 1}, tab_id: this.tab_id});
  util.appendTextElement(this.context_item, container_text);

  var creator = document.querySelector('#' + this.tab_id + ' .creator');
  var creator_text = Templates['band/creator'](data);
  util.appendTextElement(creator, creator_text);

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['band/display'](data);
  util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['band/display/list'](data);
  util.appendTextElement(list, list_text);

  var form = document.querySelector('#' + this.tab_id + ' .creator form');
  form.addEventListener('submit', util.bind(this.handleCreateSubmit, this));

  var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
  var button_handler = util.bind(this.handleDelete, this);

  for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
    delete_buttons[button_idx].addEventListener('click', button_handler);
  }
};

app_context.MemberBand.prototype.handleCreateSubmit = function(e) {
  var form = e.target;
  var data = {
    band_name: form.firstChild.value
  };

  this.service = new service.generic('./member_bands.json', util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.MemberBand.prototype.handleAdd = function(data) {
  this.redraw();
};

app_context.MemberBand.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var band_id = row.attributes.item('band_id').value;

  var confirm_delete = new dialog('Delete band ' + band_id + '?');
  confirm_delete.show(util.bind(function(result) {
    if (result) {
      this.service = new service.generic('./member_bands.json?band_id=' + band_id,
        util.bind(function(result) { this.redraw(); }, this));
      this.service.delete();
    }
  }, this));
};

// Band Member App Object
app_context.BandMember = function() {
  this.tab_id = 'band_members',
  this.tab_text = 'Band Members',
  this.url = './band_members.json',
  this.template = 'band_members'
};

app_context.BandMember.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

app_context.BandMember.prototype.redraw = function() {
  var service_url = this.url + '?band_id=' + util.getBandId();
  this.service = new service.generic(service_url, util.bind(this.handleAPIReturn, this));
  this.service.get();
};

app_context.BandMember.prototype.handleAPIReturn = function(data) {
  this.model = data;
  util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {creator: 1, display: 1}, tab_id: this.tab_id});
  util.appendTextElement(this.context_item, container_text);

  var creator = document.querySelector('#' + this.tab_id + ' .creator');
  var creator_text = Templates['member/creator'](data);
  util.appendTextElement(creator, creator_text);

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['member/display'](data);
  util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['member/display/list'](data);
  util.appendTextElement(list, list_text);

  var add_form = document.querySelector('#' + this.tab_id + ' .creator div.add form');
  add_form.addEventListener('submit', util.bind(this.handleAddSubmit, this));

  var new_form = document.querySelector('#' + this.tab_id + ' .creator div.new form');
  new_form.addEventListener('submit', util.bind(this.handleNewSubmit, this));
};

app_context.BandMember.prototype.handleAddSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    person_id: form.querySelector('[name="person_id"]').value
  };

  this.service = new service.generic('./band_members.json', util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.BandMember.prototype.handleNewSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    name: form.querySelector('[name="name"]').value,
    full_name: form.querySelector('[name="full_name"]').value
  };

  this.service = new service.generic('./persons.json', util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.BandMember.prototype.handleAdd = function(data) {
  this.redraw();
};

// Artist App Object
app_context.Artist = function() {
  this.tab_id = 'artists',
  this.tab_text = 'Artists',
  this.url = './artists.json',
  this.template = 'artists'
};

app_context.Artist.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

app_context.Artist.prototype.redraw = function() {
  this.service = new service.generic(this.url, util.bind(this.handleAPIReturn, this));
  this.service.get();
};

app_context.Artist.prototype.handleAPIReturn = function(data) {
  this.model = data;
  util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {creator: 1, display: 1}, tab_id: this.tab_id});
  util.appendTextElement(this.context_item, container_text);

  var creator = document.querySelector('#' + this.tab_id + ' .creator');
  var creator_text = Templates['artist/creator'](data);
  util.appendTextElement(creator, creator_text);

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['artist/display'](data);
  util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['artist/display/list'](data);
  util.appendTextElement(list, list_text);

  var form = document.querySelector('#' + this.tab_id + ' .creator form');
  form.addEventListener('submit', util.bind(this.handleCreateSubmit, this));
};

app_context.Artist.prototype.handleCreateSubmit = function(e) {
  var form = e.target;
  var data = {
    artist_name: form.firstChild.value
  };

  this.service = new service.generic('./artists.json', util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.Artist.prototype.handleAdd = function(data) {
  this.redraw();
};

// BandSong App Object
app_context.BandSong = function() {
  this.tab_id = 'band_songs';
  this.tab_text = 'Songs';
  this.url = './songs.json';
  this.template = 'songs';
  this.context = null;
  this.model = null;
};

app_context.BandSong.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

app_context.BandSong.prototype.redraw = function() {
  var service_url = this.url + '?band_id=' + util.getBandId();
  this.service = new service.generic(service_url, util.bind(this.handleAPIReturn, this));
  this.service.get();
};

app_context.BandSong.prototype.handleAPIReturn = function(data) {
  this.model = data;
  util.removeAllChildren(this.context_item);

  var container_text = Templates['container']({sections: {creator: 1, display: 1}, tab_id: this.tab_id});
  util.appendTextElement(this.context_item, container_text);

  var creator = document.querySelector('#' + this.tab_id + ' .creator');
  var creator_text = Templates['song/creator'](data);
  util.appendTextElement(creator, creator_text);

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['song/display'](data);
  util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['song/display/list'](data);
  util.appendTextElement(list, list_text);

  this.model.band_songs.forEach(function(band_song) {
    var rating = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_rating"]');
    rating.value = band_song.rating;
    rating.addEventListener('change', util.bind(this.ratingChangeHandler, this));

    var status = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_status"]');
    status.value = band_song.song_status;
    status.addEventListener('change', util.bind(this.statusChangeHandler, this));
  }, this);

  //XXX Why is this here?
  var anchor = this.context.querySelector('a');
  anchor.addEventListener('click', function(e) { 
    return false;
  });

  var add_form = document.querySelector('#' + this.tab_id + ' .creator div.add form');
  add_form.addEventListener('submit', util.bind(this.handleAddSubmit, this));

  var new_form = document.querySelector('#' + this.tab_id + ' .creator div.new form');
  new_form.addEventListener('submit', util.bind(this.handleNewSubmit, this));
};

app_context.BandSong.prototype.handleAddSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    song_id: form.querySelector('[name="song_id"]').value
  };

  this.service = new service.generic('./songs.json', util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.BandSong.prototype.handleNewSubmit = function(e) {
  var form = e.target;
  var data = {
    song_name: form.querySelector('[name="song_name"]').value,
    artist_id: form.querySelector('[name="artist_id"]').value
  };

  this.service = new service.generic('./song_master.json', util.bind(this.handleAdd, this));
  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.BandSong.prototype.handleAdd = function(data) {
  this.redraw();
};

app_context.BandSong.prototype.ratingChangeHandler = function(e) {
  var input = e.target;
  var row = input.parentElement.parentElement;
  var band_song_id = row.attributes.getNamedItem('band_song_id').value; 

  var data = {
    'band_song_id': band_song_id,
    'rating': input.value
  };

  input.disabled = true;
  this.service = new service.generic('./song_rating.json', function(data) {
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

app_context.BandSong.prototype.statusChangeHandler = function(e) {
  var input = e.target;
  var row = input.parentElement.parentElement;
  var band_song_id = row.attributes.getNamedItem('band_song_id').value; 

  var data = {
    'band_song_id': band_song_id,
    'song_status': input.value
  };

  input.disabled = true;
  this.service = new service.generic('./song_status.json', function(data) {
    var row = document.querySelector('#band_songs .list tr[band_song_id="' + data.band_song_id + '"]');
    var input = row.querySelector('select[name="song_status"]');
    input.value = data.song_status;
    input.disabled = false;
  });
  this.service.set(data);
  return true;
};