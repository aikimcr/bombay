
/*
 * Request library
 */

var flow = require('flow');

var db = require('lib/db');
var constants = require('lib/constants');
var inherits = require('lib/util').inherits;

exports.joinBand = function(options, callback) {
  Request.create(
    constants.request_type.join_band,
    options.band_id,
    options.person_id,
    callback
  );
};

exports.addBandMember = function(options, callback) {
  Request.create(
    constants.request_type.add_band_member,
    options.band_id,
    options.person_id,
    callback
  );
};

exports.getMyRequests = function(person_id, callback) {
  var dbh = new db.Handle();

  var getAll = flow.define(
    function(person_id, callback) {
      this.person_id = person_id;
      this.callback = callback;
      dbh.person().getById(this.person_id, this);
    },
    function(result) {
      if (result.err) {
        this.callback(result);
      } else if (result.person.system_admin) {
        dbh.request().getAll(this);
      } else {
        dbh.band_member().getAllWithArgs({
          where: { person_id: this.person_id, band_admin: 1 },
          order: 'description'
        }, function(result) {
          if (result.err) {
            this.callback(result);
          } else {
            var args;
            if (result.all_band_members.length > 0) {
              var member_band_ids = result.all_band_members.map(function(member) {
                return member.band_id;
              });

              args = { '-or': { person_id: this.person_id, band_id: { in: member_band_ids }}};
            } else {
              args = { person_id: this.person_id };
            }

            dbh.request().getAllWithArgs({ where: args }, this);
          }
        }.bind(this));
      }
    },
    function(result) {
      if (result.err) {
        this.callback(result);
      } else {
        var requests = [];
        result.all_requests.forEach(function(dbreq) {
          var req = Request.createFromType_(dbreq.request_type);
          Request.setFromDB_(req, dbreq);
          requests.push(req);
        }.bind(this));
        this.callback({all_requests: requests});
      }
    }
  );

  getAll(person_id, callback);
};

exports.getById = function(request_id, callback) {
  Request.getById(request_id, callback);
};

exports.isType = function(request, type) {
  var constructor = Request.constructorFromType_(type);
  return request instanceof constructor;
};

var Request = function(type) {
  this.request_type = type;
};

Request.dbcreate_ = function(dbreq_h, req, callback) {
  dbreq_h.create({
    band_id: req.band_id, person_id: req.person_id, description: req.description,
    request_type: req.request_type, status: req.status
  }, function(result) {
    if (result.err) {
      throw (result.err);
    } else {
      callback(result.request_id);
    }
  });
};

Request.dbget_ = function(dbreq_h, request_id, callback) {
  if (request_id == null) throw('No request id provided');

  dbreq_h.getById(request_id, function(result) {
    if (result.err) {
      throw (result.err);
    } else {
      callback(result.request);
    }
  });
};

Request.constructorFromType_ = function(type) {
  var create_object = {}
  create_object[constants.request_type.join_band] = function() {
    return new JoinBandRequest();
  };
  create_object[constants.request_type.add_band_member] = function() {
    return new AddBandMemberRequest();
  };

  return create_object[type];
}

Request.createFromType_ = function(type) {
  var constructor = Request.constructorFromType_(type);
  return constructor();
};

Request.setFromDB_ = function(req, dbreq) {
  req.id = dbreq.id;
  req.band_id = dbreq.band_id;
  req.person_id = dbreq.person_id;
  req.description = dbreq.description;
  req.request_type = dbreq.request_type;
  req.status = dbreq.status;
  req.timestamp = dbreq.timestamp;
};

Request.prototype.setDescription_ = function(callback) {
  this.getPersonAndBandNames_(function(names_result) {
    this.setDescriptionText(names_result);
    callback({});
  }.bind(this));
};

