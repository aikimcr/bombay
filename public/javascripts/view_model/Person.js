function Person(id, name, full_name, email, system_admin) {
  Table.call(this);
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');
  this.full_name = ko.observable(full_name || '');
  this.email = ko.observable(email || '');
  this.system_admin = ko.observable(system_admin || false);

  this.memberships = ko.computed(function() {
    return manager.band_members.filterByKey('person_id', this.id());
  }.bind(this)).extend({throttle: 250});

  this.membership_count = ko.computed(function() {
    return this.memberships().length;
  }.bind(this)).extend({throttle: 250});
}
util.inherits(Person, Table);

Person.service_url = './person';
Person.model_key = 'person';
Person.columns = ['name', 'full_name', 'email', 'system_admin'];
Person.list_key = 'persons';

Person.prototype.confirm_text = function() {
  return 'Delete person ' + this.name() + '?';
};

Person.prototype.reload_list = function() {
  manager.persons.load();
};

// The List Object
function PersonList() {
  TableList.call(this, Person);
}
util.inherits(PersonList, TableList);

PersonList.prototype.set_sort_compare_list = function() {
  this.sort_type('full_name_asc');
  this.sort_compare_list = {
    'name_asc': function(a, b) {
      if (a.name() < b.name()) return -1;
      if (a.name() > b.name()) return 1;
      return 0;
    },
    'name_desc': function(a, b) {
      if (a.name() > b.name()) return -1;
      if (a.name() < b.name()) return 1;
      return 0;
    },
    'full_name_asc': function(a, b) {
      if (a.full_name() < b.full_name()) return -1;
      if (a.full_name() > b.full_name()) return 1;
      return 0;
    },
    'full_name_desc': function(a, b) {
      if (a.full_name() > b.full_name()) return -1;
      if (a.full_name() < b.full_name()) return 1;
      return 0;
    },
    'email_asc': function(a, b) {
      if (a.email() < b.email()) return -1;
      if (a.email() > b.email()) return 1;
      return 0;
    },
    'email_desc': function(a, b) {
      if (a.email() > b.email()) return -1;
      if (a.email() < b.email()) return 1;
      return 0;
    },
  };

  this.sort_compare_labels = [{
    value: 'email_asc', label: 'Email (A-Z)',
  }, {
    value: 'email_desc', label: 'Email (Z-A)',
  }, {
    value: 'full_name_asc', label: 'Full Name (A-Z)'
  }, {
    value: 'full_name_desc', label: 'Full Name (Z-A)'
  }, {
    value: 'name_asc', label: 'Name (A-Z)'
  }, {
    value: 'name_desc', label: 'Name (Z-A)'
  }];
};

PersonList.prototype.set_filter_list = function() {
  this.filter_values = {
    'name': ko.observable(''),
    'full_name': ko.observable(''),
    'email': ko.observable(''),
    'system_admin': ko.observable(null)
  };

  this.filter_list = {
    'name': function(item) {
      if (this.filter_values.name() == '') return true;
      return item.name().toLowerCase().match(this.filter_values.name().toLowerCase());
    }.bind(this),
    'full_name': function(item) {
      if (this.filter_values.full_name() == '') return true;
      return item.full_name().toLowerCase().match(this.filter_values.full_name().toLowerCase());
    }.bind(this),
    'email': function(item) {
      if (this.filter_values.email() == '') return true;
      return item.email().toLowerCase().match(this.filter_values.email().toLowerCase());
    }.bind(this),
    'system_admin': function(item) {
      if (this.filter_values.system_admin() == null) return true;
      return !!item.system_admin() === !!this.filter_values.system_admin();
    }.bind(this)
  };

  this.filter_order = ['name', 'full_name', 'email', 'system_admin'];
};

PersonList.prototype.build_object_ = function(model) {
  return new Person(
    model.id,
    model.name,
    model.full_name,
    model.email,
    model.system_admin
  )
};
