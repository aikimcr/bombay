
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

// editor API Links
/*
exports.updatePersonProfile = function(req, res) {
  var data = req.body;

  var sql_text = 'UPDATE person SET name = $1, full_name = $2, email = $3';
  var sql_values = [data.name, data.full_name, data.email];

  var id_param = "$4";
  if (data.new_password) {
    sql_text = sql_text + ', password = $4';
    sql_values.push(data.new_password);
    id_param = "$5";
  }

  sql_text = sql_text + ' WHERE id = ' + id_param;
  sql_values.push(data.id);

  var db = new sqlite3.Database(db_name);

  db.run(sql_text, sql_values);

  db.close();

  res.redirect('/#person_profile');
};

exports.addSong = function(req, res) {
  var data = req.body;

  var band_song_sql_text = 'INSERT INTO band_song (band_id, song_id) VALUES ($1, $2)';
  var band_song_sql_values = [data.band_id, data.song_id];

  var song_rating_sql_text = 'INSERT INTO song_rating (person_id, band_song_id) ' +
                             'SELECT band_member.person_id, band_song.id' +
                             '  FROM band_member, band_song' +
                             ' WHERE band_member.band_id = band_song.band_id' +
                             '   AND band_song.band_id = $1' +
                             '   AND band_song.song_id = $2';

  var song_rating_sql_values = [data.band_id, data.song_id];

  var db = new sqlite3.Database(db_name);

  var addTheSong = flow.define(
    function(err, rows) {
      db.run(band_song_sql_text, band_song_sql_values, this);
    }, function (err, rows) {
      if (err) {
        console.log("Error " + err);
        console.log(err);
        console.log(band_song_sql_text);
        console.log(band_song_sql_values);
        res.json({err: err});
      } else {
        db.run(song_rating_sql_text, song_rating_sql_values, this);
      }
    }, function(err, rows) {
      if (err) {
        console.log("Error " + err);
        console.log(err);
        console.log(song_rating_sql_text);
        console.log(song_rating_sql_values);
        res.json({err: err});
      } else {
        res.json({});
      }
    }
  );

  addTheSong();

  db.close();
};

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

exports.updateSongStatus = function(req, res) {
  var person_id = req.session.passport.user;
  var data = req.body;

  var db = new sqlite3.Database(db_name);
  var update_sql_text = 'UPDATE band_song SET song_status = $1 WHERE id = $2';
  var update_sql_values = [data.song_status, data.band_song_id];

  db.run(update_sql_text, update_sql_values, function(err, rows) {
    if (err) {
      console.log('Error on update ' + err);
      console.log(sql_text);
      console.log(sql_values);
      res.json({err: err});
    } else {
      res.json({
        band_song_id: data.band_song_id,
        song_status: data.song_status
      });
    }
  });

  db.close();
};

// Deletes
getSongRatingDeleteSql = function(person_id, band_id) {
  return 'DELETE FROM song_rating WHERE person_id = ' + person_id + 
    ' AND band_song_id IN ' +
    '(SELECT id FROM band_song WHERE band_id = ' + band_id + '); ';
};

getBandMemberDeleteSql = function(person_id, band_id) {
  return 'DELETE FROM band_member WHERE person_id = ' + person_id +
    ' AND band_id = ' + band_id + '; ';
};

exports.removeBand = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;

  var db = new sqlite3.Database(db_name);

  var sql_text = 'BEGIN TRANSACTION; ' +
    getSongRatingDeleteSql(person_id, band_id) +
    getBandMemberDeleteSql(person_id, band_id) +
    'COMMIT; ';

  var sql_values = [];

  db.exec(sql_text, function(err) {
    if (err) {
      exports.logDbError(err, sql_text, sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });
};

exports.deleteArtist = function(req, res) {
  var artist_id = req.query.artist_id;

  var db = new sqlite3.Database(db_name);

  var sql_text = 'BEGIN TRANSACTION; ' +
    'DELETE FROM artist WHERE id = ' + artist_id + '; ' +
    'COMMIT; ';

  var sql_values = [];

  db.exec(sql_text, function(err) {
    if (err) {
      exports.logDbError(err, sql_text, sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });
};

exports.removeSong = function(req, res) {
  var band_song_id = req.query.band_song_id;

  var db = new sqlite3.Database(db_name);

  var sql_text = 'BEGIN TRANSACTION; ' +
    'DELETE FROM song_rating WHERE band_song_id = ' + band_song_id + '; ' +
    'DELETE FROM band_song WHERE id = ' + band_song_id + '; ' +
    'COMMIT; ';

  var sql_values = [];

  db.exec(sql_text, function(err) {
    if (err) {
      exports.logDbError(err, sql_text, sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });
};
*/
