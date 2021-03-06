
/*
 * Database manipulation methods.
 */
var base64_decode = require('base64').decode;

var db_orm = require('../lib/db_orm');
var constants = require('../lib/constants');
var util = require('../lib/util');
var request = require('../lib/request');

function handleJSONResponse(res, err, result) {
  if(err) {
    //console.log(err);
    res.json(500, err);
  } else if (typeof result == 'function') {
    result();
  } else {
    res.json(200, result);
  }
}

exports.getModel = function(res, model_name, row_id, sort, result_key, opt_row_transform) {
  var row_transform = opt_row_transform || function(row) { return row; };
  var flatten = function(row) { return JSON.parse(JSON.stringify(row)); };
  if (row_id) {
    db_orm[model_name].get(row_id, function(err, row) {
      var result = {};
      if (!err) result[result_key] = row_transform(flatten(row));
      handleJSONResponse(res, err, result);
    });
  } else {
    db_orm[model_name].find(sort, function(err, rows) {
      var result = {};
      if (!err) {
        result['all_' + result_key + 's'] = rows.map(function(row) {
          return row_transform(flatten(row));
        });
      }
      handleJSONResponse(res, err, result);
    });
  }
}

function getPostData(model_name, options) {
  var data = {};
  db_orm.columns[model_name].forEach(function (column) {
    if (column != 'id' && column in options) {
      try {
        data[column] = JSON.parse(options[column]);
      } catch(e) {
        data[column] = options[column];
      };
    }
  });
  return data;
}

exports.postModel = function(res, model_name, options, result_key) {
  var data = getPostData(model_name, options);
  db_orm[model_name].create([data], function(err, rows) {
    var result = {};
    result[result_key] = rows ? rows[0] : {};
    handleJSONResponse(res, err, result);
  });
}

exports.putModel = function(res, model_name, options, result_key) {
  var model = db_orm[model_name];
  model.get(options.id, function(err, row) {
    handleJSONResponse(res, err, function() {
      var data = {};
      Object.keys(options).forEach(function(key) {
        try {
          data[key] = JSON.parse(options[key]);
        } catch(e) {
          data[key] = options[key];
        }
      });
      delete data['id'];
      row.save(data, function(err) {
        if (err) {
          handleJSONResponse(res, err, null);
        } else {
          model.get(options.id, function(err, new_row) {
            var result = {};
            result[result_key] = new_row;
            handleJSONResponse(res, err, result);
          });
        }
      });
    });
  });
}

exports.deleteModel = function(res, model_name, row_id, result_key) {
  db_orm[model_name].get(row_id, function(err, row) {
    handleJSONResponse(res, err, function() {
      row.remove(function(err) {
        var result = {};
        result[result_key] = {id: row_id};
        handleJSONResponse(res, err, result);
      });
    });
  });
}

exports.getSessionInfo = function(req, res) {
  var session = req.session.passport;
  //var node_util = require('util');
  //console.log(node_util.inspect(session));
  var user = JSON.parse(session.user);
  //console.log(user);

  this.getModel(res, 'Person', user.id, 'full_name', 'person');
};

exports.getBandTable = function(req, res) {
  var band_id = req.params.id;
  if (!band_id) band_id = req.query.id;
  this.getModel(res, 'Band', band_id, 'name', 'band');
};

exports.postBandTable = function(req, res) {
  this.postModel(res, 'Band', req.body, 'band');
};

exports.putBandTable = function(req, res) {
  this.putModel(res, 'Band', req.query, 'band');
};

exports.deleteBandTable = function(req, res) {
  this.deleteModel(res, 'Band', req.query.id, 'band');
};

exports.getPersonTable = function(req, res) {
  var person_id = req.params.id;
  if (!person_id) person_id = req.query.id;
  this.getModel(res, 'Person', person_id, 'full_name', 'person', function(row) {
    delete row.password;
    return row;
  });
};

exports.postPersonTable = function(req, res) {
  var password = req.body.password || 'password';
  var pem = util.get_pem_file('crypto/rsa_public.pem');
  req.body.password = util.encrypt(pem, password);
  req.body.system_admin = req.body.system_admin || false;
  req.body.session_expires = req.body.session_expires || 30;
  this.postModel(res, 'Person', req.body, 'person');
};

