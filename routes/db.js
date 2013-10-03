
/*
 * GET artist list
 */

var sqlite3 = require('sqlite3');
var flow = require('flow');
var fs = require('fs');
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

  getMemberBands(db, id, function(result) {
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
  db.close()
};

/* Internal Utilities */
logError = function(err, sql_text, sql_values) {
  console.log("Error " + err);
  console.log(err);
  console.log(sql_text);
  console.log(sql_values);
};

getBandId = function(req) {
  //console.log('URL:' + req.url);
  //console.log('URL Query:' + req.query);
  var band_id = req.query.band_id;
  //console.log('URL Band ID:' + band_id);
  return band_id;
};

getLoginPermissions = function(db, person_id, band_id, callback) {
  var person_sql_text = 'SELECT system_admin FROM person WHERE id = $1';
  var person_sql_values = [person_id];

  var member_sql_text = 'SELECT band_admin FROM band_member' +
                        ' WHERE person_id = $1 AND band_id = $2';
  var member_sql_values = [person_id, band_id];

  var sql_values = [person_id, band_id];

  var getPerms = flow.define(
    function(callback) {
      this.callback = callback;
      db.get(person_sql_text, person_sql_values, this);
    }, function(err, row) {
      if (err) {
        logError(err, person_sql_text, person_sql_values);
        this.callback({err: err})
      } else {
        this.person_id = person_id;
        this.is_sysadmin = row.system_admin;
        if (band_id) {
          this.band_id = band_id;
          db.get(member_sql_text, member_sql_values, this);
        } else {
          this(null, null);
        }
      }
    }, function(err, row) {
      if (err) {
        logError(err, member_sql_text, member_sql_values)
        this.callback({err: err});
      } else {
        var result = {
          person_id: this.person_id,
          is_sysadmin: this.is_sysadmin == 1,
          band_id: null,
          is_band_admin: null
        };
        if (row) {
          result.band_id = this.band_id;
          result.is_band_admin = row.band_admin == 1;
        }
        this.callback(result);
      }
    }
  );

  getPerms(callback);
};

getBand = function(db, band_id, callback) {
  var sql_text = 'SELECT * FROM band WHERE id = $1';
  var sql_values = [band_id];

  db.get(sql_text, sql_values, function(err, row) {
    if (err) {
      logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      callback({band: row});
    }
  });
};

getMemberBands = function(db, member_id, callback) {
  var sql_text = "SELECT band.* FROM band, band_member " +
    "WHERE band.id = band_member.band_id " +
    "AND band_member.person_id = $1 " +
    "ORDER BY band.name";

  var sql_values = [member_id];

  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      callback({member_bands: rows});
    }
  });
};

getOtherBands = function(db, member_id, callback) {
  var sql_text = "SELECT band.* FROM band " +
    "WHERE band.id NOT IN (SELECT band_id FROM band_member " +
    "WHERE band_member.person_id = $1)";
  
  var sql_values = [member_id];
  
  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      callback({other_bands: rows});
    }
  });
};

getArtists = function(db, callback) {
  var sql_text = 'SELECT artist.*, count(song.id) AS song_count ' +
    '  FROM artist ' +
    ' LEFT OUTER JOIN song ON (artist_id = artist.id) ' +
    ' GROUP BY artist.id ORDER BY artist.name';

  var sql_values = [];

  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      callback({artists: rows});
    }
  });
};

getBandSongs = function(db, person_id, band_id, sort_type, filters, callback) {
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

  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      callback({
        band_songs: rows,
        sort_type: sort_type,
        filters: filters
      });
    }
  });
};

getUnusedSongs = function(db, band_id, callback) {
  var sql_text = 'SELECT song.*, artist.name as artist_name, ' +
    ' song.name || \' by \' || artist.name as description ' +
    '  FROM song, artist ' +
    ' WHERE song.artist_id = artist.id ' +
    '   AND song.id not in ' +
    '(SELECT song_id FROM band_song WHERE band_id = $1)';

  var sql_values = [band_id];

  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      callback({unused_songs: rows});
    }
  });
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
      getLoginPermissions(db, person_id, null, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.permissions = result;
        getMemberBands(db, person_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.member_bands = result.member_bands;
        getOtherBands(db, person_id, this)
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        res.json({
          permissions: this.permissions,
          member_id: person_id,
          member_bands: this.member_bands,
          other_bands: result.other_bands
        });
      }
    }
  );

  getBands();
  db.close();
};

