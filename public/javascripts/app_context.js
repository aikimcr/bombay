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
  service.getInstance().get(service_url, this.handleAPIReturn.bind(this));
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
  return {sections: {edit_form: 1}};
};

app_context.Person.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  var edit_div = document.querySelector('#' + this.tab_id + ' .edit_form');
  this.edit_form = new app_form.Editor.PersonEdit(this.model, true);
  this.edit_form.render(edit_div);
  this.edit_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
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
  this.add_form = new app_form.Editor.BandJoin(this.model, true);
  this.add_form.render(add_div);
  this.add_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));

  var create_div = document.querySelector('#' + this.tab_id + ' .editor .new');
  this.create_form = new app_form.Editor.BandCreator(this.model, true);
  this.create_form.render(create_div);
  this.create_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));

  var list_div = document.querySelector('#' + this.tab_id + ' .display .list');
  this.list_form = new app_form.List.Band(this.model, true);
  this.list_form.render(list_div);
  this.list_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));

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
  return {
    sections: {multiedit: this.model.band_admin, display: true},
    tab_id: this.tab_id
  };
};

app_context.BandMember.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  if (this.model.band_admin) {
    var add_div = document.querySelector('#' + this.tab_id + ' .editor .add');
    this.add_form = new app_form.Editor.BandMemberAdd(this.model, this.model.band_admin);
    this.add_form.render(add_div);
    this.add_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));

    var create_div = document.querySelector('#' + this.tab_id + ' .editor .new');
    this.create_form = new app_form.Editor.BandMemberNew(this.model, this.model.band_admin);
    this.create_form.render(create_div);
    this.create_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
  }

  var list_div = document.querySelector('#' + this.tab_id + ' .display .list');
  this.list_form = new app_form.List.BandMember(this.model, this.model.band_admin);
  this.list_form.render(list_div);
  this.list_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
};

app_context.BandMember.prototype.otherChangeTabs = function() {
  return ['band_songs'];
};

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
  return {
    sections: {creator: this.model.band_admin, display: 1},
    tab_id: this.tab_id
  }
};

app_context.Artist.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  if (this.model.band_admin) {
    var create_div = document.querySelector('#' + this.tab_id + ' .creator .new');
    this.create_form = new app_form.Editor.ArtistNew(this.model, this.model.band_admin);
    this.create_form.render(create_div);
    this.create_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
  }

  var list_div = document.querySelector('#' + this.tab_id + ' .display .list');
  this.list_form = new app_form.List.Artist(this.model, this.model.band_admin);
  this.list_form.render(list_div);
  this.list_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
};

app_context.Artist.prototype.otherChangeTabs = function() {
  return ['band_songs'];
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
  var filter_form = this.filter_form;
  var filter_query = filter_form ? filter_form.getFilterQuery() : 'sort_type=song_name&filters=' + JSON.stringify({});
  return this.url + '?band_id=' + util.getBandId() + '&' + filter_query;
};

app_context.BandSong.prototype.getContextArgs = function() {
  return {
    sections: {multiedit: this.model.band_admin, display: 1},
    tab_id: this.tab_id
  };
};

app_context.BandSong.prototype.handleAPIReturn = function(data) {
  app_context.Base.prototype.handleAPIReturn.call(this, data);

  if (this.model.band_admin) {
    var add_div = document.querySelector('#' + this.tab_id + ' .editor .add');
    this.add_form = new app_form.Editor.BandSongAdd(this.model, this.model.band_admin);
    this.add_form.render(add_div);
    this.add_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));

    var new_div = document.querySelector('#' + this.tab_id + ' .editor .new');
    this.new_form = new app_form.Editor.BandSongNew(this.model, this.model.band_admin);
    this.new_form.render(new_div);
    this.new_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
  }

  var filter_div = document.querySelector('#' + this.tab_id + ' .display .filters');
  this.filter_form = new app_form.Filters.BandSong(this.model, false);
  this.filter_form.render(filter_div);
  this.filter_form.addEventListener('app_filter_change', this.handleAfterChange.bind(this));

  var list_div = document.querySelector('#' + this.tab_id + ' .display .list');
  this.list_form = new app_form.List.BandSong(this.model, this.model.band_admin);
  this.list_form.render(list_div);
  this.list_form.addEventListener('app_form_change', this.handleAfterChange.bind(this));
};
