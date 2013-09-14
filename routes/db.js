
/*
 * GET artist list
 */

var sqlite3 = require('sqlite3');
var flow = require('flow');
var db_name = '/opt/allnightmusic/db/band/bombay.db';

/* Special Selects */
exports.getMemberBands = function(id, callback) {
  var sql_text = 'SELECT band.* FROM band, band_member WHERE band.id = band_member.band_id and band_member.person_id = $1';
  var sql_values = [id];
  var db = new sqlite3.Database(db_name);
  db.all(sql_text, sql_values, function(err, rows) {
    if (err) {
      throw err;
    } else {
      callback(rows);
    }
  });
  db.close()
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

getLoginPermissions = function(db, band_id, callback) {
  var person_id = req.session.passport.user;
  var person_sql_text = 'SELECT system_admin FROM person WHERE id = $1';
  var person_sql_values = [person_id];

  var member_sql_text = 'SELECT band_admin FROM band_member' +
                        ' WHERE person_id = $1 AND band_id = $2';
  var member_sql_values = [person_id, band_id];

  var sql_values = [person_id, band_id];

  var getPerms = flow.define(
    function() {
      db.get(person_sql_text, person.sql_values, this);
    }, function(err, row) {
      if (err) {
        logError(err, person_sql_text, person_sql_values);
        callback({err: err})
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
        callback({err: err});
      } else {
        var result = {
          person_id: this.person_id,
          is_sysadmin: this.is_sysadmin
        };
        if (row) {
          result[band_id] = this.band_id;
          result[is_band_admin] = row.band_admin;
        }
        callback(result);
      }
    }
  );

  getPerms(person_id, band_id);
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

  var sql_text = "SELECT band.* FROM band, band_member " +
    "WHERE band.id = band_member.band_id " +
    "AND band_member.person_id = $1 " +
    "ORDER BY band.name";

  var sql_values = [person_id];
  //console.log('SQL:' + sql_text + ', ' + sql_values);

  var db = new sqlite3.Database(db_name);
  db.all(sql_text, sql_values, function(err, rows) {
   //console.log('Rows:' + rows);
   res.json({
     'member_id': person_id,
     'member_bands': rows
   });
  });
  db.close();
};

exports.bandPersons = function(req, res) {
  var band_id = getBandId(req);

  var db = new sqlite3.Database(db_name);

  var member_sql_text = "SELECT person.full_name, person.email, person.system_admin FROM person, band_member " +
    "WHERE person.id = band_member.person_id " +
    "AND band_member.band_id = $1 " +
    "ORDER BY person.full_name, person.name";

  var member_sql_values = [band_id];

  var non_member_sql_text = 'SELECT id, full_name, email FROM person ' +
                            ' WHERE id not in ' +
                            '(SELECT person_id FROM band_member WHERE band_id = $1)';

  var non_member_sql_values = [band_id];

  //console.log('SQL:' + member_sql_text + ', ' + member_sql_values);
  var get_list = flow.define(
    function() {
      db.all(member_sql_text, member_sql_values, this);
    }, function(err, rows) {
       if (err) {
         console.log(member_sql_text + ', ' + band_id);
         console.log(err);
       }
       var members = rows;
       db.all(non_member_sql_text, non_member_sql_values, function(err, rows) {
         if (err) {
           console.log(non_member_sql_text + ', ' + band_id);
           console.log(err);
         }
         res.json({
           'band_id': band_id,
           'members': members,
           'non_members': rows
         });
       })
    }
  );

  get_list();
  db.close();
};

exports.artists = function(req, res) {
  var sql_text = "SELECT artist.* FROM artist ORDER BY artist.name";
  var sql_values = [];
  
  var db = new sqlite3.Database(db_name);
  db.all(sql_text, sql_values, function(err, rows) {
   //console.log('Rows:' + rows);
   res.json({
     'artists': rows
   });
  });
  db.close();
};

exports.bandSongs = function(req, res) {
  var person_id = req.session.passport.user;
  var band_id = getBandId(req);

  //console.log(person_id + ', ' + band_id);

  var sql = {
    band_songs: {
      sql: 'SELECT song.*, artist.name AS artist_name, song_rating.rating, band_song.song_status, band_song.id as band_song_id' +
           '  FROM song, artist, song_rating, band_song ' +
           ' WHERE song.artist_id = artist.id ' +
           '   AND song_rating.band_song_id = band_song.id ' +
           '   AND band_song.song_id = song.id ' +
           '   AND band_song.band_id = $1 ' +
           '   AND song_rating.person_id = $2 ' +
           ' ORDER BY song.name, artist.name',
      values: [band_id, person_id]
    },
    avg_rating: {
      sql: 'SELECT band_song_id, AVG(rating) AS avg_rating  FROM song_rating, band_song ' +
           ' WHERE band_song.band_id = $1 AND band_song.id = song_rating.band_song_id ' +
           ' GROUP BY band_id, band_song_id',
      values: [band_id]
    },
    artists: {
      sql: 'SELECT artist.* FROM artist ORDER BY artist.name',
      values: []
    },
    unused_songs: {
      sql: 'SELECT song.*, artist.name as artist_name FROM song, artist ' +
           ' WHERE song.artist_id = artist.id ' +
           '   AND song.id not in ' +
           '(SELECT song_id FROM band_song WHERE band_id = $1)',
      values: [band_id]
    },
  };

  //console.log(sql);

  var db = new sqlite3.Database(db_name);
  var exec_sql = function(def, callback) {
    //console.log('Exec SQL: ' + def.sql + ', Values: ' + def.values);
    db.all(def.sql, def.values, callback);
  };

  var get_song_page = flow.define(
    function() {
      //console.log('get band_songs');
      exec_sql(sql.band_songs, this);
    }, function(err, rows) {
      if (err) res.json(err);
      //console.log('get avg_rating');
      this.band_songs = rows;
      exec_sql(sql.avg_rating, this);
    }, function(err, rows) {
      if (err) res.json(err);
      //console.log('apply avg_rating');
      var ratings = {};
      rows.forEach(function(row) {
        ratings[row.band_song_id] = row.avg_rating;
      });
      this.band_songs.forEach(function(band_song) {
        if (ratings[band_song.band_song_id]) {
          band_song.avg_rating = ratings[band_song.band_song_id];
        } else {
          band_song.avg_rating = 0;
        }
      });

      //console.log('get artists');
      exec_sql(sql.artists, this);
    }, function(err, rows) {
      if (err) res.json(err);
      //console.log('get unused songs');
      this.artists = rows;
      exec_sql(sql.unused_songs, this);
    }, function(err, rows) {
      if (err) res.json(err);
      //console.log('return values');
      this.unused_songs = rows;

      this.unused_songs.forEach(function(song) {
        song.description = song.name + ' by ' + song.artist_name;
      });

      res.json({
        band_id: band_id,
        person_id: person_id,
        band_songs: this.band_songs,
        artists: this.artists,
        unused_songs: this.unused_songs
      });
    }
  );

  //console.log('execute flow');
  get_song_page();

  db.close();
};

/* editor API Links */
exports.createBand = function(req, res) {
  var person_id = req.session.passport.user;
  var band_name = req.body.band_name;

  var band_sql_text = 'INSERT INTO band (name) VALUES ($1)';
  var band_sql_values = [band_name];
  var member_sql_text = 'INSERT INTO band_member ' +
    '("band_id", "person_id") VALUES (' +
    '(SELECT "id" FROM "band" WHERE "name" == $1),' +
    '$2)';
  //console.log(member_sql_text);
  var member_sql_values = [band_name, person_id];
  //console.log(member_sql_values);

  var db = new sqlite3.Database(db_name);

  var do_update = flow.define(
    function() {
      db.run(band_sql_text, band_sql_values, this);
    }, function(err, rows) {
      if (err) {
        console.log('Error: '  + err);
        console.log(err);
        console.log(band_sql_text);
        console.log(band_sql_values);
        res.json({err: err});
      } else {
        db.run(member_sql_text, member_sql_values, this);
      }
    }, function(err, rows) {
      if (err) {
        console.log('Error: '  + err);
        console.log(err);
        console.log(member_sql_text);
        console.log(member_sql_values);
        res.json({err: err});
      } else {
        res.json({});
      }
    }
  );

  do_update();
  db.close();
};

exports.addMember = function(req, res) {
  var data = req.body;

  var band_sql_text = 'INSERT INTO band_member (band_id, person_id) VALUES ($1, $2)';

  var band_sql_values = [data.band_id, data.person_id];

  var rating_sql_text = 'INSERT INTO song_rating (person_id, band_song_id) '+
    'SELECT person.id as person_id, band_song.id as band_song_id FROM person, band_song ' +
    ' WHERE person.id = $1 AND band_song.band_id = $2';

  var rating_sql_values = [data.person_id, data.band_id];
  var db = new sqlite3.Database(db_name);

  var doUpdate = flow.define(
    function() {
      db.run(band_sql_text, band_sql_values, this);
    }, function(err, rows) {
      if (err) {
        console.log("Error: " + err);
        console.log(err);
        console.log(band_sql_text);
        console.log(band_sql_values);
        res.json({err: err});
      } else {
        db.run(rating_sql_text, rating_sql_values, this);
      }
    }, function(err, rows) {
      if (err) {
        console.log("Error: " + err);
        console.log(err);
        console.log(rating_sql_text);
        console.log(rating_sql_values);
        res.json({err: err});
      } else {
        res.json({});
      }
    }
  );

  doUpdate();
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
