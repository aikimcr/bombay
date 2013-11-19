function Person(id, name, full_name, email, system_admin) {
  Table.call(this);
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');
  this.full_name = ko.observable(full_name || '');
  this.email = ko.observable(email || '');
  this.system_admin = ko.observable(system_admin || false);

/*
  this.band_members = ko.computed(function() {
    return ko.utils.arrayFilter(manager.band_members(), function(band_member) {
      return band_member.person_id() == this.id();
    }.bind(this));
  }.bind(this));
  this.song_ratings = ko.computed(function () {
    return ko.utils.arrayFilter(manager.song_ratings(), function(song_rating) {
      return song_rating.person_id() == this.id();
    }.bind(this));
  }.bind(this));
*/
}
util.inherits(Person, Table);

Person.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./person?id=' + id, function(result) {
    callback(new Person(
      result.person.id,
      result.person.name,
      result.person.full_name,
      result.person.email,
      result.person.system_admin
    ));
  });
};

// The List Object
function PersonList() {
  TableList.call(this, './person', 'all_persons');
}
util.inherits(PersonList, TableList);

PersonList.prototype.build_object_ = function(model) {
  return new Person(
    model.id,
    model.name,
    model.full_name,
    model.email,
    model.system_admin
  )
};
