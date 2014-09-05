function Song(id, name, artist_id, key_signature) {
  this.super.call(this, './song');
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');
  this.artist_id = ko.observable(artist_id || -1);
  this.key_signature = ko.observable(key_signature || '');

  this.artist = ko.computed(function() {
    return manager.artists.getById(this.artist_id()) || new Artist();
  }.bind(this)).extend({throttle: 50});

  this.band_songs = ko.computed(function() {
    return manager.band_songs.filterByKey('song_id', this.id());
  }.bind(this)).extend({throttle: 50});

  this.description = ko.computed(function () {
    if (!this.name() || !this.artist()) { return ''; }
    return this.name() + ' by ' + this.artist().name();
  }.bind(this)).extend({throttle: 50});

  this.bands = ko.computed(function () {
    return ko.utils.arrayMap(this.band_songs(), function(band_song) {
      return band_song.band();
    }.bind(this));
  }.bind(this)).extend({throttle: 50});

  this.band_count = ko.computed(function () {
    return this.bands().length;
  }.bind(this)).extend({throttle: 50});
}
util.inherits(Song, Table);

Song.service_url = './song';
Song.model_key = 'song';
Song.columns = ['name', 'artist_id', 'key_signature'];
Song.list_key = 'songs';

Song.prototype.confirm_text = function() {
  return 'Delete song ' + this.name() + ' by ' + this.artist().name() + '?';
};

// The Song List Object
function SongList() {
  this.super.call(this, Song);
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
    artist_id: ko.observable(null),
    minimum_band_count: ko.observable(null),
    maximum_band_count: ko.observable(null)
  };

  this.filter_list = {
    'name': function(item) {
      if (this.filter_values['name']() == '') return true;
      return item.name().toLowerCase().match(this.filter_values['name']().toLowerCase());
    }.bind(this),
    'artist_id': function(item) {
      if (this.filter_values.artist_id() == null) return true;
      return item.artist_id() == this.filter_values.artist_id();
    }.bind(this),
    'minimum_band_count': function(item) {
      var count = parseInt(this.filter_values.minimum_band_count(), 10);
      if (isNaN(count)) return true;
      return item.band_count() >= count;
    }.bind(this),
    'maximum_band_count': function(item) {
      var count = parseInt(this.filter_values.maximum_band_count(), 10);
      if (isNaN(count)) return true;
      return item.band_count() <= count;
    }.bind(this)
  };

  this.filter_order = ['name', 'artist_id', 'minimum_band_count', 'maximum_band_count'];
};

SongList.prototype.build_object_ = function(model) {
  return new Song(model.id, model.name, model.artist_id, model.key_signature);
};
