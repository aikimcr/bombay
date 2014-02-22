/*
 * Validation methods for routes
 */
var node_util = require('util');

var db = require('lib/db');

var permission_error = {err: 'Permission Denied'};

exports.findParam = function(req, key) {
  var result = req.query[key];
  if (result == null) result = req.params[key];
  if (result == null) result = req.body[key];
  return result;
}

function getUser(req) {
  if (req.session.passport.user) {
    return JSON.parse(req.session.passport.user);
  }
  return null;
}

function getSongRatingById(id, callback) {
  if (id == null) {
    callback(null);
  } else {
    var dbh = new db.Handle();
    dbh.song_rating().getById(id, function(result) {
      callback(result.song_rating);
    });
  }
}

function getBandMemberById(id, callback) {
  if (id == null) {
    callback(null);
  } else {
    var dbh = new db.Handle();
    dbh.band_member().getById(id, function(result) {
      if (result.err) {
        console.log(node_util.inspect(result));
        callback(null);
      } else {
        callback(result.band_member);
      }
    });
  }
}

function getBandMember(person_id, band_id, callback) {
  if (person_id == null) {
    callback(null);
  } else if (band_id == null) {
    callback(null);
  } else {
    var dbh = new db.Handle();
    dbh.band_member().getAllWithArgs({
      fields: ['id', 'band_admin'],
      where: {band_id: band_id, person_id: person_id}
    }, function(result) {
      if (result.err) {
        console.log(node_util.inspect(result));
        callback(null);
      } else {
        callback(result.all_band_members[0]);
      }
    });
  }
}

function getRequestBandMember(req, callback) {
if (GLOBAL.breakit) debugger;//XXX
  if (req.path.match(/band_member/)) {
    getBandMemberById(exports.findParam(req, 'id'), callback);
  } else if (req.path.match(/song_rating/)) {
    getSongRatingById(exports.findParam(req, 'id'), function(song_rating) {
if (GLOBAL.breakit) debugger;//XXX
      getBandMemberById(song_rating.band_member_id, callback);
    })
  } else {
    callback(null);
  }
}

function getCurrentBandMember(req, user, callback) {
  var band_id = exports.findParam(req, 'band_id');

if (GLOBAL.breakit) debugger;//XXX
  if (band_id == null) {
    var req_band_member = getRequestBandMember(req, function(req_band_member) {
if (GLOBAL.breakit) debugger;//XXX
      if (req_band_member) {
        getBandMember(user.id, req_band_member.band_id, callback);
      } else {
        callback(null);
      }
    });

  } else {
    getBandMember(user.id, exports.findParam(req, 'band_id'), callback);
  }
};

function isSysAdmin(user) {
  return (user != null && user.system_admin);
}

function isBandAdmin(band_member) {
  return (band_member != null && band_member.band_admin);
}

exports.requireLogin = function(req, res, next) {
  var user = getUser(req);
  if (user != null) {
    next();
  } else {
    res.redirect('/login');
  }
};

exports.requireSysAdmin = function(req, res, next) {
  if (isSysAdmin(getUser(req))) {
    next();
  } else {
    res.json(permission_error);
  }
};

exports.requireBandAdmin = function(req, res, next) {
  var user = getUser(req);
  if (isSysAdmin(user)) {
    next();
  } else {
if (GLOBAL.breakit) debugger;//XXX
    getCurrentBandMember(req, user, function(band_member) {
if (GLOBAL.breakit) debugger;//XXX
      if (isBandAdmin(band_member)) {
        next();
      } else {
        res.json(permission_error);
      }
    });
  }
};

exports.requireSelfOrAdmin = function(req, res, next) {
if (GLOBAL.breakit) debugger;//XXX
  var user = getUser(req);
  if (user == null) {
    res.json(permission_error);
  } else if (isSysAdmin(user)) {
    next();
  } else if (req.path.match(/person/) && exports.findParam(req, 'id') === user.id) {
if (GLOBAL.breakit) debugger;//XXX
    next();
  } else {
if (GLOBAL.breakit) debugger;//XXX
    getCurrentBandMember(req, user, function(current_member) {
if (GLOBAL.breakit) debugger;//XXX
      if (isBandAdmin(current_member)) {
        next();
      } else {
        getRequestBandMember(req, function(band_member) {
if (GLOBAL.breakit) debugger;//XXX
          if (band_member == null) {
            res.json(permission_error);
          } else if (isBandAdmin(band_member) || band_member.person_id == user.id) {
            next();
          } else {
            res.json(permission_error);
          }
        });
      }
    });
  }
};
