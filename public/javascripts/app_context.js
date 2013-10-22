function app_context() {
  this.context_list = [];
}

app_context.setBandSelector = function(band_list) {
  var band_selector = util.getBandSelector();
  var current_band_id = util.getBandId();
  util.removeAllChildren(band_selector);

  var selected_band_id = null;
  band_list.forEach(function(band) {
    var new_option = document.createElement('option');
    new_option.innerHTML = band.name;
    new_option.value = band.id;
    band_selector.appendChild(new_option);
    if (band.id == current_band_id) {
      selected_band_id = band.id;
    }
  });

  band_selector.value = selected_band_id || band_list[0].id;
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

app_context.Base = function() {
  this.fields = null;
};

app_context.Base.prototype.render = function(app_container) {
  var pane_text = Templates['app_context']({tab_id: this.tab_id, tab_text: this.tab_text});
  util.appendTextElement(app_container, pane_text);
  this.context = document.querySelector('#' + this.tab_id);
  this.context_item = document.querySelector('#' + this.tab_id + ' .app_context_item');
  this.redraw();
};

app_context.Base.prototype.getDrawUrl = function() {
  return this.url;
};

app_context.Base.prototype.redraw = function() {
  var service_url = this.getDrawUrl();
  this.service = new service.generic(service_url, util.bind(this.handleAPIReturn, this));
  this.service.get();
};

app_context.Base.prototype.getContextArgs = function() {
  return {};
};

app_context.Base.prototype.handleAPIReturn = function(data) {
  this.model = data;
  util.removeAllChildren(this.context_item);

  var container_text = Templates['container'](this.getContextArgs());
  util.appendTextElement(this.context_item, container_text);

};

app_context.Base.prototype.otherChangeTabs = function() {
  return [];
};

app_context.Base.prototype.handleAfterChange = function() {
  this.redraw();
  var other_change_tabs = this.otherChangeTabs();
  other_change_tabs.forEach(function(tab_name) {
    app.context_list.forEach(function(context) {
      if (context.tab_id == tab_name) {
        context.redraw();
      }
    });
  });
};

app_context.Base.prototype.handleAdd = function() {
  this.handleAfterChange();
};

app_context.Base.prototype.handleEdit = function() {
  this.handleAfterChange();
};

// Person App App Object
app_context.Person = function() {
  this.tab_id = 'person_profile',
  this.tab_text = 'Profile',
  this.url = './person',
  this.template = 'person_profile',
  app_context.Base(this);
};

app_context.Person.prototype = new app_context.Base();

app_context.Person.prototype.getContextArgs = function() {
  return {sections: {editor: 1}};
};

app_context.Person.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  var editor = document.querySelector('#' + this.tab_id + ' .editor');
  var editor_text = Templates['person/editor'](this.model);
  util.appendTextElement(editor, editor_text);

  this.form = document.querySelector('div.editor form[name="person"]');
  this.form.addEventListener('submit', util.bind(this.handleEditSubmit, this));
  this.form.addEventListener('change', util.bind(this.handleFormChange, this));
};

