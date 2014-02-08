/*
 * Validation methods for routes
 */
var Fiber = require('fibers');
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

function getSongRatingById(id) {
  if (id == null) return null;

  var dbh = new db.Handle();
  var song_rating = null;

  var fiber = Fiber.current;
  dbh.song_rating().getById(id, function(result) {
    setTimeout(function() {
      song_rating = result.song_rating;
      fiber.run();
    }, 5);
  });
  Fiber.yield();

  return song_rating;
}

function getBandMemberById(id) {
  if (id == null) return null;

  var dbh = new db.Handle();
  var band_member = null;

  var fiber = Fiber.current;
  dbh.band_member().getById(id, function(result) {
    setTimeout(function() {
      if (result.err) {
        console.log(node_util.inspect(result));
      } else {
        band_member = result.band_member;
        fiber.run();
      }
    }, 5);
  });
  Fiber.yield();

  return band_member;
}

function getBandMember(person_id, band_id) {
  if (person_id == null) return null;
  if (band_id == null) return null;

  var dbh = new db.Handle();
  var band_member = null;

  var fiber = Fiber.current;
  dbh.band_member().getAllWithArgs({
    fields: ['id', 'band_admin'],
    where: {band_id: band_id, person_id: person_id}
  }, function(result) {
    setTimeout(function() {
      if (result.err) {
        console.log(node_util.inspect(result));
      } else {
        band_member = result.all_band_members[0];
      }
      fiber.run()
    }, 5);
  });
  Fiber.yield();

  return band_member;
}

function getRequestBandMember(req) {
      var band_member_id = null;
      if (req.path.match(/band_member/)) {
        band_member_id = exports.findParam(req, 'id');
      } else if (req.path.match(/song_rating/)) {
        var song_rating = getSongRatingById(exports.findParam(req, 'id'));
        band_member_id = song_rating.band_member_id;
      }
      return getBandMemberById(band_member_id);
}

function getCurrentBandMember(req, user) {
  var band_id = exports.findParam(req, 'band_id');
  var band_member = null;

  if (band_id == null) {
    var req_band_member = getRequestBandMember(req);

    if (req_band_member) {
      band_member = getBandMember(user.id, req_band_member.band_id);
    }
  } else {
    band_member = getBandMember(user.id, exports.findParam(req, 'band_id'));
  }

  return band_member;
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
  Fiber(function() {
    var user = getUser(req);
    if (isSysAdmin(user)) {
      next();
    } else {
      var band_member = getCurrentBandMember(req, user);

      if (isBandAdmin(band_member)) {
        next();
      } else {
        res.json(permission_error);
      }
    }
  }).run();
};

exports.requireSelfOrAdmin = function(req, res, next) {
  var user = getUser(req);
  if (user == null) {
    res.json(permission_error);
  } else if (isSysAdmin(user)) {
    next();
  } else if (req.path.match(/person/) && exports.findParam(req, 'id') === user.id) {
    next();
  } else {
    Fiber(function() {
      var current_member = getCurrentBandMember(req, user);

      if (isBandAdmin(current_member)) {
        next();
      } else {
        var band_member = getRequestBandMember(req);

        if (band_member == null) {
          res.json(permission_error);
        } else if (isBandAdmin(band_member) || band_member.person_id == user.id) {
          next();
        } else {
          res.json(permission_error);
        }
      }
    }).run();
  }
};
