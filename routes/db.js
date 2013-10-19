
/*
 * Database manipulation methods.
 */
var flow = require('flow');
var db = require('lib/db');
var util = require('lib/util');

/* JSON API Links */
exports.personProfile = function(req, res) {
  var person_id = req.session.passport.user;
  var dbh = new db.Handle();
  dbh.person().getById(person_id, function(result) {
    res.json(result);
  });
};

exports.createPerson = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().create(req.body, function(result) {
    res.json(result);
  });
};

exports.updatePerson = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().update(req.body, function(result) {
    res.json(result);
  });
};

exports.removePerson = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().deleteById(req.query.person_id, function(result) {
    res.json(result);
  });
};

exports.bandInfoForPerson = function(req, res) {
  var person_id = req.session.passport.user;
  var dbh = new db.Handle();

  var getBands = flow.define(
    function() {
      this.result = {};
      dbh.person().getLoginPermissions(person_id, null, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
	dbh.band().getsByPersonId(person_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
	dbh.band().getsByNotPersonId(person_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        res.json(this.result);
     }
    }
  );

  getBands();
};

exports.createBand = function(req, res) {
  var person_id = req.session.passport.user;
  var dbh = new db.Handle();

  var createTheBand = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band().create(req.body, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	var data = {
	  person_id: person_id,
	  band_id: result.band_id,
	  band_admin: true
	};
	dbh.band_member().create(data, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  createTheBand();
};

exports.removeBand = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().deleteById(req.query.band_id, function(result) {
    res.json(result);
  });
};

exports.bandMemberInfo = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;
  var dbh = new db.Handle();

  var get_list = flow.define(
    function() {
      this.result = {};
      dbh.person().getLoginPermissions(person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        dbh.band_member().getsByBandId(band_id, this);
      }
    }, function(result) {
       if (result.err) {
         res.json(result);
       } else {
         this.result = util.obj_merge(this.result, result);
	 dbh.band_member().getsByNotBandId(band_id, this);
       }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
	dbh.band().getById(band_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        res.json(this.result);
      }
    }
  );

  get_list();
};

exports.addBandMember = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_member().create(req.body, function(result) {
    res.json(result);
  });
};

exports.removeBandMember = function(req, res) {
  var dbh = new db.Handle();
  var band_id = req.query.band_id;
  var person_id = req.query.person_id;

  var deleteMember = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.song_rating().deleteForBandMember(person_id, band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.band_member().deleteByPersonAndBandId(person_id, band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  deleteMember();
};

exports.artistInfo = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;
  var dbh = new db.Handle();

  var getArtistList = flow.define(
    function() {
      this.result = {};
      dbh.person().getLoginPermissions(person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.artist().getAllWithSongCount(this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        res.json(this.result);
      }
    }
  );

  getArtistList();
};

exports.createArtist = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().create(req.body, function(result) {
    res.json(result);
  });
};

exports.removeArtist = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().deleteById(req.query.artist_id, function(result) {
    res.json(result);
  });
};

exports.songInfo = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;
  var sort_type = req.query.sort_type;
  var filters_json = req.query.filters;
  var filters = filters_json ? JSON.parse(filters_json) : [];

  var dbh = new db.Handle();

  var getSongs = flow.define(
    function() {
      this.result = {
        sort_type: sort_type,
        filters: filters
      };

      dbh.person().getLoginPermissions(person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        dbh.song().getBandList(person_id, band_id, sort_type, filters, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        dbh.artist().getAll(this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        dbh.song().getOtherSongs(band_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        res.json(this.result);
      }
    }
  );

  getSongs();
};

exports.createSong = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().create(req.body, function(result) {
    res.json(result);
  });
};

exports.addBandSong = function(req, res) {
  var dbh = new db.Handle();

  var addSong = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band_song().create(req.body, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.song_rating().addForSong(this.result.song_id, req.body.band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  addSong();
};

exports.updateBandSongStatus = function(req, res) {
  var dbh = new db.Handle();
  var data = {
    id: req.body.id,
    song_status: req.body.song_status
  };

  var updateStatus = flow.define(
    function() {
      this.result = { band_song_id: data.id };
      dbh.band_song().update(data, this);
    }, function(result) {
      if (result.err) {
	res.json(result);
      } else {
	dbh.band_song().getById(this.result.band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	res.json(err);
      } else {
	this.result.song_status = result.band_song.song_status;
	res.json(this.result);
      }
    }
  );

  updateStatus();
};

exports.removeBandSong = function(req, res) {
  var dbh = new db.Handle();
  var band_song_id = req.query.band_song_id;
  var band_id = req.query.band_id;

  var removeSong = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band_song().getById(band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.song_id = result.band_song.song_id;
	dbh.song_rating().deleteForSong(this.song_id, band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.band_song().deleteById(band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  removeSong();
};

exports.removeSong = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().deleteById(req.query.song_id, function(result) {
    res.json(result);
  });
};

// editor API Links
/*
exports.updateSongRating = function(req, res) {
  var person_id = req.session.passport.user;
  var data = req.body;

  var db = new sqlite3.Database(db_name);
  var update_sql_text = 'UPDATE song_rating SET rating = $1' +
                 ' WHERE person_id = $2 AND band_song_id = $3';
  var update_sql_values = [data.rating, person_id, data.band_song_id];
  var get_sql_text = 'SELECT a.rating, avg(b.rating) as average_rating' +
             '  FROM song_rating a, song_rating b' +
             ' WHERE a.band_song_id = b.band_song_id ' +
             '   AND a.person_id = $1 ' +
             '   AND a.band_song_id = $2 ' +
             ' GROUP BY a.band_song_id';
  
  var get_sql_values = [person_id, data.band_song_id];

  db.serialize(function() {
    db.run(update_sql_text, update_sql_values, function(err, rows) {
      if(err) {
        console.log('Error on update ' + err);
        console.log(err);
        console.log(sql_text);
        console.log(sql_values);
        res.json({err: err});
      }
    });
    db.all(get_sql_text, get_sql_values, function(err, rows) {
      if (err) {
        res.json({err: err});
      } else {
        res.json({
          band_song_id: data.band_song_id,
          song_rating: rows[0]
        });
      }
    });
  });

  db.close();
};

*/