Request.create = function(type, band_id, person_id, callback) {
  var creator = flow.define(
    function(type, band_id, person_id, callback) {
      this.type = type;
      this.band_id = band_id;
      this.person_id = person_id;
      this.callback = callback;
      this.dbh = new db.Handle();
      this.req = Request.createFromType_(type);
      this.req.band_id = band_id;
      this.req.person_id = person_id;
      this.req.setDescription_(this);
    },
    function() {
      this.req.status = constants.request_status.pending;
      this.dbreq_h = this.dbh.request();

      try {
        Request.dbcreate_(this.dbreq_h, this.req, this);
      } catch (e) {
        this.callback({err: e});
      };
    },
    function(request_id) {
      this.request_id = request_id;
      try {
        Request.dbget_(this.dbreq_h, this.request_id, this);
      } catch(e) {
        this.callback({err: e});
      };
    },
    function(dbreq) {
      this.dbreq = dbreq;
      Request.setFromDB_(this.req, this.dbreq);
      this.callback({request: this.req});
    }
  );
  creator(type, band_id, person_id, callback);
};

Request.getById = function(request_id, callback) {
  var getter = flow.define(
    function(request_id, callback) {
      this.request_id = request_id;
      this.callback = callback;
      this.dbh = new db.Handle();
      this.dbreq_h = this.dbh.request();

      try {
        Request.dbget_(this.dbreq_h, this.request_id, this);
      } catch(e) {
        this.callback({err: e});
      };
    },
    function(dbreq) {
      this.dbreq = dbreq;
      try {
        this.req = Request.createFromType_(this.dbreq.request_type);
        Request.setFromDB_(this.req, this.dbreq);
      } catch(e) {
        this.callback({err: e});
      };
      this.callback({request: this.req});
    }
  );
  getter(request_id, callback);
};

Request.prototype.getPersonAndBandNames_ = function(callback) {
  var dbh = new db.Handle();

  dbh.person().getById(this.person_id, function(result) {
    var person_name = '<unknown>(' + this.person_id + ')';
    if (result.person && result.person.name) {
      person_name = result.person.full_name;
    }
 
    dbh.band().getById(this.band_id, function(result) {
      var band_name = '<unknown>(' + this.band_id + ')';
      if (result.band && result.band.name) {
        band_name = result.band.name;
      }
      callback({person: person_name, band: band_name});
    }.bind(this));
  }.bind(this));
};

Request.prototype.setDescriptionText = function(names) {
  this.description = 'Request for band ' + names.band + ' and person ' + names.person;
};

Request.prototype.setStatus_ = function(new_status, callback) {
  var dbh = new db.Handle();
  dbh.request().update({id: this.id, status: new_status}, function(result) {
    if (result.err) {
      callback(result);
    } else {
      this.status = new_status;
      callback({request: this});
    }
  }.bind(this));
};

Request.prototype.reject = function(callback) {
  this.setStatus_(constants.request_status.rejected, callback);
};

Request.prototype.accept = function(callback) {
  this.setStatus_(constants.request_status.accepted, callback);
};

Request.prototype.reopen = function(callback) {
  this.setStatus_(constants.request_status.pending, callback);
};

Request.prototype.cancel = function(callback) {
  var dbh = new db.Handle();
  dbh.request().deleteById(this.id, callback);
};

var BandRequest = function(type) {
  Request.call(this, type);
}
inherits(BandRequest, Request);

BandRequest.prototype.accept = function(callback) {
  Request.prototype.accept.call(this, function(result) {
    if (result.err) {
      callback(result);
    } else {
      var dbh = new db.Handle();
      dbh.band_member().create({
        band_id: this.band_id,
        person_id: this.person_id,
        band_admin: false,
      }, function(result) {
        if (result.err) {
          callback(result);
        } else {
          callback({request: this});
        }
      }.bind(this));
    }
  }.bind(this));
};

var JoinBandRequest = function() {
  BandRequest.call(this, constants.request_type.join_band);
};
inherits(JoinBandRequest, BandRequest);

JoinBandRequest.prototype.setDescriptionText = function(names) {
  this.description = names.person + ' is asking to join ' + names.band;
};

var AddBandMemberRequest = function() {
  BandRequest.call(this, constants.request_type.add_band_member);
};
inherits(AddBandMemberRequest, BandRequest);

AddBandMemberRequest.prototype.setDescriptionText = function(names) {
  this.description = names.band + ' is inviting ' + names.person +  ' to join';
};