app_context.Person.prototype.handleFormChange = function(e) {
  var form = e.target.form;
  var old_password = form.querySelector('[name="old_password"]');
  var new_password = form.querySelector('[name="new_password"]');
  var verify_new_password = form.querySelector('[name="verify_new_password"]');
  var submit_button = form.querySelector('[type="submit"]');

  if (old_password.value != '' && old_password.value != null) {
    if (old_password.value == this.model.person.password) {
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
}

app_context.Person.prototype.handleEditSubmit = function(e) {
  window.console.log(e);
  var form = e.target;
  var data = {
    id: this.model.person.id,
    name: form.querySelector('[name="name"]').value,
    full_name: form.querySelector('[name="full_name"]').value,
    email: form.querySelector('[name="email"]').value
  };

  var old_password = form.querySelector('[name="old_password"]').value;
  var new_password = form.querySelector('[name="new_password"]').value;
  var verify_new_password = form.querySelector('[name="verify_new_password"]').value;

  if (old_password == this.model.person.password) {
    if (new_password != '' && new_password != null) {
      if (new_password == verify_new_password) {
        data.password = new_password;
      }
    }
  }

  this.service = new service.generic(
    './person',
    util.bind(this.handleEdit, this)
  );

  this.service.set(data);
  e.preventDefault();
  return false;
};

// Member Band App Object
app_context.MemberBand = function() {
  this.tab_id = 'member_bands';
  this.tab_text = 'Bands';
  this.url = './person_band';
  this.template = 'member_bands';
  app_context.Base(this);
};

app_context.MemberBand.prototype = new app_context.Base();

app_context.MemberBand.prototype.getContextArgs = function() {
  return {sections: {multiedit: 1, display: 1}, tab_id: this.tab_id};
};

app_context.MemberBand.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  var add_div = document.querySelector('#' + this.tab_id + ' .editor .add');
  var add_form = new app_form.Editor.BandJoin(data, true);
  add_form.createDom(add_div);
  add_form.renderDocument();
  add_form.addEventListener('app_form_change', util.bind(this.handleAfterChange, this));

  var create_div = document.querySelector('#' + this.tab_id + ' .editor .new');
  var create_form = new app_form.Editor.BandCreator(data, true);
  create_form.createDom(create_div);
  create_form.renderDocument();
  create_form.addEventListener('app_form_change', util.bind(this.handleAfterChange, this));

  var list_div = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_form = new app_form.List.Band(data, true);
  list_form.createDom(list_div);
  list_form.renderDocument();
  list_form.addEventListener('app_form_change', util.bind(this.handleAfterChange, this));

  app_context.setBandSelector(this.model.person_bands);
};

// Band Member App Object
app_context.BandMember = function() {
  this.tab_id = 'band_members';
  this.tab_text = 'Band Members';
  this.url = './band_member';
  this.template = 'band_members';
  app_context.Base(this);
};

app_context.BandMember.prototype = new app_context.Base();

app_context.BandMember.prototype.getDrawUrl = function() {
  return this.url + '?band_id=' + util.getBandId();
};

app_context.BandMember.prototype.getContextArgs = function() {
  this.model.band_admin = this.model.band_admin || this.model.system_admin;
  
  return {
    sections: {multiedit: this.model.band_admin, display: true},
    tab_id: this.tab_id
  };
};

app_context.BandMember.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  if (this.model.band_admin) {
    var add_div = document.querySelector('#' + this.tab_id + ' .editor .add');
    var add_form = new app_form.Editor.BandMemberAdd(data, this.model.band_admin);
    add_form.createDom(add_div);
    add_form.renderDocument();
    add_form.addEventListener('app_form_change', util.bind(this.handleAfterChange, this));

    var create_div = document.querySelector('#' + this.tab_id + ' .editor .new');
    var create_form = new app_form.Editor.BandMemberNew(data, this.model.band_admin);
    create_form.createDom(create_div);
    create_form.renderDocument();
    create_form.addEventListener('app_form_change', util.bind(this.handleAfterChange, this));
  }

  var list_div = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_form = new app_form.List.BandMember(data, this.model.band_admin);
  list_form.createDom(list_div);
  list_form.renderDocument();
  list_form.addEventListener('app_form_change', util.bind(this.handleAfterChange, this));
};

/*
app_context.BandMember.prototype.handleAddSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    person_id: form.querySelector('[name="person_id"]').value
  };

  this.service = new service.generic(
    './band_member',
    util.bind(this.handleAdd, this)
  );

  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.BandMember.prototype.handleNewSubmit = function(e) {
  var form = e.target;
  var data = {
    name: form.querySelector('[name="name"]').value,
    full_name: form.querySelector('[name="full_name"]').value
  };

  this.service = new service.generic(
    './create_person', 
    util.bind(this.handleAdd, this)
  );

  this.service.set(data);
  e.preventDefault();
  return false;
};
*/

app_context.BandMember.prototype.otherChangeTabs = function() {
  return ['band_songs'];
};

/*
app_context.BandMember.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var member_id = row.attributes.item('member_id').value;
  var member = this.model.band_members.filter(function (mem) { return mem.id == member_id })[0];

  var confirm_delete = new dialog('Remove ' + member.full_name + ' from ' + this.model.band.name + '?');
  confirm_delete.show(util.bind(function(result) {
    if (result) {
      var url = './band_member?person_id=' + member_id + '&band_id=' + this.model.band.id;
      this.service = new service.generic(
        url,
        util.bind(this.handleAfterChange, this)
      );
      this.service.delete();
    } else {
      this.handleAfterChange();
    }
  }, this));

  return true;
};
*/

