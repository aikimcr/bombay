function Artist(id, name) {
  Table.call(this, './artist');
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');

  this.songs = ko.computed(function() {
    return manager.songs.filterByKey('artist_id', this.id());
  }.bind(this));
  this.song_count = ko.computed(function() {
    return this.songs().length;
  }.bind(this));
}
util.inherits(Artist, Table);

Artist.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./artist?id=' + id, function(result) {
    callback(new Artist(result.artist.id, result.artist.name));
  });
};

Artist.prototype.confirm_text = function() {
  return 'Delete artist ' + this.name() + '?';
};

Artist.prototype.reload_list = function() {
  manager.artists.load();
};

// The Artist List Object
function ArtistList() {
  TableList.call(this, './artist', 'all_artists');
}
util.inherits(ArtistList, TableList);

ArtistList.prototype.build_object_ = function(model) {
  return new Artist(model.id, model.name);
};
