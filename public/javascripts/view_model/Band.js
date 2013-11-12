// The Individual Band Objects
function Band(id, name) {
  Table.call(this);
  this.id = ko.observable(id);
  this.name = ko.observable(name);

/*
  this.band_members = ko.computed(function () {
    return ko.utils.arrayFilter(manager.band_members(), function(band_member) {
      return band_member.band_id() == this.id();
    }.bind(this));
  }.bind(this));
  this.band_member_count = ko.computed(function () {
    return this.band_members().length;
  }.bind(this));
  this.band_songs = ko.computed(function () {
    return ko.utils.arrayFilter(manager.band_songs(), function(band_song) {
      return band_song.band_id() == this.id();
    }.bind(this));
  }.bind(this));
*/
}
util.inherits(Band, Table);

Band.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./band?id=' + id, function(result) {
    callback(new Band(result.band.id, result.band.name));
  });
};

// The Band List Object
function BandList() {
  TableList.call(this, './band', 'all_bands');
}
util.inherits(BandList, TableList);

BandList.prototype.build_object_ = function(model) {
  return new Band(model.id, model.name);
};