exports.bandPersons = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = getBandId(req);

  var db = new sqlite3.Database(db_name);

  var member_sql_text = 'SELECT person.id, person.full_name, person.email, ' +
    ' person.system_admin, band_member.band_admin' +
    '  FROM person, band_member ' +
    ' WHERE person.id = band_member.person_id ' +
    '   AND band_member.band_id = $1 ' +
    ' ORDER BY person.full_name, person.name';

  var member_sql_values = [band_id];

  var non_member_sql_text = 'SELECT id, full_name, email FROM person ' +
                            ' WHERE id not in ' +
                            '(SELECT person_id FROM band_member WHERE band_id = $1)';

  var non_member_sql_values = [band_id];

  //console.log('SQL:' + member_sql_text + ', ' + member_sql_values);
  var get_list = flow.define(
    function() {
      getLoginPermissions(db, person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.permissions = result;
        db.all(member_sql_text, member_sql_values, this);
      }
    }, function(err, rows) {
       if (err) {
         logError(err, member_sql_text, member_sql_values);
         res.json({err: err});
       } else {
         this.members = rows;
         db.all(non_member_sql_text, non_member_sql_values, this);
       }
    }, function(err, rows) {
      if (err) {
        logError(err, non_member_sql_text, non_member_sql_values);
        res.json({err: err});
      } else {
        this.non_members = rows;
        getBand(db, band_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        res.json({
          permissions: this.permissions,
          band_id: band_id,
          band: result.band,
          members: this.members,
          non_members: this.non_members
        });
      }
    }
  );

  get_list();
  db.close();
};

exports.artists = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = getBandId(req);
  var sql_text = "SELECT artist.* FROM artist ORDER BY artist.name";
  var sql_values = [];
  
  var db = new sqlite3.Database(db_name);

  var getArtistList = flow.define(
    function() {
      getLoginPermissions(db, person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.permissions = result;
        getArtists(db, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        result.permissions = this.permissions;
        res.json(result);
      }
    }
  );

  getArtistList();
  db.close();
};

exports.bandSongs = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = getBandId(req);
  var sort_type = req.query.sort_type;
  var filters_json = req.query.filters;
  var filters = filters_json ? JSON.parse(filters_json) : [];

  var db = new sqlite3.Database(db_name);

  var getSongs = flow.define(
    function() {
      getLoginPermissions(db, person_id, band_id, this);
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.permissions = result;
        getBandSongs(db, person_id, band_id, sort_type, filters, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.band_songs = result.band_songs;
        getArtists(db, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else {
        this.artists = result.artists;
        getUnusedSongs(db, band_id, this);
      }
    }, function(result) {
      if (result.err) {
        res.json(result);
      } else { 
        res.json({
          permissions: this.permissions,
          band_id: band_id,
          person_id: person_id,
          band_songs: this.band_songs,
          artists: this.artists,
          unused_songs: result.unused_songs,
          sort_type: sort_type,
          filters: filters
        });
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
      logError(err, sql_text, []);
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
      logError(err, sql_text, []);
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
  var band_id = getBandId(req);

  var db = new sqlite3.Database(db_name);

  var sql_text = 'BEGIN TRANSACTION; ' +
    getSongRatingDeleteSql(person_id, band_id) +
    getBandMemberDeleteSql(person_id, band_id) +
    'COMMIT; ';

  var sql_values = [];

  db.exec(sql_text, function(err) {
    if (err) {
      logError(err, sql_text, sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });
};

exports.removeMember = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = getBandId(req);
  var member_id = req.query.member_id;

  var db = new sqlite3.Database(db_name);

  var sql_text = 'BEGIN TRANSACTION; ' +
    getSongRatingDeleteSql(member_id, band_id) +
    getBandMemberDeleteSql(member_id, band_id) +
    'COMMIT; ';

  var sql_values = [];

  db.exec(sql_text, function(err) {
    if (err) {
      logError(err, sql_text, sql_values);
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
      logError(err, sql_text, sql_values);
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
      logError(err, sql_text, sql_values);
      res.json({err: err});
    } else {
      res.json({});
    }
  });
};