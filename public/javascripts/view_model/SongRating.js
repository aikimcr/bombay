function SongRating(id, band_member_id, band_song_id, rating) {
  this.super.call(this);
  this.id = ko.observable(id);
  this.band_member_id = ko.observable(band_member_id);
  this.band_song_id = ko.observable(band_song_id);
  this.rating = ko.observable(rating);
}
util.inherits(SongRating, Table);

SongRating.service_url = './song_rating';
SongRating.model_key = 'song_rating';
SongRating.columns = ['band_member_id', 'band_song_id', 'rating'];
SongRating.list_key = 'song_ratings';

// The SongRating List Object
function SongRatingList() {
  this.super.call(this, SongRating);
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
