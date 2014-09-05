function Request(id, request_type, timestamp, person_id, band_id, description, opt_status) {
  this.super.call(this);
  this.id = ko.observable(id || -1);
  this.request_type = ko.observable(request_type);
  this.timestamp = ko.observable(timestamp);
  this.person_id = ko.observable(person_id);
  this.band_id = ko.observable(band_id);
  this.description = ko.observable(description);
  this.status = ko.observable(opt_status || constants.request_status.pending);

  this.person = ko.computed(function() {
    return manager.persons.getById(this.person_id());
  }.bind(this)).extend({throttle: 50});

  this.person_name = ko.computed(function() {
    var person = this.person();

    if (person) {
      return person.full_name;
    } else {
      return "<Deleted>";
    }
  }.bind(this)).extend({throttle: 50});

  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id());
  }.bind(this)).extend({throttle: 50});

  this.band_name = ko.computed(function() {
    var band = this.band();

    if (band) {
      return band.name;
    } else {
      return "<Deleted>";
    }
  }.bind(this)).extend({throttle: 50});

  this.pretty_request_type = ko.computed(function() {
    return constants.pretty_request_type[this.request_type()];
  }.bind(this)).extend({throttle: 50});

  this.pretty_status = ko.computed(function() {
    return constants.pretty_request_status[this.status()];
  }.bind(this)).extend({throttle: 50});

  this.isSelf = ko.computed(function() {
    return manager.current_person().id() == this.person_id();
  }.bind(this)).extend({throttle: 50});

  this.isAdmin = ko.computed(function() {
    var members = ko.utils.arrayFilter(manager.band_members.list(), function(member) {
      return member.person_id() == manager.current_person().id() &&
             member.band_id() == this.band_id() &&
             member.band_admin();
    }.bind(this));
    return members.length > 0;
  }.bind(this)).extend({throttle: 50});

  this.actions_list = ko.computed(function() {
    var possible_actions = [{
      value: 'delete',
      label: 'Delete',
      permissions: 'originator',
      status: 'resolved'
    }, {
      value: 'reopen',
      label: 'Reopen',
      permissions: 'originator',
      status: 'rejected'
    }, {
      value: 'accept',
      label: 'Accept',
      permissions: 'owner',
      status: 'pending'
    }, {
      value: 'reject',
      label: 'Reject',
      permissions: 'owner_or_originator',
      status: 'pending'
    }];

    var is_originator = function() {
      return (manager.current_person().system_admin() ||
              (this.request_type() == constants.request_type.join_band && this.isSelf()) ||
              (this.request_type() == constants.request_type.add_band_member && this.isAdmin()));
    }.bind(this);

    var is_owner = function() {
      return (manager.current_person().system_admin() ||
              (this.request_type() == constants.request_type.join_band && this.isAdmin()) ||
              (this.request_type() == constants.request_type.add_band_member && this.isSelf()));
    }.bind (this);

    return possible_actions.filter(function(action) {
      if (action.permissions === 'originator' && is_originator() ||
          action.permissions === 'owner' && is_owner() ||
          action.permissions === 'owner_or_originator' && (is_owner() || is_originator())) {
        return ((action.status === 'resolved' &&
                (this.status() == constants.request_status.accepted ||
                 this.status() == constants.request_status.rejected)) ||
                (action.status === 'rejected' &&
                 this.status() == constants.request_status.rejected) ||
                (action.status === 'pending' &&
                 (this.status() == constants.request_status.pending)));
      }
      return false;
    }.bind(this));
  }.bind(this)).extend({throttle: 50});
}
util.inherits(Request, Table);

Request.service_url = './request';
Request.model_key = 'request';
Request.columns = ['request_type', 'timestamp', 'person_id', 'band_id', 'description', 'status'];
Request.list_key = 'requests';

Request.prototype.confirm_text = function() {
  return 'Delete request for ' + this.person().full_name() + ', ' + this.band().name() + '?';
};

Request.prototype.change_status = function(action, callback) {
  this.update(action, callback);
};

// The Request List Object
function RequestList() {
  this.super.call(this, Request);
  this.sort_type('time_asc');
}
util.inherits(RequestList, TableList);

RequestList.prototype.joinBand = function(band_id, callback) {
  if (manager.current_person().id() == -1) {
    callback(404, 'Current login is invalid');
  } else {
    this.create({band_id: band_id, person_id: manager.current_person().id()}, 'join_band', callback);
  }
};

RequestList.prototype.addBandMember = function(person_id, callback) {
  if (manager.current_person().id() == -1) {
    callback(404, 'Current login is invalid');
  } else {
    this.create({band_id: manager.current_band().id(), person_id: person_id}, 'add_band_member', callback);
  }
};

RequestList.prototype.set_sort_compare_list = function() {
  this.sort_type('time_asc');
  this.sort_compare_list = {
    'time_asc': function(a, b) {
      if (a.timestamp() < b.timestamp()) return -1;
      if (a.timestamp() > b.timestamp()) return 1;
      return 0;
    },
    'time_desc': function(a, b) {
      if (a.timestamp() > b.timestamp()) return -1;
      if (a.timestamp() < b.timestamp()) return 1;
      return 0;
    }
  };

  this.sort_compare_labels = [{
    value: 'time_asc', label: 'Request Time (Low to High)'
  }, {
    value: 'time_desc', label: 'Request Time (High to Low)'
  }];
};

RequestList.prototype.set_filter_list = function() {
  this.filter_values =  {
    'request_type': ko.observable(null)
  };

  this.filter_list = {
    'request_type': function(item) {
      if (this.filter_values.request_type() == null) return true;
      return item.type() == this.filter_values.type();
    }.bind(this)
  };

  this.filter_order = ['request_type'];
};

RequestList.prototype.build_object_ = function(model) {
  return new Request(
    model.id,
    model.request_type,
    model.timestamp,
    model.person_id,
    model.band_id,
    model.description,
    model.status
  );
};
