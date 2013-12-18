function BandSong(id, band_id, song_id, status) {
  Table.call(this, './band_song');
  this.id = ko.observable(id || -1);
  this.band_id = ko.observable(band_id || -1);
  this.song_id = ko.observable(song_id || -1);
  this.status = ko.observable(status);

  // Joins
  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id()) || new Band();
  }.bind(this));

  this.song = ko.computed(function() {
    return manager.songs.getById(this.song_id()) || new Song();
  }.bind(this));

  this.song_ratings = ko.computed(function() {
    return manager.song_ratings.filterByKey('band_song_id', this.id());
  }.bind(this));

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
          this.reload_list();
        }
      }.bind(this));
      member_rating.rating(value);
    }.bind(this)
  });

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
  }.bind(this));
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

BandSong.prototype.confirm_text = function() {
  return 'Remove song ' + this.song().name() + ' from ' + this.band().name() + '?';
};

BandSong.prototype.reload_list = function() {
  manager.band_songs.load();
  manager.song_ratings.load();
};

// The BandSong List Object
function BandSongList() {
  TableList.call(this, './band_song', 'all_band_songs');
  this.sort_type('name_asc');
}
util.inherits(BandSongList, TableList);

BandSongList.prototype.set_sort_compare_list = function() {
  return {
    'name_asc': function(a, b) {
      if (a.song().name() < b.song().name()) return -1;
      if (a.song().name() > b.song().name()) return 1;
      if (a.song().artist().name() < b.song().artist().name()) return -1;
      if (a.song().artist().name() > b.song().artist().name()) return 1;
      return 0;
    },
    'name_desc': function(a, b) {
      if (a.song().name() > b.song().name()) return -1;
      if (a.song().name() < b.song().name()) return 1;
      if (a.song().artist().name() > b.song().artist().name()) return -1;
      if (a.song().artist().name() < b.song().artist().name()) return 1;
      return 0;
    },
    'artist_asc': function(a, b) {
      if (a.song().artist().name() < b.song().artist().name()) return -1;
      if (a.song().artist().name() > b.song().artist().name()) return 1;
      if (a.song().name() < b.song().name()) return -1;
      if (a.song().name() > b.song().name()) return 1;
      return 0;
    },
    'artist_desc': function(a, b) {
      if (a.song().artist().name() > b.song().artist().name()) return -1;
      if (a.song().artist().name() < b.song().artist().name()) return 1;
      if (a.song().name() > b.song().name()) return -1;
      if (a.song().name() < b.song().name()) return 1;
      return 0;
    },
    'rating_asc': function(a, b) {
      if (a.member_rating() < b.member_rating()) return -1;
      if (a.member_rating() > b.member_rating()) return 1;
      return this.sort_compare_list['name_asc'](a, b);
    }.bind(this),
    'rating_desc': function(a, b) {
      if (a.member_rating() > b.member_rating()) return -1;
      if (a.member_rating() < b.member_rating()) return 1;
      return this.sort_compare_list['name_desc'](a, b);
    }.bind(this),
  };
};

BandSongList.prototype.set_filter_list = function() {
  return [
    function(item) {
      if (!manager.current_band) return false;
      return item.band_id() == manager.current_band().id();
    },
  ];
};

BandSongList.prototype.build_object_ = function(model) {
  return new BandSong(
    model.id,
    model.band_id,
    model.song_id,
    model.song_status
  );
};

