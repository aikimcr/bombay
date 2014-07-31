function BandMember(id, band_id, person_id, band_admin) {
  this.super.call(this);
  this.id = ko.observable(id || -1);
  this.band_id = ko.observable(band_id || -1);
  this.person_id = ko.observable(person_id || -1);
  this.band_admin = ko.observable(band_admin || false);

  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id()) || new Band();
  }.bind(this)).extend({throttle: 250});

  this.person = ko.computed(function() {
    return manager.persons.getById(this.person_id()) || new Person();
  }.bind(this)).extend({throttle: 250});
}
util.inherits(BandMember, Table);

BandMember.service_url = './band_member';
BandMember.model_key = 'band_member';
BandMember.columns = ['band_id', 'person_id', 'band_admin'];
BandMember.list_key = 'band_members';

BandMember.prototype.confirm_text = function() {
  return 'Delete band member ' + this.person().name() + ' from ' + this.band().name() + '?';
};

// The BandMember List Object
function BandMemberList() {
  this.super.call(this, BandMember);
}
util.inherits(BandMemberList, TableList);

BandMemberList.prototype.set_sort_compare_list = function() {
  this.sort_type('name_asc');
  this.sort_compare_list = {
/*
    'person_name_asc': function(a, b) {
      if (a.person().name() < b.person().name()) return -1;
      if (a.person().name() > b.person().name()) return 1;
      if (a.band().name() < b.band().name()) return -1;
      if (a.band().name() > b.band().name()) return 1;
      return 0;
    },
    'person_name_desc': function(a, b) {
      if (a.person().name() > b.person().name()) return -1;
      if (a.person().name() < b.person().name()) return 1;
      if (a.band().name() > b.band().name()) return -1;
      if (a.band().name() < b.band().name()) return 1;
      return 0;
    },
*/
    'person_full_name_asc': function(a, b) {
      if (a.person().full_name() < b.person().full_name()) return -1;
      if (a.person().full_name() > b.person().full_name()) return 1;
      if (a.band().name() < b.band().name()) return -1;
      if (a.band().name() > b.band().name()) return 1;
      return 0;
    },
    'person_full_name_desc': function(a, b) {
      if (a.person().full_name() > b.person().full_name()) return -1;
      if (a.person().full_name() < b.person().full_name()) return 1;
      if (a.band().name() > b.band().name()) return -1;
      if (a.band().name() < b.band().name()) return 1;
      return 0;
    },
    'person_email_asc': function(a, b) {
      if (a.person().email() < b.person().email()) return -1;
      if (a.person().email() > b.person().email()) return 1;
      if (a.band().name() < b.band().name()) return -1;
      if (a.band().name() > b.band().name()) return 1;
      return 0;
    },
    'person_email_desc': function(a, b) {
      if (a.person().email() > b.person().email()) return -1;
      if (a.person().email() < b.person().email()) return 1;
      if (a.band().name() > b.band().name()) return -1;
      if (a.band().name() < b.band().name()) return 1;
      return 0;
    },
    'band_name_asc': function(a, b) {
      if (a.band().name() < b.band().name()) return -1;
      if (a.band().name() > b.band().name()) return 1;
      if (a.person().full_name() < b.person().full_name()) return -1;
      if (a.person().full_name() > b.person().full_name()) return 1;
      return 0;
    },
    'band_name_desc': function(a, b) {
      if (a.band().name() > b.band().name()) return -1;
      if (a.band().name() < b.band().name()) return 1;
      if (a.person().full_name() > b.person().full_name()) return -1;
      if (a.person().full_name() < b.person().full_name()) return 1;
      return 0;
    }
  };

  this.sort_compare_labels = [{
    value: 'band_name_asc', label: 'Band Name (A-Z)'
  }, {
    value: 'band_name_desc', label: 'Band Name (Z-A)'
  }, {
    value: 'person_full_email_asc', label: 'Member Email (A-Z)'
  }, {
    value: 'person_full_email_desc', label: 'Member Email (Z-A)'
  }, {
    value: 'person_full_name_asc', label: 'Member Full Name (A-Z)'
  }, {
    value: 'person_full_name_desc', label: 'Member Full Name (Z-A)'
/*
  }, {
    value: 'person_name_asc', label: 'Member Login Name (A-Z)'
  }, {
    value: 'person_name_desc', label: 'Member Login Name (Z-A)'
*/
  }];
};

BandMemberList.prototype.set_filter_list = function() {
  this.filter_values = {
    person_name: ko.observable(''),
    person_full_name: ko.observable(''),
    person_email: ko.observable(''),
    band_name: ko.observable(''),
    band_admin: ko.observable(null)
  };

  this.filter_list = {
    'person_name': function(item) {
      if (this.filter_values.person_name() == '') return true;
      return item.person().name().toLowerCase().match(this.filter_values.person_name().toLowerCase());
    }.bind(this),
    'person_full_name': function(item) {
      if (this.filter_values.person_full_name() == '') return true;
      return item.person().full_name().toLowerCase().match(this.filter_values.person_full_name().toLowerCase());
    }.bind(this),
    'person_email': function(item) {
      if (this.filter_values.person_email() == '') return true;
      return item.person().email().toLowerCase().match(this.filter_values.person_email().toLowerCase());
    }.bind(this),
    'band_name': function(item) {
      if (this.filter_values.band_name() == '') return true;
      return item.band().name().toLowerCase().match(this.filter_values.band_name().toLowerCase());
    }.bind(this),
    'band_admin': function(item) {
      if (this.filter_values.band_admin() == null) return true;
      return !!item.band_admin() === !!this.filter_values.band_admin();
    }.bind(this)
  };

  this.filter_order = ['person_name', 'person_full_name', 'person_email', 'band_name', 'band_admin'];
};

BandMemberList.prototype.build_object_ = function(model) {
  return new BandMember(
    model.id,
    model.band_id,
    model.person_id,
    model.band_admin
  );
};
