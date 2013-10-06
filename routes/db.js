
/*
 * Database manipulation methods.
 */

var sqlite3 = require('sqlite3');
var flow = require('flow');
var fs = require('fs');
var util = require('../routes/util');
var db_name = null;

exports.getDbPath = function() {
  return db_name;
};

exports.setDbPath = function(opt_path) {
  if (opt_path) {
    db_name = opt_path;
  } else {
    var path_list = [
        '/opt/allnightmusic/db/band/bombay.db',
        './bombay.db'
      ];
      
    path_list.forEach(function(path) {
        if (fs.existsSync(path)) {
          db_name = path;
        }
    });
  }
};

/* Special Selects */
exports.getBandsForMenu = function(id, callback) {
  var db = new sqlite3.Database(db_name);

  exports.getMemberBands(db, id, function(result) {
    if (result.err) {
      throw result.err;
    } else {
      callback(result.member_bands);
    }
  });

  db.close();
};

exports.getPersonByName = function(name, callback) {
  var sql_text = 'SELECT person.* FROM person WHERE name = $1';
  var sql_values = [name];
  var db = new sqlite3.Database(db_name);
  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      throw err;
    } else {
      callback(rows[0]);
    }
  });
  db.close();
};

/* Internal Utilities */
exports.logDbError = function(err, sql_text, sql_values) {
  console.log("Error " + err);
  console.log(err);
  console.log(sql_text);
  console.log(sql_values);
};

exports.doSqlQuery = function(db, sql_text, sql_values, result_key, callback) {
  db.all(sql_text, sql_values, function(err, rows) {
    if(err) {
      exports.logDbError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      var result = {};
      result[result_key] = rows;
      callback(result);
    }
  });
};

exports.doSqlGet = function(db, sql_text, sql_values, result_key, callback) {
  db.get(sql_text, sql_values, function(err, row) {
    if(err) {
      exports.logDbError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      var result = {};
      result[result_key] = row;
      callback(result);
    }
  });
};

exports.getLoginPermissions = function(db, person_id, band_id, callback) {
  var person_sql_text = 'SELECT id as person_id, system_admin as is_sysadmin FROM person WHERE id = $1';
  var person_sql_values = [person_id];

  var member_sql_text = 'SELECT id as band_id, band_admin as is_band_admin FROM band_member' +
                        ' WHERE person_id = $1 AND band_id = $2';
  var member_sql_values = [person_id, band_id];

  var getPerms = flow.define(
    function(callback) {
      this.callback = callback;
      exports.doSqlGet(db, person_sql_text, person_sql_values, 'person', this);
    }, function(result) {
      if (result.err) {
        this.callback(result)
      } else {
        result.person.is_sysadmin = result.person.is_sysadmin !== 0 ? true : false;
        this.result = result.person;
        if (band_id) {
          this.band_id = band_id;
          exports.doSqlGet(db, member_sql_text, member_sql_values, 'band', this);
        } else {
          this({band:{band_id: null, is_band_admin: null}});
        }
      }
    }, function(result) {
      if (result.err) {
        this.callback(result);
      } else {
        if (result.band.is_band_admin !== null) {
          result.band.is_band_admin = result.band.is_band_admin !== 0 ? true : false;
        }
        this.result = util.obj_merge(this.result, result.band);
        this.callback(this.result);
      }
    }
  );

  getPerms(callback);
};

exports.getBand = function(db, band_id, callback) {
  var sql_text = 'SELECT * FROM band WHERE id = $1';
  var sql_values = [band_id];

  exports.doSqlGet(db, sql_text, sql_values, 'band', callback);
};

exports.getMemberBands = function(db, member_id, callback) {
  var sql_text = "SELECT band.* FROM band, band_member " +
    "WHERE band.id = band_member.band_id " +
    "AND band_member.person_id = $1 " +
    "ORDER BY band.name";

  var sql_values = [member_id];

  exports.doSqlQuery(db, sql_text, sql_values, 'member_bands', callback);
};

exports.getOtherBands = function(db, member_id, callback) {
  var sql_text = "SELECT band.* FROM band " +
    "WHERE band.id NOT IN (SELECT band_id FROM band_member " +
    "WHERE band_member.person_id = $1)";
  
  var sql_values = [member_id];
  
  exports.doSqlQuery(db, sql_text, sql_values, 'other_bands', callback);
};

exports.getAllBands = function(db, callback) {
  var sql_text = "SELECT * FROM band";
  var sql_values = [];
  
  exports.doSqlQuery(db, sql_text, sql_values, 'all_bands', callback);
};

exports.getBandMembers = function(db, band_id, callback) {
  var sql_text = 'SELECT person.id, person.full_name, person.email, ' +
    ' person.system_admin, band_member.band_admin' +
    '  FROM person, band_member ' +
    ' WHERE person.id = band_member.person_id ' +
    '   AND band_member.band_id = $1 ' +
    ' ORDER BY person.full_name, person.name';

  var sql_values = [band_id];
  
  exports.doSqlQuery(db, sql_text, sql_values, 'band_members', callback);
};