exports.putPersonTable = function(req, res) {
  if (req.query.token) {
    var token = req.query.token;
    delete req.query.token;

    db_orm.Person.get(req.query.id, function(err, row) {
      handleJSONResponse(res, err, function() {
        var wrong_old = 'Old password did not match';
        var encrypted_db_pw = row.password;
        var public_pem = util.get_pem_file('crypto/rsa_public.pem');
        var private_pem = util.get_pem_file('crypto/rsa_private.pem');
        var db_pwd;
        var decrypted;
        var pws;
        try {
          decrypted = base64_decode(decodeURIComponent(util.decrypt(private_pem, decodeURIComponent(token))));
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
          var data = JSON.parse(JSON.stringify(req.query));
          delete data['id'];
          row.save(data, function(err) {
            if (err) {
              handleJSONResponse(res, err, null);
            } else {
              db_orm.Person.get(req.query.id, function(err, new_row) {
                handleJSONResponse(res, err, {person: new_row});
              });
            }
          });
        } else {
          res.json(500, wrong_old);
        }
      });
    });
  } else {
    this.putModel(res, 'Person', req.query, 'person');
  }
};

exports.deletePersonTable = function(req, res) {
  this.deleteModel(res, 'Person', req.query.id, 'person');
};

exports.getArtistTable = function(req, res) {
  var artist_id = req.params.id;
  if (!artist_id) artist_id = req.query.id;
  this.getModel(res, 'Artist', artist_id, 'name', 'artist');
};

exports.postArtistTable = function(req, res) {
  this.postModel(res, 'Artist', req.body, 'artist');
};

exports.putArtistTable = function(req, res) {
  this.putModel(res, 'Artist', req.query, 'artist');
};

exports.deleteArtistTable = function(req, res) {
  this.deleteModel(res, 'Artist', req.query.id, 'artist');
};

exports.getSongTable = function(req, res) {
  var song_id = req.params.id;
  if (!song_id) song_id = req.query.id;
  this.getModel(res, 'Song', song_id, 'name', 'song');
};

exports.postSongTable = function(req, res) {
  this.postModel(res, 'Song', req.body, 'song');
};

exports.putSongTable = function(req, res) {
  this.putModel(res, 'Song', req.query, 'song');
};

exports.deleteSongTable = function(req, res) {
  this.deleteModel(res, 'Song', req.query.id, 'song');
};

exports.getBandMemberTable = function(req, res) {
  var band_member_id = req.params.id;
  if (!band_member_id) band_member_id = req.query.id;
  this.getModel(res, 'BandMember', band_member_id, ['band_id', 'person_id'], 'band_member');
};

exports.postBandMemberTable = function(req, res) {
  this.postModel(res, 'BandMember', req.body, 'band_member');
};

exports.putBandMemberTable = function(req, res) {
  this.putModel(res, 'BandMember', req.query, 'band_member');
};

exports.deleteBandMemberTable = function(req, res) {
  this.deleteModel(res, 'BandMember', req.query.id, 'band_member');
};

exports.getBandSongTable = function(req, res) {
  var band_song_id = req.params.id;
  if (!band_song_id) band_song_id = req.query.id;
  this.getModel(res, 'BandSong', band_song_id, ['band_id', 'song_id'], 'band_song');
};

exports.postBandSongTable = function(req, res) {
  var data = getPostData('BandSong', req.body);
  db_orm.BandSong.create([data], function(err, rows) {
    if (err) {
      res.json(500, err);
    } else {
      var result = {};
      result.band_song = rows ? rows[0] : {};
      db_orm.SongRating.find({band_song_id: result.band_song.id}, function(err, ratings) {
        debugger;//XXX
        if (err) {
          res.json(500, err);
        } else {
          result.song_ratings = ratings;
          handleJSONResponse(res, err, result);
        }
      });
    }
  });
};

exports.putBandSongTable = function(req, res) {
  this.putModel(res, 'BandSong', req.query, 'band_song');
};

exports.deleteBandSongTable = function(req, res) {
  this.deleteModel(res, 'BandSong', req.query.id, 'band_song');
};

exports.getSongRatingTable = function(req, res) {
  var song_rating_id = req.params.id;
  if (!song_rating_id) song_rating_id = req.query.id;
  this.getModel(res, 'SongRating', song_rating_id, ['band_member_id', 'band_song_id'], 'song_rating');
};

exports.postSongRatingTable = function(req, res) {
  this.postModel(res, 'SongRating', req.body, 'song_rating');
};

exports.putSongRatingTable = function(req, res) {
  req.query.is_new = false;
  this.putModel(res, 'SongRating', req.query, 'song_rating');
};

