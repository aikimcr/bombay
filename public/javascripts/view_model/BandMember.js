function BandMember(id, band_id, person_id, band_admin) {
  Table.call(this, './band_member');
  this.id = ko.observable(id || -1);
  this.band_id = ko.observable(band_id || -1);
  this.person_id = ko.observable(person_id || -1);
  this.band_admin = ko.observable(band_admin || false);

  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id()) || new Band();
  }.bind(this));

  this.person = ko.computed(function() {
    return manager.persons.getById(this.person_id()) || new Person();
  }.bind(this));
}
util.inherits(BandMember, Table);

BandMember.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./band_member?id=' + id, function(result) {
    callback(new BandMember(
      result.band_member.id,
      result.band_member.band_id,
      result.band_member.person_id,
      result.band_member.band_admin
    ));
  });
};

BandMember.prototype.confirm_text = function() {
  return 'Delete band member ' + this.person().name() + ' from ' + this.band().name() + '?';
};

BandMember.prototype.reload_list = function() {
  manager.band_members.load();
};

// The BandMember List Object
function BandMemberList() {
  TableList.call(this, './band_member', 'all_band_members');
}
util.inherits(BandMemberList, TableList);

BandMemberList.prototype.build_object_ = function(model) {
  return new BandMember(
    model.id,
    model.band_id,
    model.person_id,
    model.band_admin
  );
};
