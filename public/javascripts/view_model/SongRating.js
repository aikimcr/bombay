function SongRating(id, band_member_id, band_song_id, rating) {
  Table.call(this, './song_rating');
  this.id = ko.observable(id);
  this.band_member_id = ko.observable(band_member_id);
  this.band_song_id = ko.observable(band_song_id);
  this.rating = ko.observable(rating);
}
util.inherits(SongRating, Table);

SongRating.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./song_rating?id=' + id, function(result) {
    callback(new SongRating(
      result.song_rating.id,
      result.song_rating.band_member_id,
      result.song_rating.band_song_id,
      result.song_rating.rating
    ));
  });
};

SongRating.prototype.refresh = function(callback) {
  var svc = service.getInstance();
  svc.get('./song_rating?id=' + this.id(), function(result) {
    if (result.err) {
      callback(result);
    } else {
      this.band_member_id(result.song_rating.band_member_id);
      this.band_song_id(result.song_rating.band_song_id);
      this.rating(result.song_rating.rating);
      callback({});
    }
  }.bind(this));
};

// The SongRating List Object
function SongRatingList() {
  TableList.call(this, './song_rating', 'all_song_ratings');
}
util.inherits(SongRatingList, TableList);

SongRatingList.prototype.build_object_ = function(model) {
  return new SongRating(
    model.id,
    model.band_member_id,
    model.band_song_id,
    model.rating
  );
};