exports.getNonBandMembers = function(db, band_id, callback) {
  var sql_text = 'SELECT id, full_name, email FROM person ' +
    ' WHERE id not in (SELECT person_id FROM band_member WHERE band_id = $1) ' +
    ' ORDER BY full_name';
    
  var sql_values = [band_id];
  
  exports.doSqlQuery(db, sql_text, sql_values, 'non_band_members', callback);
};

exports.getAllPeople = function(db, callback) {
  var sql_text = 'SELECT id, full_name, email, system_admin FROM person ' +
    ' ORDER BY full_name';
    
  var sql_values = [];
  
  exports.doSqlQuery(db, sql_text, sql_values, 'all_people', callback);
};

exports.getArtists = function(db, callback) {
  var sql_text = 'SELECT artist.*, count(song.id) AS song_count ' +
    '  FROM artist ' +
    ' LEFT OUTER JOIN song ON (artist_id = artist.id) ' +
    ' GROUP BY artist.id ORDER BY artist.name';

  var sql_values = [];

  exports.doSqlQuery(db, sql_text, sql_values, 'artists', callback);
};

exports.getBandSongs = function(db, person_id, band_id, sort_type, filters, callback) {
  var sql_text = 'SELECT song.name, artist.name AS artist_name, ' +
   'band_song.id as band_song_id, ' +
   'band_song.song_status, a.rating, avg(b.rating) as avg_rating ' +
   '  FROM song, artist, song_rating a, song_rating b, band_song ' +
   ' WHERE band_song.song_id = song.id AND song.artist_id = artist.id ' +
   '   AND a.band_song_id = band_song.id AND b.band_song_id = a.band_song_id ' +
   '   AND a.person_id = $1 AND band_song.band_id = $2 ';
  
  if (filters.song_name) {
    sql_text += ' AND song.name LIKE \'%' + filters.song_name + '%\'';
  }
  
  if (filters.artist_id) {
    sql_text += ' AND song.artist_id = ' + filters.artist_id;
  }
  
  sql_text += ' GROUP BY a.band_song_id ';
  
  var sort_types = { 
    'song_name': 'ORDER BY song.name, artist.name',
    'song_name_rev': 'ORDER BY song.name desc, artist.name desc',
    'artist_name': 'ORDER BY artist.name, song.name',
    'artist_name_rev': 'ORDER BY artist.name desc, song.name desc',
    'average_rating': 'ORDER BY avg_rating, a.rating',
    'average_rating_rev': 'ORDER BY avg_rating desc, a.rating desc'
  };

  sql_text += sort_types[sort_type];
  var sql_values = [person_id, band_id];

  exports.doSqlQuery(db, sql_text, sql_values, 'band_songs', function(result) {
    if(result.err) {
      callback(err);
    } else {
      callback(util.obj_merge(result, {
        sort_type: sort_type,
        filters: filters
      }));
    }
  });
};

exports.getOtherSongs = function(db, band_id, callback) {
  var sql_text = 'SELECT song.*, artist.name as artist_name, ' +
    ' song.name || \' by \' || artist.name as description ' +
    '  FROM song, artist ' +
    ' WHERE song.artist_id = artist.id ' +
    '   AND song.id not in ' +
    '(SELECT song_id FROM band_song WHERE band_id = $1)';

  var sql_values = [band_id];

  exports.doSqlQuery(db, sql_text, sql_values, 'other_songs', callback);
};

/* JSON API Links */
exports.personProfile = function(req, res) {
  var person_id = req.session.passport.user;

  var db = new sqlite3.Database(db_name);
  var sql_text = "SELECT person.* FROM person WHERE id = $1";
  var sql_values = [person_id];
  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      console.log("Error " + err);
      console.log(err);
      console.log(sql_text);
      console.log(sql_values);
      res.json({err: err});
  } else {
      res.json({
        'person': rows[0]
      });
    }
  });
};

