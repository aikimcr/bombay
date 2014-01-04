
/*
 * Database manipulation methods.
 */
var flow = require('flow');
var db = require('lib/db');
var util = require('lib/util');

exports.getSessionInfo = function(req, res) {
  var session = req.session.passport;
  var dbh = new db.Handle();
  dbh.person().getById(session.user, function(result) {
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
      var db_pw = result.person.password;
      var decrypted = util.strMapCharsToStr(db_pw, token);
      var pws;
      try {
        pws = JSON.parse(decrypted);
      } catch(e) {
        pws = ['', ''];
      }

      if (pws[0] == db_pw) {
        req.query.password = pws[1];
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
  dbh.band_member().create(req.body, function(result) {
    res.json(result);
  });
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
