function Request(id, type, timestamp, person_id, band_id) {
  Table.call(this, './request');
  this.id = ko.observable(id || -1);
  this.type = ko.observable(type);
  this.timestamp = ko.observable(timestamp);
  this.person_id = ko.observable(person_id);
  this.band_id = ko.observable(band_id);

  this.person = ko.computed(function() {
    return manager.persons.getById(this.person_id());
  });

  this.person_name = ko.computed(function() {
    var person = this.person();

    if (person) {
      return person.full_name;
    } else {
      return "<Deleted>";
    }
  });

  this.band = ko.computed(function() {
    return manager.bands.getById(this.band_id());
  });

  this.band_name = ko.computed(function() {
    var band = this.band();

    if (band) {
      return band.name;
    } else {
      return "<Deleted>";
    }
  });
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
      result.request.band_id
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
  return 'Delete request for ' + this.person_name() + ', ' + this.band_name() + '?';
};

Request.prototype.reload_list = function() {
  manager.requests.load();
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
    model.type,
    model.timestamp,
    model.person_id,
    model.band_id
  );
};
