function Request(id, request_type, timestamp, person_id, band_id, description, opt_status) {
  Table.call(this, './request');
  this.id = ko.observable(id || -1);
  this.request_type = ko.observable(request_type);
  this.timestamp = ko.observable(timestamp);
  this.person_id = ko.observable(person_id);
  this.band_id = ko.observable(band_id);
  this.description = ko.observable(description);
  this.status = ko.observable(opt_status || constants.request_status.pending);

  this.person = ko.computed(function() {
    return manager.persons.getById(this.person_id());
  }.bind(this)).extend({throttle: 250});

  this.person_name = ko.computed(function() {
    var person = this.person();

    if (person) {
      return person.full_name;
    } else {
      return "<Deleted>";
    }
  }.bind(this)).extend({throttle: 250});

  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id());
  }.bind(this)).extend({throttle: 250});

  this.band_name = ko.computed(function() {
    var band = this.band();

    if (band) {
      return band.name;
    } else {
      return "<Deleted>";
    }
  }.bind(this)).extend({throttle: 250});

  this.pretty_request_type = ko.computed(function() {
    return constants.pretty_request_type[this.request_type()];
  }.bind(this)).extend({throttle: 250});

  this.pretty_status = ko.computed(function() {
    return constants.pretty_request_status[this.status()];
  }.bind(this)).extend({throttle: 250});

  this.isSelf = ko.computed(function() {
    return manager.current_person().id() == this.person_id();
  }.bind(this)).extend({throttle: 250});

  this.isAdmin = ko.computed(function() {
    var members = ko.utils.arrayFilter(manager.band_members.list(), function(member) {
      return member.person_id() == manager.current_person().id() &&
             member.band_id() == this.band_id() &&
             member.band_admin();
    }.bind(this));
    return members.length > 0;
  }.bind(this)).extend({throttle: 250});

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
  }.bind(this)).extend({throttle: 250});
}
util.inherits(Request, Table);


Request.loadById = function(id, callback) {
  var svc = service.getInstance();
  svc.get('./request?id=' + id, function(result) {
    callback(new Request(
      result.request.id,
      result.request.type,
      result.request.timestamp,
      result.request.person_id,
      result.request.band_id,
      result.request.description
    ));
  });
};

Request.prototype.refresh = function(callback) {
  var svc = service.getInstance();
  svc.get('./request?id=' + id, function(result) {
    if (result.err) {
      callback(result);
    } else {
      if (this.type() != result.request.type) this.type(result.request.type);
      if (this.timestamp() != result.request.timestamp) this.timestamp(result.request.timestamp);
      if (this.person_id() != result.request.person_id) this.person_id(result.request.person_id);
      if (this.band_id() != result.request.band_id) this.band_id(result.request.band_id);
    }
  });
};

Request.prototype.confirm_text = function() {
  return 'Delete request for ' + this.person().full_name() + ', ' + this.band().name() + '?';
};

Request.prototype.reload_list = function() {
  manager.requests.load();
};

Request.prototype.reload_relatives = function() {
  manager.band_members.load();
  manager.band_songs.load();
  manager.song_ratings.load();
};

Request.prototype.change_status = function(action, callback) {
  var svc = service.getInstance();
  svc.put(this.service_url, function(result) {
    if (callback) callback(result);
  }, {
    action: action,
    id: this.id()
  });
};

// The Request List Object
function RequestList() {
  TableList.call(this, './request', 'all_requests');
  this.sort_type('time_asc');
}
util.inherits(RequestList, TableList);

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
