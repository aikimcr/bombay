function SongRating(id, band_member_id, band_song_id, rating) {
  this.id = ko.observable(id);
  this.band_member_id = ko.observable(band_member_id);
  this.band_song_id = ko.observable(band_song_id);
  this.song_rating = ko.observable(rating);

/*
  this.band_member_name = ko.computed(function () {
    return manager.getById(manager.people, this.band_member_id()).full_name();
  }.bind(this));
*/
}
util.inherits(SongRating, Table);

SongRating.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./song_rating?id=' + id, function(result) {
    callback(new SongRating(
      result.song_rating.id,
      result.song_rating.band_member_id,
      result.song_rating.band_song_id,
      result.song_rating.song_rating
    ));
  });
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
    model.song_rating
  );
};
