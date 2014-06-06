function BandSong(id, band_id, song_id, song_status, key_signature) {
  Table.call(this, './band_song');
  this.id = ko.observable(id || -1);
  this.band_id = ko.observable(band_id || -1);
  this.song_id = ko.observable(song_id || -1);
  this.song_status = ko.observable(song_status);
  this.key_signature = ko.observable(key_signature || '');

  // Joins
  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id()) || new Band();
  }.bind(this)).extend({throttle: 250});

  this.song = ko.computed(function() {
    return manager.songs.getById(this.song_id()) || new Song();
  }.bind(this)).extend({throttle: 250});

  this.song_ratings = ko.computed(function() {
    return manager.song_ratings.filterByKey('band_song_id', this.id());
  }.bind(this)).extend({throttle: 250});

  // Calculations
  this.member_rating = ko.computed({
    read: function() {
      var ratings = this.song_ratings();
      if (ratings.length == 0) {
        return '**no ratings**';
      } else {
        var member_rating = ko.utils.arrayFirst(ratings, function(rating) {
          return rating.band_member_id() == manager.current_band_member().id();
        }.bind(this));
        if (member_rating) {
          return member_rating.rating();
        } else {
          return '**unrated**';
        }
      }
    }.bind(this),
    write: function(value) {
      var ratings = this.song_ratings();
      var member_rating = ko.utils.arrayFirst(ratings, function(rating) {
        return rating.band_member_id() == manager.current_band_member().id();
      }.bind(this));
      member_rating.update({id: this.id, rating: value}, function(result) {
        if (result && !result.err) {
          this.refresh(function(result) {
            if (result.err) {
              window.console.log(result.err);
            }
          });
        }
      }.bind(member_rating));
      member_rating.rating(value);
    }.bind(this)
  }).extend({throttle: 250});

  this.average_rating = ko.computed(function () {
    var ratings = this.song_ratings();
    if (ratings.length == 0) {
      return '**no ratings**';
    }
    var rating_sum = 0;
    ratings.forEach(function(rating) {
      rating_sum += rating.rating();
    });

    return rating_sum / ratings.length;
  }.bind(this)).extend({throttle: 250});
}
util.inherits(BandSong, Table);

BandSong.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./band_song?id=' + id, function(result) {
    callback(new BandSong(
      result.band_song.id,
      result.band_song.band_id,
      result.band_song.song_id,
      result.band_song.song_status
    ));
  });
};

BandSong.prototype.refresh = function(callback) {
  var svc = service.getInstance();
  svc.get('./band_song?id=' + this.id(), function(result) {
    if (result.err) {
      callback(result);
    } else {
      if (this.band_id() != result.band_song.band_id) this.band_id(result.band_song.band_id);
      if (this.song_id() != result.band_song.song_id) this.song_id(result.band_song.song_id);
      if (this.song_status() != result.band_song.song_status) this.song_status(result.band_song.song_status);
      callback({});
    }
  }.bind(this));
};

BandSong.prototype.confirm_text = function() {
  return 'Remove song ' + this.song().name() + ' from ' + this.band().name() + '?';
};

BandSong.prototype.reload_list = function() {
  manager.band_songs.load();
};

BandSong.prototype.reload_relatives = function() {
  manager.song_ratings.load();
};

// The BandSong List Object
function BandSongList() {
  TableList.call(this, './band_song', 'all_band_songs');
  this.sort_type('name_asc');
}
util.inherits(BandSongList, TableList);

BandSongList.prototype.set_sort_compare_list = function() {
  this.sort_type('song_name_asc');
  this.sort_compare_list = {
    'song_name_asc': function(a, b) {
      if (a.song().name() < b.song().name()) return -1;
      if (a.song().name() > b.song().name()) return 1;
      if (a.song().artist().name() < b.song().artist().name()) return -1;
      if (a.song().artist().name() > b.song().artist().name()) return 1;
      return 0;
    },
    'song_name_desc': function(a, b) {
      if (a.song().name() > b.song().name()) return -1;
      if (a.song().name() < b.song().name()) return 1;
      if (a.song().artist().name() > b.song().artist().name()) return -1;
      if (a.song().artist().name() < b.song().artist().name()) return 1;
      return 0;
    },
    'artist_name_asc': function(a, b) {
      if (a.song().artist().name() < b.song().artist().name()) return -1;
      if (a.song().artist().name() > b.song().artist().name()) return 1;
      if (a.song().name() < b.song().name()) return -1;
      if (a.song().name() > b.song().name()) return 1;
      return 0;
    },
    'artist_name_desc': function(a, b) {
      if (a.song().artist().name() > b.song().artist().name()) return -1;
      if (a.song().artist().name() < b.song().artist().name()) return 1;
      if (a.song().name() > b.song().name()) return -1;
      if (a.song().name() < b.song().name()) return 1;
      return 0;
    },
    'average_rating_asc': function(a, b) {
      if (a.average_rating() < b.average_rating()) return -1;
      if (a.average_rating() > b.average_rating()) return 1;
      if (a.member_rating() < b.member_rating()) return -1;
      if (a.member_rating() > b.member_rating()) return 1;
      return this.sort_compare_list['song_name_asc'](a, b);
    }.bind(this),
    'average_rating_desc': function(a, b) {
      if (a.average_rating() > b.average_rating()) return -1;
      if (a.average_rating() < b.average_rating()) return 1;
      if (a.member_rating() > b.member_rating()) return -1;
      if (a.member_rating() < b.member_rating()) return 1;
      return this.sort_compare_list['song_name_desc'](a, b);
    }.bind(this),
  };

  this.sort_compare_labels = [{
    value: 'song_name_asc', label: 'Song Name (A-Z)'
  }, {
    value: 'song_name_desc', label: 'Song Name (Z-A)'
  }, {
    value: 'artist_name_asc', label: 'Artist Name (A-Z)'
  }, {
    value: 'artist_name_desc', label: 'Artist Name (Z-A)'
  }, {
    value: 'average_rating_asc', label: 'Average Rating (Low to High)'
  }, {
    value: 'average_rating_desc', label: 'Average Rating (High to Low)'
  }];
};

BandSongList.prototype.set_filter_list = function() {
  this.filter_values = {
    'song_name': ko.observable(''),
    'artist_id': ko.observable(null),
    'average_rating': ko.observable(null)
  };

  this.filter_list = {
    'song_name': function(item) {
      if (this.filter_values.song_name() == '') return true;
      return item.song().name().toLowerCase().match(this.filter_values.song_name().toLowerCase());
    }.bind(this),
    'artist_id': function(item) {
      if (this.filter_values.artist_id() == null) return true;
      return item.song().artist_id() == this.filter_values.artist_id();
    }.bind(this),
    'average_rating': function(item) {
      if (this.filter_values.average_rating() == null) return true;
      return item.average_rating() == this.filter_values.average_rating();
    }.bind(this)
  };

  this.filter_order = ['song_name', 'artist_id', 'average_rating'];
};

BandSongList.prototype.build_object_ = function(model) {
  return new BandSong(
    model.id,
    model.band_id,
    model.song_id,
    model.song_status,
    model.key_signature
  );
};