// Artist App Object
app_context.Artist = function() {
  this.tab_id = 'artists';
  this.tab_text = 'Artists';
  this.url = './artist';
  this.template = 'artists';
  app_context.Base(this);
};

app_context.Artist.prototype = new app_context.Base();

app_context.Artist.prototype.getDrawUrl = function() {
  return this.url + '?band_id=' + util.getBandId();
};

app_context.Artist.prototype.getContextArgs = function() {
  this.model.band_admin = this.model.band_admin || this.model.system_admin

  return {
    sections: {creator: this.model.band_admin, display: 1},
    tab_id: this.tab_id
  }
};

app_context.Artist.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  if (this.model.band_admin) {
    var creator = document.querySelector('#' + this.tab_id + ' .creator');
    var creator_text = Templates['artist/creator'](this.model);
    util.appendTextElement(creator, creator_text);
  }

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['artist/display'](this.model);
  util.appendTextElement(display, display_text);

  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['artist/display/list'](this.model);
  util.appendTextElement(list, list_text);

  if (this.model.band_admin) {
    var form = document.querySelector('#' + this.tab_id + ' .creator form');
    form.addEventListener('submit', util.bind(this.handleCreateSubmit, this));
  }

  if (this.model.system_admin) {
    var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
    var button_handler = util.bind(this.handleDelete, this);

    for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
      delete_buttons[button_idx].addEventListener('click', button_handler);
    }
  }
};

app_context.Artist.prototype.handleCreateSubmit = function(e) {
  var form = e.target;
  var data = {
    name: form.firstChild.value
  };

  this.service = new service.generic(
    './artist',
    util.bind(this.handleAdd, this)
  );

  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.Artist.prototype.otherChangeTabs = function() {
  return ['band_songs'];
};

app_context.Artist.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var artist_id = row.attributes.item('artist_id').value;
  var artist = this.model.artists.filter(function (art) { return art.id == artist_id })[0];

  var confirm_delete = new dialog('Remove ' + artist.name + '?');
  confirm_delete.show(util.bind(function(result) {
    if (result) {
      var url = './artist?artist_id=' + artist_id;
      this.service = new service.generic(
        url,
        util.bind(this.handleAfterChange, this)
      );
      this.service.delete();
    } else {
      this.handleAfterChange();
    }
  }, this));

  return true;
};

// BandSong App Object
app_context.BandSong = function() {
  this.tab_id = 'band_songs';
  this.tab_text = 'Songs';
  this.url = './band_song';
  this.template = 'songs';
  this.context = null;
  this.model = null;
  app_context.Base(this);
};

app_context.BandSong.prototype = new app_context.Base();

app_context.BandSong.prototype.getDrawUrl = function() {
  var sort_selector = document.querySelector('#' + this.tab_id + ' .app_context_item .display .filters [name="sort_type"]');
  
  var service_url = this.url + '?band_id=' + util.getBandId() + '&sort_type=';
  service_url += sort_selector ? sort_selector.value : 'song_name';

  var filters = {};
  var song_filter = document.querySelector('#' + this.tab_id + ' .app_context_item .display .filters [name="song_filter"]');
  if (song_filter && song_filter.value) {
    filters.song_name = song_filter.value;
  }
  
  var artist_filter = document.querySelector('#' + this.tab_id + ' .app_context_item .display .filters [name="artist_filter"]');
  if (artist_filter && artist_filter.value > 0) {
    filters.artist_id = artist_filter.value;
  }
  
  return service_url + '&filters=' + JSON.stringify(filters);
};

app_context.BandSong.prototype.getContextArgs = function() {
  this.model.band_admin = this.model.band_admin || this.model.system_admin;

  return {
    sections: {creator: this.model.band_admin, display: 1},
    tab_id: this.tab_id
  };
};

