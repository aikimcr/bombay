
/*
 * Request library
 */

var Fiber = require('fibers');

var db = require('lib/db');
var constants = require('lib/constants');
var inherits = require('lib/util').inherits;

exports.join_band = function(options, callback) {
  Request.create(
    constants.request_type.join_band,
    options.band_id,
    options.person_id,
    callback
  );
};

exports.getById = function(request_id, callback) {
  Request.getById(request_id, callback);
};

var Request = function(type) {
  this.request_type = type;
};

Request.dbcreate_ = function(dbreq_h, req) {
  var request_id = null;

  var fiber = Fiber.current;
  dbreq_h.create({
    band_id: req.band_id, person_id: req.person_id, description: req.description,
    request_type: req.request_type, status: req.status
  }, function(result) {
    setTimeout(function() {
      if (result.err) {
        throw (result.err);
      } else {
        request_id = result.request_id;
        fiber.run();
      }
    }, 5);
  });
  Fiber.yield();
  
  return request_id;
};

Request.dbget_ = function(dbreq_h, request_id) {
  if (request_id == null) throw('No request id provided');

  var dbreq = null;

  var fiber = Fiber.current;
  dbreq_h.getById(request_id, function(result) {
    setTimeout(function() {
      if (result.err) {
        throw (result.err);
      } else {
        dbreq = result.request;
        fiber.run();
      }
    }, 5);
  });
  Fiber.yield();

  return dbreq;
};

Request.createFromType_ = function(type) {
  var create_object = {}
  create_object[constants.request_type.join_band] = function() { return new JoinBandRequest(); };

  return create_object[type]();
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

Request.prototype.setDescription_ = function() {
  this.description = 'Band ' + this.band_id + ' Person ' + this.person_id;
  var names = null;

  var fiber = Fiber.current;
  this.getPersonAndBandNames_(function(names_result) {
    setTimeout(function() {
      names = names_result;
      fiber.run();
    }.bind(this), 5);
  });
  Fiber.yield()

  this.setDescriptionText(names);
};

Request.create = function(type, band_id, person_id, callback) {
  Fiber(function() {
    var dbh = new db.Handle();
    var req = Request.createFromType_(type);
    req.band_id = band_id;
    req.person_id = person_id;
    req.setDescription_();
    req.status = constants.request_status.pending;

    var dbreq_h = dbh.request();

    try {
      var request_id = Request.dbcreate_(dbreq_h, req);
      var dbreq = Request.dbget_(dbreq_h, request_id);
      Request.setFromDB_(req, dbreq);
    } catch(e) {
      callback({err: e});
      return;
    };

    callback({request: req});
  }).run();
};

Request.getById = function(request_id, callback) {
  Fiber(function() {
    var dbh = new db.Handle();
    var dbreq_h = dbh.request();

    try {
      var dbreq = Request.dbget_(dbreq_h, request_id);
      var req = Request.createFromType_(dbreq.request_type);
      Request.setFromDB_(req, dbreq);
    } catch(e) {
      callback({err: e});
      return;
    }

    callback({request: req});
  }).run();
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

var JoinBandRequest = function() {
  Request.call(this, constants.request_type.join_band);
};
inherits(JoinBandRequest, Request);

JoinBandRequest.prototype.setDescriptionText = function(names) {
  this.description = names.person + ' is asking to join ' + names.band;
};

JoinBandRequest.prototype.accept = function(callback) {
  Request.prototype.accept.call(this, function(result) {
    if (result.err) {
      callback(result);
    } else {
debugger;//XXX
      var dbh = new db.Handle();
      dbh.band_member().create({
        band_id: this.band_id,
        person_id: this.person_id,
        band_admin: false,
      }, function(result) {
debugger;//XXX
        if (result.err) {
          callback(result);
        } else {
          callback({request: this});
        }
      }.bind(this));
    }
  });
};
