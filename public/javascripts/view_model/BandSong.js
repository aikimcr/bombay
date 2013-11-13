function BandSong(id, band_id, song_id, status) {
  this.id = ko.observable(id);
  this.band_id = ko.observable(band_id);
  this.song_id = ko.observable(song_id);
  this.status = ko.observable(status);

/*
  // Joins
  this.band = ko.computed(function () {
    return manager.getById(manager.bands, this.band_id());
  }.bind(this));
  this.song = ko.computed(function () {
    return manager.getById(manager.songs, this.song_id());
  }.bind(this));
  this.song_ratings = ko.computed(function () {
    return ko.utils.arrayFilter(manager.song_ratings(), function (rating) {
      return rating.band_song_id() == this.id();
    }.bind(this));
  }.bind(this));

  // Calculations
  this.member_rating = ko.computed(function () {
    var ratings = this.song_ratings();
    if (ratings.length == 0) {
      return '**no ratings**';
    } else {
      var member_rating = ko.utils.arrayFirst(ratings, function(rating) {
        return rating.person_id() == manager.current_person().id();
      }.bind(this));
      if (member_rating) {
        return member_rating.song_rating();
      } else {
        return '**unrated**';
      }
    }
  }.bind(this));

  this.average_rating = ko.computed(function () {
    var ratings = this.song_ratings();
    if (ratings.length == 0) {
      return '**no ratings**';
    }
    var rating_sum = 0;
    ratings.forEach(function(rating) {
      rating_sum += rating.song_rating();
    });

    return rating_sum / ratings.length;
  }.bind(this));

  // Additional Add logic
  ko.utils.arrayForEach(this.band().band_members(), function(band_member) {
    manager.addSongRatingWithArgs(band_member.person_id(), this.id());
  }.bind(this));
*/
}
util.inherits(BandSong, Table);

BandSong.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./band_song?id=' + id, function(result) {
    callback(new BandSong(
      result.band_song.id,
      result.band_song.band_id,
      result.band_song.song_id,
      result.band_song.status
    ));
  });
};

// The BandSong List Object
function BandSongList() {
  TableList.call(this, './band_song', 'all_band_songs');
}
util.inherits(BandSongList, TableList);

BandSongList.prototype.build_object_ = function(model) {
  return new BandSong(
    model.id,
    model.band_id,
    model.song_id,
    model.status
  );
};