app_context.BandSong.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  if (this.model.band_admin) {
    var creator = document.querySelector('#' + this.tab_id + ' .creator');
    var creator_text = Templates['song/creator'](this.model);
    util.appendTextElement(creator, creator_text);
  }

  var display = document.querySelector('#' + this.tab_id + ' .display');
  var display_text = Templates['song/display'](this.model);
  util.appendTextElement(display, display_text);

  var filters = document.querySelector('#' + this.tab_id + ' .display .filters');
  var filter_text = Templates['song/display/filters'](this.model);
  util.appendTextElement(filters, filter_text);

  var sort_selector = filters.querySelector('[name="sort_type"]');
  sort_selector.addEventListener('change', util.bind(function() { this.redraw(); }, this));
  sort_selector.value = this.model.sort_type;
  
  var song_filter = filters.querySelector('[name="song_filter"]');
  song_filter.addEventListener('change', util.bind(function() { this.redraw(); }, this));
  song_filter.value = this.model.filters.song_name ? this.model.filters.song_name : null;
  
  var artist_filter = filters.querySelector('[name="artist_filter"]');
  artist_filter.addEventListener('change', util.bind(function() { this.redraw(); }, this));
  artist_filter.value = this.model.filters.artist_id ? this.model.filters.artist_id : -1;
  
  var list = document.querySelector('#' + this.tab_id + ' .display .list');
  var list_text = Templates['song/display/list'](this.model);
  util.appendTextElement(list, list_text);
  
  this.model.band_songs.forEach(function(band_song) {
    var rating = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_rating"]');
    rating.value = band_song.rating;
    rating.addEventListener('change', util.bind(this.ratingChangeHandler, this));

    var status = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] td select[name="song_status"]');
    status.value = band_song.song_status;
    if (this.model.band_admin) {
      status.addEventListener('change', util.bind(this.statusChangeHandler, this));
    } else {
      status.disabled = true;
    }

    var avg_rating = document.querySelector('tr[band_song_id="' + band_song.band_song_id + '"] [name="avg_rating"] div');
    var max_width = 100;
    avg_rating.style.overflow = 'hidden';
    avg_rating.style.width = parseInt(max_width * (band_song.avg_rating / 5)) + 'px';
  }, this);

  //XXX Why is this here?
  var anchor = this.context.querySelector('a');
  anchor.addEventListener('click', function(e) { 
    return false;
  });

  if (this.model.band_admin) {
    var add_form = document.querySelector('#' + this.tab_id + ' .creator div.add form');
    add_form.addEventListener('submit', util.bind(this.handleAddSubmit, this));

    var new_form = document.querySelector('#' + this.tab_id + ' .creator div.new form');
    new_form.addEventListener('submit', util.bind(this.handleNewSubmit, this));

    var delete_buttons = document.querySelectorAll('#' + this.tab_id + ' .display .list td.delete');
    var button_handler = util.bind(this.handleDelete, this);

    for(var button_idx = 0; button_idx < delete_buttons.length; button_idx++) {
      delete_buttons[button_idx].addEventListener('click', button_handler);
    }
  }
};

app_context.BandSong.prototype.handleAddSubmit = function(e) {
  var form = e.target;
  var data = {
    band_id: form.querySelector('[name="band_id"]').value,
    song_id: form.querySelector('[name="song_id"]').value
  };

  this.service = new service.generic(
    './band_song',
    util.bind(this.handleAdd, this)
  );

  this.service.set(data);
  e.preventDefault();
  return false;
};

app_context.BandSong.prototype.handleNewSubmit = function(e) {
  var form = e.target;
  var data = {
    name: form.querySelector('[name="song_name"]').value,
    artist_id: form.querySelector('[name="artist_id"]').value
  };

  this.service = new service.generic(
    './song',
    util.bind(this.handleAdd, this)
  );

  this.service.set(data);
  e.preventDefault();
  return false;
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
  this.service = new service.generic(
    './song_rating',
    util.bind(function(data) { 
      this.redraw();
    }, this)
  );
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
  this.service = new service.generic(
    './song_status',
    function(data) {
      var row = document.querySelector('#band_songs .list tr[band_song_id="' + data.band_song_id + '"]');
      var input = row.querySelector('select[name="song_status"]');
      input.value = data.song_status;
      input.disabled = false;
    }
  );
  this.service.set(data);
  return true;
};

app_context.BandSong.prototype.handleDelete = function(e) {
  window.console.log("Do the delete?" + e);

  var row = e.target.parentElement;
  var band_song_id = row.attributes.item('band_song_id').value;
  var band_song = this.model.band_songs.filter(function (song) { return song.band_song_id == band_song_id })[0];

  var confirm_delete = new dialog('Remove ' + band_song.name + '?');
  confirm_delete.show(util.bind(function(result) {
    if (result) {
      var url = './band_song?band_song_id=' + band_song_id;
      this.service = new service.generic(
        url,
        util.bind(this.handleAfterChange, this)
      );
      this.service.delete();
    } else {
      this.handleAfterChange();
    }
  }, this));

  return true;
};
