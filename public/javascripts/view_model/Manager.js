var manager;

function Manager() {
  manager = this;

  var bands = new BandList();
  var persons = new PersonList();
  var artists = new ArtistList();
  var songs = new SongList();
  var band_members = new BandMemberList();
  var band_songs = new BandSongList();
  var song_ratings = new SongRatingList();

}

function app_start() {
  ko.applyBindings(new Manager());
}
