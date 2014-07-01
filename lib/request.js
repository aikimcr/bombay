
/*
 * Request library
 */

var flow = require('flow');

var db_orm = require('lib/db_orm');
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
  var getAll = flow.define(
    function(db_orm, person_id, callback) {
      this.db_orm = db_orm;
      this.person_id = person_id;
      this.callback = callback;
      this.db_orm.Person.get(this.person_id, this);
    },
    function(err, person) {
      if (err) {
        this.callback(err);
      } else if (person.system_admin) {
        this.db_orm.Request.find('description', this);
      } else {
        this.db_orm.BandMember.find({ person_id: this.person_id, band_admin: true }, function(err, band_members) {
          if (err) {
            this.callback(err);
          } else {
            var args;
            if (band_members.length > 0) {
              var band_ids = band_members.map(function(band_member) {
                return band_member.band_id;
              });

              args = {or: [{person_id: this.person_id}, {band_id: band_ids}]};
            } else {
              args = {person_id: this.person_id};
            }

            this.db_orm.Request.find(args, 'description', this);
          }
        }.bind(this));
      }
    },
    function(err, db_requests) {
      if (err) {
        this.callback(err);
      } else {
        var requests = [];
        db_requests.forEach(function(dbreq) {
          var req = Request.createFromType_(dbreq.request_type);
          Request.setFromDB_(req, dbreq);
          requests.push(req);
        }.bind(this));
        this.callback(err, requests);
      }
    }
  );

  getAll(db_orm, person_id, callback);
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
  db_orm.Request.create([req], function(err, rows) {
    if (err) {
      callback(err);
    } else {
      callback(null, rows[0].id);
    }
  }.bind(this));
};

Request.dbget_ = function(dbreq_h, request_id, callback) {
  if (request_id == null) callback('No request id provided');
  db_orm.Request.get(request_id, callback);
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
  this.getPersonAndBandNames_(function(err, names_result) {
    if (err) {
      callback(err);
    } else {
      this.setDescriptionText(names_result);
      callback(null);
    }
  }.bind(this));
};

Request.create = function(type, band_id, person_id, callback) {
  var creator = flow.define(
    function(type, band_id, person_id, callback) {
      this.type = type;
      this.band_id = band_id;
      this.person_id = person_id;
      this.callback = callback;
      this.req = Request.createFromType_(type);
      this.req.band_id = band_id;
      this.req.person_id = person_id;
      this.req.setDescription_(this);
    },
    function() {
      this.req.status = constants.request_status.pending;
      Request.dbcreate_(db_orm.Request, this.req, this);
    },
    function(err, request_id) {
      if (err) {
        this(err);
      } else {
        this.request_id = request_id;
        Request.dbget_(db_orm.Request, this.request_id, this);
      }
    },
    function(err, dbreq) {
      if (err) {
        callback(err);
      } else {
        this.dbreq = dbreq;
        Request.setFromDB_(this.req, this.dbreq);
        this.callback(null, this.req);
      }
    }
  );
  creator(type, band_id, person_id, callback);
};

Request.getById = function(request_id, callback) {
  var getter = flow.define(
    function(request_id, callback) {
      this.request_id = request_id;
      this.callback = callback;
      Request.dbget_(db_orm.Request, this.request_id, this);
    },
    function(err, dbreq) {
      if (err) {
        this.callback(err);
      } else {
        this.dbreq = dbreq;
        this.req = Request.createFromType_(this.dbreq.request_type);
        Request.setFromDB_(this.req, this.dbreq);
        this.callback(null, this.req);
      }
    }
  );
  getter(request_id, callback);
};

Request.prototype.getPersonAndBandNames_ = function(callback) {
  db_orm.Person.get(this.person_id, function(err, person) {
    if (err) console.log(err);
    var person_name = '<unknown>(' + this.person_id + ')';
    if (person && person.full_name) {
      person_name = person.full_name;
    }
 
    db_orm.Band.get(this.band_id, function(err, band) {
      if (err) console.log(err);
      var band_name = '<unknown>(' + this.band_id + ')';
      if (band && band.name) {
        band_name = band.name;
      }
      callback(null, {person: person_name, band: band_name});
    }.bind(this));
  }.bind(this));
};

Request.prototype.setDescriptionText = function(names) {
  this.description = 'Request for band ' + names.band + ' and person ' + names.person;
};

Request.prototype.setStatus_ = function(new_status, callback) {
  db_orm.Request.get(this.id, function(err, row) {
    if (err) {
      callback(err);
    } else {
      row.save({status: new_status}, callback);
    }
  }.bind(this))
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
  db_orm.Request.get(this.id, function(err, row) {
    if (err) {
      callback(err);
    } else {
      row.remove(callback);
    }
  }.bind(this));
};

var BandRequest = function(type) {
  Request.call(this, type);
}
inherits(BandRequest, Request);

BandRequest.prototype.accept = function(callback) {
  Request.prototype.accept.call(this, function(err, result) {
    if (err) {
      callback(err);
    } else {
      db_orm.BandMember.create([{
        band_id: this.band_id,
        person_id: this.person_id,
        band_admin: false
      }], function(err, rows) {
        if (err) {
          callback(err);
        } else {
          callback(null, result)
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
