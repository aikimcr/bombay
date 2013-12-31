function Song(id, name, artist_id) {
  Table.call(this, './song');
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');
  this.artist_id = ko.observable(artist_id || -1);

  this.artist = ko.computed(function() {
    return manager.artists.getById(this.artist_id()) || new Artist();
  }.bind(this));

  this.band_songs = ko.computed(function() {
    return manager.band_songs.filterByKey('song_id', this.id());
  }.bind(this));

  this.description = ko.computed(function () {
    if (!this.name() || !this.artist()) { return ''; }
    return this.name() + ' by ' + this.artist().name();
  }.bind(this));

  this.bands = ko.computed(function () {
    return ko.utils.arrayMap(this.band_songs(), function(band_song) {
      return band_song.band();
    }.bind(this));
  }.bind(this));

  this.band_count = ko.computed(function () {
    return this.bands().length;
  }.bind(this));
}
util.inherits(Song, Table);

Song.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./song?id=' + id, function(result) {
    callback(new Song(result.song.id, result.song.name, result.song.artist_id));
  });
};

Song.prototype.confirm_text = function() {
  return 'Delete song ' + this.name() + ' by ' + this.artist().name() + '?';
};

Song.prototype.reload_list = function() {
  manager.songs.load();
};

// The Song List Object
function SongList() {
  TableList.call(this, './song', 'all_songs');
}
util.inherits(SongList, TableList);

SongList.prototype.set_sort_compare_list = function() {
  this.sort_type('name_asc');
  this.sort_compare_list = {
    'name_asc': function(a, b) {
      if (a.name() < b.name()) return -1;
      if (a.name() > b.name()) return 1;
      if (a.artist().name() < b.artist().name()) return -1;
      if (a.artist().name() > b.artist().name()) return 1;
      return 0;
    },
    'name_desc': function(a, b) {
      if (a.name() > b.name()) return -1;
      if (a.name() < b.name()) return 1;
      if (a.artist().name() > b.artist().name()) return -1;
      if (a.artist().name() < b.artist().name()) return 1;
      return 0;
    },
    'artist_name_asc': function(a, b) {
      if (a.artist().name() < b.artist().name()) return -1;
      if (a.artist().name() > b.artist().name()) return 1;
      if (a.name() < b.name()) return -1;
      if (a.name() > b.name()) return 1;
      return 0;
    },
    'artist_name_desc': function(a, b) {
      if (a.artist().name() > b.artist().name()) return -1;
      if (a.artist().name() < b.artist().name()) return 1;
      if (a.name() > b.name()) return -1;
      if (a.name() < b.name()) return 1;
      return 0;
    }
  };

  this.sort_compare_labels = [{
    value: 'name_asc', label: 'Name (A-Z)',
  }, {
    value: 'name_desc', label: 'Name (Z-A)'
  }, {
    value: 'artist_name_asc', label: 'Artist Name (A-Z)'
  }, {
    value: 'artist_name_desc', label: 'Artist Name (Z-A)'
  }];
};

SongList.prototype.set_filter_list = function() {
  this.filter_values = {
    name: ko.observable(''),
    artist_name: ko.observable('')
  };

  this.filter_list = {
    'name': function(item) {
      if (this.filter_values['name']() == '') return true;
      return item.name().toLowerCase().match(this.filter_values['name']().toLowerCase());
    }.bind(this),
    'artist_name': function(item) {
      if (this.filter_values['artist_name']() == '') return true;
      return item.artist().name().toLowerCase().match(this.filter_values['artist_name']().toLowerCase());
    }.bind(this)
  };

  this.filter_order = ['name', 'artist_name'];
};

SongList.prototype.build_object_ = function(model) {
  return new Song(model.id, model.name, model.artist_id);
};