exports.memberBands = function(req, res) {
  var person_id = req.session.passport.user;

  var db = new sqlite3.Database(db_name);

  var getBands = flow.define(
    function() {
      this.result = {member_id: person_id};
      exports.getLoginPermissions(db, person_id, null, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, {permissions: result});
        exports.getMemberBands(db, person_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        exports.getOtherBands(db, person_id, this);
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
  db.close();
};

exports.bandMembers = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;

  var db = new sqlite3.Database(db_name);

  var get_list = flow.define(
    function() {
      this.result = {band_id: band_id};
      exports.getLoginPermissions(db, person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, {permissions: result});
        exports.getBandMembers(db, band_id, this);
      }
    }, function(result) {
       if (result.err) {
         res.json(result);
       } else {
         this.result = util.obj_merge(this.result, result);
         exports.getNonBandMembers(db, band_id, this);
       }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        exports.getBand(db, band_id, this);
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
  db.close();
};

exports.artists = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;
  var sql_text = "SELECT artist.* FROM artist ORDER BY artist.name";
  var sql_values = [];
  
  var db = new sqlite3.Database(db_name);

  var getArtistList = flow.define(
    function() {
      exports.getLoginPermissions(db, person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = ({permissions: result});
        exports.getArtists(db, this);
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
  db.close();
};

exports.bandSongs = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;
  var sort_type = req.query.sort_type;
  var filters_json = req.query.filters;
  var filters = filters_json ? JSON.parse(filters_json) : [];

  var db = new sqlite3.Database(db_name);

  var getSongs = flow.define(
    function() {
      this.result = {
        band_id: band_id,
        person_id: person_id,
        sort_type: sort_type,
        filters: filters
      };

      exports.getLoginPermissions(db, person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, {permissions: result});
        exports.getBandSongs(db, person_id, band_id, sort_type, filters, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        exports.getArtists(db, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.result = util.obj_merge(this.result, result);
        exports.getOtherSongs(db, band_id, this);
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
  db.close();
};

/* editor API Links */
exports.createBand = function(req, res) {
  var person_id = req.session.passport.user;
  var band_name = req.body.band_name;

  var created_band_id = 'SELECT id FROM band WHERE name = \'' + band_name + '\'';
  var sql_text_list = [
    'BEGIN TRANSACTION;',
    'INSERT INTO band (name) VALUES (\'' + band_name + '\');',
    'INSERT INTO band_member (band_id, person_id, band_admin) VALUES (' +
      '(' + created_band_id + '), ' + person_id + ', 1);',
    'INSERT INTO song_rating (person_id, band_song_id) '+
    'SELECT person.id as person_id, band_song.id as band_song_id FROM person, band_song ' +
    ' WHERE person.id = \'' + person_id + '\' AND band_song.band_id = (' + created_band_id + ');',
    'COMMIT;'
  ];

  var sql_text = sql_text_list.join('\n');
  
  var db = new sqlite3.Database(db_name);

  db.exec(sql_text, function(err) {
    if (err) {
      exports.logDbError(err, sql_text, []);
      res.json({err: err});
    }
    else {
      res.json({});
    }
  });

  db.close();
};

exports.addMember = function(req, res) {
  var data = req.body;

  var sql_text_list = [
    'BEGIN TRANSACTION;',
    'INSERT INTO band_member (band_id, person_id) VALUES (' + data.band_id + ', ' + data.person_id + ');',
    'INSERT INTO song_rating (person_id, band_song_id) ' +
      'SELECT person.id as person_id, band_song.id as band_song_id FROM person, band_song ' +
      ' WHERE person.id = ' + data.person_id + ' AND band_song.band_id = ' + data.band_id + ';',
    'COMMIT;'
  ];
  
  var sql_text = sql_text_list.join('\n');

  var db = new sqlite3.Database(db_name);

  db.exec(sql_text, function(err) {
    if (err) {
      exports.logDbError(err, sql_text, []);
      res.json({err: err});
    }
    else {
      res.json({});
    }
  });

  db.close();
};

exports.createPerson = function(req, res) {
  var data = req.body;

  var member_sql_text = 'INSERT INTO person (name, full_name) VALUES ($1, $2)';
  var member_sql_values = [data.name, data.full_name];


  var db = new sqlite3.Database(db_name);

  db.run(member_sql_text, member_sql_values, function(err, rows) {
  if (err) {
    console.log("Error: " + err);
    console.log(err);
    console.log(member_sql_text);
    console.log(member_sql_values);
    res.json({err: err});
  } else {
    res.json({});
  }
  });

  db.close();
};

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

exports.createArtist = function(req, res) {
  var data = req.body;

  var sql_text = 'INSERT INTO artist (name) VALUES ($1)';
  var sql_values = [data.artist_name];

  var db = new sqlite3.Database(db_name);

  db.run(sql_text, sql_values, function(err, rows) {
    if (err) {
      console.log("Error: " + err);
      console.log(err);
      console.log(sql_text);
      console.log(sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });

  db.close();
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

exports.createSong = function(req, res) {
  var data = req.body;

  var db = new sqlite3.Database(db_name);
  var sql_text = 'INSERT INTO song (name, artist_id) VALUES($1, $2)';
  var sql_values = [data.song_name, data.artist_id];

  db.run(sql_text, sql_values, function(err, rows) {
    if (err) {
      console.log('Error ' + err);
      console.log(err);
      console.log(sql_text);
      console.log(sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });

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
}

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

exports.removeMember = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = req.query.band_id;
  var member_id = req.query.member_id;

  var db = new sqlite3.Database(db_name);

  var sql_text = 'BEGIN TRANSACTION; ' +
    getSongRatingDeleteSql(member_id, band_id) +
    getBandMemberDeleteSql(member_id, band_id) +
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