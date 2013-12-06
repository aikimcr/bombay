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

SongList.prototype.build_object_ = function(model) {
  return new Song(model.id, model.name, model.artist_id);
};
