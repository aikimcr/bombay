/*
 * Validation methods for routes
 */
var node_util = require('util');

var db_orm = require('../lib/db_orm');

var permission_error = 'Permission Denied';

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

function getRequestBandMember(req, user, callback) {
  if (req.path.match(/band_member/)) {
    db_orm.BandMember.get(exports.findParam(req, 'id'), callback);
  } else if (req.path.match(/song_rating/)) {
    db_orm.SongRating.get(exports.findParam(req, 'id'), function(err, song_rating) {
      if (err) {
        callback(err);
      } else {
        db_orm.BandMember.get(song_rating.band_member_id, callback);
      }
    })
  } else if (req.path.match(/band_song/)) {
    db_orm.BandSong.get(exports.findParam(req, 'id'), function(err, band_song) {
      if (err) {
        callback(err);
      } else {
        db_orm.BandMember.one({person_id: user.id, band_id: band_song.band_id}, callback);
      }
    });
  } else {
    callback(null);
  }
}

function getCurrentBandMember(req, user, callback) {
  var band_id = exports.findParam(req, 'band_id');

  if (band_id == null) {
    getRequestBandMember(req, user, function(err, req_band_member) {
      if (err) {
        callback(err);
      } else if (req_band_member) {
        db_orm.BandMember.one({person_id: user.id, band_id: req_band_member.band_id}, callback);
      } else {
        callback(null, null);
      }
    });

  } else {
    db_orm.BandMember.one({person_id: user.id, band_id: exports.findParam(req, 'band_id')}, callback);
  }
};

function isSysAdmin(user) {
  return (user != null && user.system_admin);
}

function isBandAdmin(band_member) {
  return (band_member != null && band_member.band_admin);
}

exports.requireLogin = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};

exports.requireSysAdmin = function(req, res, next) {
  var user = getUser(req);
  if (isSysAdmin(user)) {
    next();
  } else {
    console.log('User ' + user.id + ' is not system administrator');
    res.json(403, permission_error);
  }
};

exports.requireBandAdmin = function(req, res, next) {
  var user = getUser(req);
  if (isSysAdmin(user)) {
    next();
  } else {
    getCurrentBandMember(req, user, function(err, band_member) {
      if (err) {
        console.log(err);
        res.json(500, err);
      } else if (isBandAdmin(band_member)) {
        next();
      } else {
        console.log('User ' + user.id + ' is not band administrator');
        res.json(403, permission_error);
      }
    });
  }
};

exports.requireSelfOrAdmin = function(req, res, next) {
  var user = getUser(req);
  if (user == null) {
    console.log('User not found');
    res.json(403, permission_error);
  } else if (isSysAdmin(user)) {
    next();
  } else if (req.path.match(/person/) && exports.findParam(req, 'id') == user.id) {
    next();
  } else {
    getCurrentBandMember(req, user, function(err, current_member) {
      if (err) {
        res.json(500, err);
      } else if (isBandAdmin(current_member)) {
        next();
      } else {
        getRequestBandMember(req, user, function(err, band_member) {
          if (err) {
            res.json(403, err);
          } else if (band_member == null) {
            console.log('User ' + user.id + ' is not a member of band');
            res.json(403, permission_error);
          } else if (isBandAdmin(band_member) || band_member.person_id == user.id) {
            next();
          } else {
            console.log('User ' + user.id + ' is not administrator and does not match ' + band_member.person_id);
            res.json(403, permission_error);
          }
        });
      }
    });
  }
};
