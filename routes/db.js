
/*
 * Database manipulation methods.
 */
var db = require('lib/db');
var constants = require('lib/constants');
var util = require('lib/util');
var request = require('lib/request');
var base64_decode = require('base64').decode;

exports.getSessionInfo = function(req, res) {
  var session = req.session.passport;
  var dbh = new db.Handle();
  //var node_util = require('util');
  //console.log(node_util.inspect(session));
  var user = JSON.parse(session.user);
  //console.log(user);
  dbh.person().getById(user.id, function(result) {
    res.json(result);
  });
};

exports.getBandTable = function(req, res) {
  var band_id = req.params.id;
  if (!band_id) band_id = req.query.id;

  var dbh = new db.Handle();

  if (band_id) {
    dbh.band().getById(band_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: 'name' }};
    dbh.band().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postBandTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().create(req.body, function(result) {
    res.json(result);
  });
};

exports.putBandTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().update(req.query, function(result) {
    res.json(result);
  });
};

exports.deleteBandTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

exports.getPersonTable = function(req, res) {
  var person_id = req.params.id;
  if (!person_id) person_id = req.query.id;

  var dbh = new db.Handle();

  if (person_id) {
    dbh.person().getById(person_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: 'full_name' }};
    dbh.person().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postPersonTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().create(req.body, function(result) {
    res.json(result);
  });
};

exports.putPersonTable = function(req, res) {
  var dbh = new db.Handle();

  if (req.query.token) {
    var token = req.query.token;
    delete req.query.token;
    dbh.person().getById(req.query.id, function(result) {
      var wrong_old = 'Old password did not match';
      var encrypted_db_pw = result.person.password;
      var public_pem = util.get_pem_file('crypto/rsa_public.pem');
      var private_pem = util.get_pem_file('crypto/rsa_private.pem');
      var db_pwd;
      var decrypted;
      var pws;
      try {
        decrypted = decodeURIComponent(util.decrypt(private_pem, decodeURIComponent(token)));
        if (decrypted == '') throw new Error('Bad Token: ' + token);
        db_pwd = util.decrypt(private_pem, encrypted_db_pw);
        if (db_pwd == '') throw new Error('Bad DB Password: ' + encrypted_db_pw);
        pws = JSON.parse(decrypted);
      } catch(e) {
        console.log(e);
        pws = ['', ''];
      }

      if (pws[0] == db_pwd) {
        req.query.password = util.encrypt(public_pem, pws[1]);
        dbh.person().update(req.query, function(result) {
          res.json(result);
        });
      } else {
        res.json({err: wrong_old});
      }
    });
  } else {
    dbh.person().update(req.query, function(result) {
      res.json(result);
    });
  }
};

exports.deletePersonTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

exports.getArtistTable = function(req, res) {
  var artist_id = req.params.id;
  if (!artist_id) artist_id = req.query.id;

  var dbh = new db.Handle();

  if (artist_id) {
    dbh.artist().getById(artist_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: 'name' }};
    dbh.artist().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postArtistTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().create(req.body, function(result) {
    res.json(result);
  });
};

exports.putArtistTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().update(req.query, function(result) {
    res.json(result);
  });
};

exports.deleteArtistTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

exports.getSongTable = function(req, res) {
  var song_id = req.params.id;
  if (!song_id) song_id = req.query.id;

  var dbh = new db.Handle();

  if (song_id) {
    dbh.song().getById(song_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: 'name' }};
    dbh.song().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().create(req.body, function(result) {
    res.json(result);
  });
};

exports.putSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().update(req.query, function(result) {
    res.json(result);
  });
};

exports.deleteSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

exports.getBandMemberTable = function(req, res) {
  var band_member_id = req.params.id;
  if (!band_member_id) band_member_id = req.query.id;

  var dbh = new db.Handle();

  if (band_member_id) {
    dbh.band_member().getById(band_member_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: [ 'band_id', 'person_id' ] }};
    dbh.band_member().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postBandMemberTable = function(req, res) {
  var dbh = new db.Handle();
  var user = util.getUser(req);
  var person_id = req.body.person_id;

  if (person_id) {
    util.getBandMember(user.id, req.body.band_id, function(band_member) {
      if (user.system_admin || (band_member && band_member.band_admin)) {
        request.addBandMember({
          band_id: req.body.band_id,
          person_id: req.body.person_id,
          band_admin: false
        }, function(result) {
          res.json(result);
        });
      } else {
        res.json({err: 'Only band Admin may add members'});
      }
    });
  } else {
    request.joinBand({
      band_id: req.body.band_id,
      person_id: user.id
    }, function(result) {
      res.json(result);
    });
  }
};

exports.putBandMemberTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_member().update(req.query, function(result) {
    res.json(result);
  });
};

exports.deleteBandMemberTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_member().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

exports.getBandSongTable = function(req, res) {
  var band_song_id = req.params.id;
  if (!band_song_id) band_song_id = req.query.id;

  var dbh = new db.Handle();

  if (band_song_id) {
    dbh.band_song().getById(band_song_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: [ 'band_id', 'song_id' ] }};
    dbh.band_song().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postBandSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_song().create(req.body, function(result) {
    res.json(result);
  });
};

