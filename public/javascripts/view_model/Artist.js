function Artist(id, name) {
  this.super.call(this);
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');

  this.songs = ko.computed(function() {
    return manager.songs.filterByKey('artist_id', this.id());
  }.bind(this)).extend({throttle: 50});

  this.song_count = ko.computed(function() {
    return this.songs().length;
  }.bind(this)).extend({throttle: 50});
}
util.inherits(Artist, Table);

Artist.service_url = './artist';
Artist.model_key = 'artist';
Artist.columns = ['name'];
Artist.list_key = 'artists';

Artist.prototype.confirm_text = function() {
  return 'Delete artist ' + this.name() + '?';
};

// The Artist List Object
function ArtistList() {
  this.super.call(this, Artist);
}
util.inherits(ArtistList, TableList);

ArtistList.prototype.set_sort_compare_list = function() {
  this.sort_type('name_asc');
  this.sort_compare_list = {
    'name_asc': function(a, b) {
      if (a.name() < b.name()) return -1;
      if (a.name() > b.name()) return 1;
      return 0;
    },
    'name_desc': function(a, b) {
      if (a.name() > b.name()) return -1;
      if (a.name() < b.name()) return 1;
      return 0;
    },
  };

  this.sort_compare_labels = [{
    value: 'name_asc', label: 'Name (A-Z)',
  }, {
    value: 'name_desc', label: 'Name (Z-A)'
  }];
};

ArtistList.prototype.set_filter_list = function() {
  this.filter_values = {
    'name': ko.observable(''),
    'minimum_song_count': ko.observable(0),
    'maximum_song_count': ko.observable(null)
  };

  this.filter_list = {
    'name': function(item) {
      if (this.filter_values.name() == '') return true;
      return item.name().toLowerCase().match(this.filter_values.name().toLowerCase());
    }.bind(this),
    'minimum_song_count': function(item) {
      var count = parseInt(this.filter_values.minimum_song_count(), 10);
      if (isNaN(count)) return true;
      return item.song_count() >= count;
    }.bind(this),
    'maximum_song_count': function(item) {
      var count = parseInt(this.filter_values.maximum_song_count(), 10);
      if (isNaN(count)) return true;
      return item.song_count() <= count;
    }.bind(this)
  };

  this.filter_order = ['name', 'minimum_song_count', 'maximum_song_count'];
};

ArtistList.prototype.build_object_ = function(model) {
  return new Artist(model.id, model.name);
};
