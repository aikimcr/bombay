// The Individual Band Objects
function Band(id, name) {
  Table.call(this, './band');
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');

  this.band_members = ko.computed(function() {
    return manager.band_members.filterByKey('band_id', this.id());
  }.bind(this));

  this.band_member_count = ko.computed(function() {
    return this.band_members().length;
  }.bind(this))
}
util.inherits(Band, Table);

Band.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./band?id=' + id, function(result) {
    callback(new Band(result.band.id, result.band.name));
  });
};

Band.prototype.confirm_text = function() {
  return 'Delete band ' + this.name() + '?';
};

Band.prototype.reload_list = function() {
  manager.bands.load();
};

// The Band List Object
function BandList() {
  TableList.call(this, './band', 'all_bands');
}
util.inherits(BandList, TableList);

BandList.prototype.build_object_ = function(model) {
  return new Band(model.id, model.name);
};