exports.putBandSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_song().update(req.query, function(result) {
    res.json(result);
  });
};

exports.deleteBandSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_song().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

exports.getSongRatingTable = function(req, res) {
  var song_rating_id = req.params.id;
  if (!song_rating_id) song_rating_id = req.query.id;

  var dbh = new db.Handle();

  if (song_rating_id) {
    dbh.song_rating().getById(song_rating_id, function(result) {
      res.json(result);
    });
  } else {
    var params = { sort: { order: [ 'band_member_id', 'band_song_id' ] }};
    dbh.song_rating().getAllWithArgs(params, function(result) {
      res.json(result);
    });
  }
};

exports.postSongRatingTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song_rating().create(req.body, function(result) {
    res.json(result);
  });
};

exports.putSongRatingTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song_rating().update(req.query, function(result) {
    res.json(result);
  });
};

exports.deleteSongRatingTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song_rating().deleteById(req.query.id, function(result) {
    res.json(result);
  });
};

// Requests
function request_is_self(result, user) {
  return user.system_admin || result.request.person_id == user.id;
};

function request_require_admin(action, result) {
  if (action == 'accept') {
    return result.request.request_type == constants.request_type.join_band;
  } else if (action == 'reopen' || action == 'delete') {
    result.request.request_type == constants.request_type.add_band_member;
  }
  return false;
};

function request_require_self(action, result) {
  if (action == 'accept') {
    result.request.request_type == constants.request_type.add_band_member;
  } else if (action == 'reopen' || action == 'delete') {
    return result.request.request_type == constants.request_type.join_band;
  }
  return false;
}; 

exports.createRequest = function(req, res) {
  var action = req.body.action;
  delete req.body.action;

  var  user = util.getUser(req);

  if (user) {
    if (action == 'join_band') {
      if (user.id == req.body.person_id) {
        request.joinBand(req.body, function(result) {
          res.json(result);
        });
      } else {
        res.json({err: 'Join requests can only be for logged in user'});
      }
    } else if (action == 'add_band_member') {
      util.getBandMember(user.id, req.body.band_id, function(band_member) {
        if (user.system_admin || (band_member && band_member.band_admin)) {
          request.addBandMember(req.body, function(result) {
            res.json(result);
          });
        } else {
          res.json({err: 'Only band Admin may add members'});
        }
      });
    } else {
      res.json({err: 'unrecognized action: ' + action});
    }
  } else {
    res.json(403, {err: 'Not logged in'});
  }
};

exports.getRequest = function(req, res) {
  var request_id = req.params.id;
  if (!request_id) request_id = req.query.id;

  if (request_id) {
    request.getById(req.query.id, function(result) {
      res.json(result);
    });
  } else {
    var  user = util.getUser(req);
    if (user) {
      request.getMyRequests(user.id, function(result) {
        res.json(result);
      });
    } else {
      res.json(403, {err: 'Not logged in'});
    }
  }
};

exports.updateRequest = function(req, res) {
  var request_id = req.params.id;
  if (!request_id) request_id = req.query.id;

  var user = util.getUser(req);
  var is_allowed = function(action, result, user, band_member) {
    if (request_require_admin(action, result)) {
      return util.is_admin(user, band_member);
    } else if (request_require_self(action, result)) {
      return request_is_self(result, user);
    } else if (action == 'reject') {
      return request_is_self(result, user) || util.is_admin(user, band_member);
    } else {
      return true;
    }
  };

  if (user) {
    request.getById(request_id, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        util.getBandMember(user.id, result.request.band_id, function(band_member) {
          var action = req.params.action;
          if (!action) action = req.query.action;

          if (is_allowed(action, result, user, band_member)) {
            if (action == 'reject') {
              result.request.reject(function(result) { res.json(result); });
            } else if (action == 'reopen') {
              result.request.reopen(function(result) { res.json(result); });
            } else if (action == 'accept') {
              result.request.accept(function(result) { res.json(result); });
            } else {
              res.json({err: 'unrecognized action: ' + action});
            }
          } else {
            res.json({err: 'Permission denied'});
          }
        });
      }
    });
  } else {
    res.json(403, {err: 'Not logged in'});
  }
};

exports.deleteRequest = function(req, res) {
  var dbh = new db.Handle();
  var user = util.getUser(req);

  var is_allowed = function(result, user, band_member) {
    if (result.request.status == constants.request_status.pending) return false;

    var action = 'delete';
    if (request_require_admin(action, result)) {
      return util.is_admin(user, band_member);
    } else if (request_require_self(action, result)) {
      return request_is_self(result, user);
    } else {
      return true;
    }
  };

  if (user) {
    request.getById(req.query.id, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        util.getBandMember(user.id, result.request.band_id, function(band_member) {

          if (is_allowed(result, user, band_member)) {
            dbh.request().deleteById(req.query.id, function(result) {
              res.json(result);
            });
          } else {
            res.json({err: 'Permission denied'});
          }
        });
      }
    });
  } else {
    res.json(403, {err: 'Not logged in'});
  }
};