exports.deleteSongRatingTable = function(req, res) {
  this.deleteModel(res, 'SongRating', req.query.id, 'song_rating');
};

// Requests
function request_is_self(result, user) {
  return user.system_admin || result.person_id == user.id;
};

function request_require_admin(action, result) {
  if (action == 'accept') {
    return result.request_type == constants.request_type.join_band;
  } else if (action == 'reopen' || action == 'delete') {
    result.request_type == constants.request_type.add_band_member;
  }
  return false;
};

function request_require_self(action, result) {
  if (action == 'accept') {
    result.request_type == constants.request_type.add_band_member;
  } else if (action == 'reopen' || action == 'delete') {
    return result.request_type == constants.request_type.join_band;
  }
  return false;
};

exports.createRequest = function(req, res) {
  var action = req.params.action;

  var  user = util.getUser(req);

  if (user) {
    if (action == 'join_band') {
      if (user.id == req.body.person_id) {
        request.joinBand(req.body, function(err, result) {
          if (err) {
            res.json(err, result);
          } else {
            res.json(200, {request: result});
          }
        });
      } else {
        res.json(500, 'Join requests can only be for logged in user');
      }
    } else if (action == 'add_band_member') {
      util.getBandMember(user.id, req.body.band_id, function(err, band_member) {
        if (err) {
          res.json(500, err);
        } else if (user.system_admin || (band_member && band_member.band_admin)) {
          request.addBandMember(req.body, function(err, result) {
            if (err) {
              res.json(500, err);
            } else {
              res.json(200, {request: result});
            }
          });
        } else {
          res.json(500, 'Only band Admin may add members');
        }
      });
    } else {
      res.json(500, 'unrecognized action: ' + action);
    }
  } else {
    res.json(403, 'Not logged in');
  }
};

exports.getRequest = function(req, res) {
  var request_id = req.params.id;
  if (!request_id) request_id = req.query.id;

  if (request_id) {
    request.getById(req.query.id, function(err, result) {
      if (err) {
        res.json(err);
      } else {
        res.json(200, {request: result});
      }
    });
  } else {
    var  user = util.getUser(req);
    if (user) {
      request.getMyRequests(user.id, function(err, result) {
        if (err) {
          res.json(err);
        } else {
          res.json(200, {all_requests: result});
        }
      });
    } else {
      res.json(403, 'Not logged in');
    }
  }
};

exports.updateRequest = function(req, res) {
  var action = req.params.action;
  var request_id = req.query.id;

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

  request.getById(request_id, function(err, result) {
    if (err) {
      res.json(500, err);
    } else {
      util.getBandMember(user.id, result.band_id, function(err, band_member) {
        if (err) {
          res.json(500, err);
        } else {
          function stdHandler (err, result) {
            if (err) {
              res.json(500, err);
            } else {
              res.json(200, {request: result});
            }
          }

          if (is_allowed(action, result, user, band_member)) {
            if (action == 'reject') {
              result.reject(stdHandler);
            } else if (action == 'reopen') {
              result.reopen(stdHandler);
            } else if (action == 'accept') {
              result.accept(function(err, request) {
                if (err) {
                  res.json(500, request);
                } else {
                  util.getBandMember(request.person_id, request.band_id, function(err, new_member) {
                    if (err) {
                      res.json(500, new_member);
                    } else {
                      db_orm.SongRating.find({band_member_id: new_member.id}, function(err, ratings) {
                        if (err) {
                          res.json(500, ratings);
                        } else {
                          res.json(200, {
                            request: request,
                            band_member: new_member,
                            song_ratings: ratings
                          });
                        }
                      });
                    }
                  });
                }
              });
            } else {
              res.json(500, 'unrecognized action: ' + action);
            }
          } else {
            res.json(500, 'Permission denied');
          }
        }
      });
    }
  });
};

exports.deleteRequest = function(req, res) {
  var user = util.getUser(req);

  var is_allowed = function(result, user, band_member) {
    if (result.status == constants.request_status.pending) return false;

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
    request.getById(req.query.id, function(err, result) {
      if (err) {
        res.json(500, err);
      } else {
        util.getBandMember(user.id, result.band_id, function(err, band_member) {
          if (err) {
            res.json(500, err);
          } else if (is_allowed(result, user, band_member)) {
            this.deleteModel(res, 'Request', req.query.id, 'request');
          } else {
            res.json(403, 'Permission denied');
          }
        }.bind(this));
      }
    }.bind(this));
  } else {
    res.json(403, 'Not logged in');
  }
};
