function BandMember(id, band_id, person_id, band_admin) {
  this.id = ko.observable(id);
  this.band_id = ko.observable(band_id);
  this.person_id = ko.observable(person_id);
  this.band_admin = ko.observable(band_admin);

/*
  this.person = ko.computed(function () {
    return manager.getById(manager.people, this.person_id());
  }.bind(this));
  this.band = ko.computed(function () {
    return manager.getById(manager.bands, this.band_id());
  }.bind(this));
*/
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
