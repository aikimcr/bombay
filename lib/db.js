
/*
 * Database library
 */

var sqlite3 = require('sqlite3');
var fs = require('fs');

var util = require('lib/util');

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

exports.Handle = function() {
  if (!db_name) {
    db_name = './bombay.db';
  }
  this.dbh_ = new sqlite3.Database(db_name);
};

var Handle = exports.Handle;

Handle.prototype.close = function() {
  this.dbh_.close();
  delete this.dbh_;
};

Handle.prototype.beginTransaction = function(callback) {
  this.dbh_.run('BEGIN TRANSACTION', callback);
};

Handle.prototype.rollback = function(callback) {
  this.dbh_.run('ROLLBACK', callback);
};

Handle.prototype.errorAndRollback = function(err, callback) {
  var result = {err: err};
  this.rollback(function(err) {
    if (err) {
      result.err2 = err;
    } else {
      callback(result);
    }
  });
};

Handle.prototype.commit = function(callback) {
  this.dbh_.run('COMMIT', callback);
};

Handle.prototype.logError = function(err, sql_text, sql_values) {
  console.log("Error " + err);
  console.log(err);
  console.log(sql_text);
  console.log(sql_values);
};

Handle.prototype.doSqlQuery = function(sql_text, sql_values, result_key, callback) {
  var db = this;
  this.dbh_.all(sql_text, sql_values, function(err, rows) {
    if(err) {
      db.logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      var result = {};
      result[result_key] = rows;
      callback(result);
    }
  });
};

Handle.prototype.doSqlGet = function(sql_text, sql_values, result_key, callback) {
  var db = this;
  this.dbh_.get(sql_text, sql_values, function(err, row) {
    if(err) {
      db.logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      var result = {};
      result[result_key] = row;
      callback(result);
    }
  });
};

Handle.prototype.doSqlRun = function(sql_text, sql_values, result_key, callback) {
  var db = this;
  this.dbh_.run(sql_text, sql_values, function(err) {
    if(err) {
      db.logError(err, sql_text, sql_values);
      callback({err: err});
    } else {
      var result = {};
      if (this.lastID) {
	result[result_key] = this.lastID;
      } else if (this.changes) {
	result[result_key] = this.changes;
      } else {
	result[result_key] = null;
      }

      callback(result);
    }
  });
};

Handle.prototype.doSqlExec = function(sql_list, callback) {
  var sql_text

  if (sql_list instanceof Array) {
    sql_text = sql_list.join('\n');
  } else {
    sql_text = sql_list;
  }

  var db = this;
  this.dbh_.exec(sql_text, function(err) {
    if (err) {
      db.logError(err, sql_text, []);
      callback(err);
    }
    else {
      callback(null);
    }
  });
};

Handle.prototype.band = function() {
  return new Band(this);
};

Handle.prototype.artist = function() {
  return new Artist(this);
};

Handle.prototype.person = function() {
  return new Person(this);
};

Handle.prototype.song = function() {
  return new Song(this);
};

Handle.prototype.band_member = function() {
  return new BandMember(this);
};

Handle.prototype.band_song = function() {
  return new BandSong(this);
};

Handle.prototype.song_rating = function() {
  return new SongRating(this);
};

var Table = function(db, table_name, default_sort) {
  this.db_ = db;
  this.table_name_ = table_name;
  this.default_sort_ = default_sort;
};

Table.prototype.table_name_ = null;

Table.prototype.create = function(args, callback) {
  var arg_keys = Object.keys(args);
  var fields = arg_keys.join(',');
  var placeholders = [];
  var sql_values = [];
  for(var i=0; i < arg_keys.length; i++) {
    var place = i + 1;
    placeholders.push('$' + place);
    sql_values.push(args[arg_keys[i]]);
  }
  var placeholder_string = placeholders.join(',');
  var sql_text = 'INSERT INTO ' + this.table_name_ + ' (' + fields + ')' +
    ' VALUES (' + placeholder_string + ')';

  var result_key = this.table_name_ + '_id';
  this.db_.doSqlRun(sql_text, sql_values, result_key, callback);
};

Table.prototype.deleteById = function(id, callback) {
  var sql_text = 'DELETE FROM ' + this.table_name_ + ' WHERE id = $1';
  var sql_values = [id];
  var result_key = this.table_name_;
  this.db_.doSqlRun(sql_text, sql_values, result_key, callback);
};

Table.prototype.getById = function(id, callback) {
  var sql_text = 'SELECT * FROM ' + this.table_name_ + ' WHERE id = $1';
  var sql_values = [id];
  var result_key = this.table_name_;
  this.db_.doSqlGet(sql_text, sql_values, result_key, callback);
};

Table.prototype.getAll = function(callback) {
  var sql_text = 'SELECT * FROM ' + this.table_name_ +
    ' ORDER BY ' + this.default_sort_;

  var sql_values = [];
  var result_key = 'all_' + this.table_name_ + 's';
  this.db_.doSqlQuery(sql_text, sql_values, result_key, callback);
};

Table.prototype.update = function(data, callback) {
  var sets = [];
  var sql_values = [];
  var id = data.id;
  delete data.id;
  var fields = Object.keys(data);
  var sql_id = 0;
  for(var field=0; field < fields.length; field++) {
    sql_idx = field + 1;
    sets.push(fields[field] + ' = $' + sql_idx);
    sql_values.push(data[fields[field]]);
  }
  sql_idx++;
  sql_values.push(id);

  var sql_text = 'UPDATE ' + this.table_name_ + ' SET ' + sets.join(', ') +
    ' WHERE id = $' + sql_idx;

  var result_key = this.table_name_;
  this.db_.doSqlRun(sql_text, sql_values, result_key, callback);
};

function inherits(target, source) {
  for (var k in source.prototype)
    target.prototype[k] = source.prototype[k];
}

var Band = function(db) {
  Table.call(this, db, 'band', 'name');
};

inherits(Band, Table);

Band.prototype.getsByPersonId = function(person_id, callback) {
  var sql_text = 'SELECT band.* FROM band, band_member ' +
    'WHERE band.id = band_member.band_id ' +
    'AND band_member.person_id = $1 ' +
    'ORDER BY band.name';

  var sql_values = [person_id];
  this.db_.doSqlQuery(sql_text, sql_values, 'person_bands', callback);
};

Band.prototype.getsByNotPersonId = function(person_id, callback) {
  var sql_text = 'SELECT band.* FROM band ' +
    'WHERE band.id NOT IN (SELECT band_id FROM band_member ' +
    'WHERE band_member.person_id = $1)' +
    'ORDER BY band.name';
  
  var sql_values = [person_id];
  
  this.db_.doSqlQuery(sql_text, sql_values, 'other_bands', callback);
};

var Artist = function(db) {
  Table.call(this, db, 'artist', 'name');
};

inherits(Artist, Table);

Artist.prototype.getAllWithSongCount = function(callback) {
  var sql_text = 'SELECT artist.*, count(song.id) AS song_count FROM artist ' +
    'LEFT OUTER JOIN song ON artist.id = song.artist_id ' +
    'GROUP BY artist.name ORDER BY artist.name';

  var sql_values = [];
  this.db_.doSqlQuery(sql_text, sql_values, 'artists', callback);
};

var Person = function(db) {
  Table.call(this, db, 'person', 'name');
};

inherits(Person, Table);

Person.prototype.getLoginPermissions = function(person_id, band_id, callback) {
  var sql_text = 'SELECT person.id as person_id, system_admin';
  var band_member_fields = ', band_member.band_id, band_member.band_admin ';
  var from_text = ' FROM person';
  var band_join = ' LEFT OUTER JOIN band_member ON person.id = band_member.person_id';
  var person_where = ' WHERE person.id = $1';
  var band_where = ' AND band_member.band_id = $2';
  var sql_values = [person_id];

  if (band_id) {
    sql_text += band_member_fields + from_text + band_join + person_where + band_where;
    sql_values.push(band_id);
  } else {
    sql_text += from_text + person_where;
  }

  this.db_.doSqlGet(sql_text, sql_values, 'permissions', function(result) {
    if (result.err) {
      callback(result);
    } else {
      var permissions = result.permissions;
      if (!permissions.band_id) {
	permissions.band_id = null;
	permissions.band_admin = null;
      }
      callback(permissions);
    }
  });
};

Person.prototype.getByUsername = function(username, callback) {
  var sql_text = 'SELECT * FROM person WHERE name = $1';
  var sql_values = [username];
  this.db_.doSqlGet(sql_text, sql_values, 'person', callback);
};

var Song = function(db) {
  Table.call(this, db, 'song', 'name');
};

inherits(Song, Table);

Song.prototype.getBandList = function(person_id, band_id, sort_type, filters, callback) {
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

  this.db_.doSqlQuery(sql_text, sql_values, 'band_songs', function(result) {
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

Song.prototype.getOtherSongs = function(band_id, callback) {
  var sql_text = 'SELECT song.*, artist.name as artist_name, ' +
    ' song.name || \' by \' || artist.name as description ' +
    '  FROM song, artist ' +
    ' WHERE song.artist_id = artist.id ' +
    '   AND song.id not in ' +
    '(SELECT song_id FROM band_song WHERE band_id = $1)';

  var sql_values = [band_id];
  this.db_.doSqlQuery(sql_text, sql_values, 'other_songs', callback);
};

var BandMember = function(db) {
  Table.call(this, db, 'band_member', 'band_id');
};

inherits(BandMember, Table);

BandMember.prototype.getsByBandId = function(band_id, callback) {
  var sql_text = 'SELECT person.id, person.full_name, person.email, ' +
    ' person.system_admin, band_member.band_admin' +
    '  FROM person, band_member ' +
    ' WHERE person.id = band_member.person_id ' +
    '   AND band_member.band_id = $1 ' +
    ' ORDER BY person.full_name, person.name';

  var sql_values = [band_id];
  this.db_.doSqlQuery(sql_text, sql_values, 'band_members', callback);
};

BandMember.prototype.getsByNotBandId = function(band_id, callback) {
  var sql_text = 'SELECT id, full_name, email FROM person ' +
    ' WHERE id not in (SELECT person_id FROM band_member WHERE band_id = $1) ' +
    ' ORDER BY full_name';
    
  var sql_values = [band_id];
  this.db_.doSqlQuery(sql_text, sql_values, 'non_band_members', callback);
};

BandMember.prototype.getByPersonAndBandId = function(person_id, band_id, callback) {
  var sql_text = 'SELECT * FROM band_member WHERE person_id = $1 AND band_id = $2';
  var sql_values = [person_id, band_id];
  this.db_.doSqlGet(sql_text, sql_values, 'band_member', callback);
};

BandMember.prototype.deleteByPersonAndBandId = function(person_id, band_id, callback) {
  var sql_text = 'DELETE FROM band_member WHERE person_id = $1 AND band_id = $2';
  var sql_values = [person_id, band_id];
  this.db_.doSqlRun(sql_text, sql_values, 'band_member', callback);
};

var BandSong = function(db) {
  Table.call(this, db, 'band_song', 'band_id');
};

inherits(BandSong, Table);

var SongRating = function(db) {
  Table.call(this, db, 'song_rating', 'person_id');
};

inherits(SongRating, Table);

SongRating.prototype.addForBandMember = function(person_id, band_id, callback) {
  var sql_text = 'INSERT INTO song_rating (person_id, band_song_id) ' +
    'SELECT $1, id FROM band_song WHERE band_id = $2 ORDER BY id';

  var sql_values = [person_id, band_id];
  this.db_.doSqlRun(sql_text, sql_values, 'last_song_rating_id', callback);
};

SongRating.prototype.getForBandMember = function(person_id, band_id, callback) {
  var sql_text = 'SELECT * FROM song_rating WHERE person_id = $1 ' +
    'AND band_song_id IN (SELECT id FROM band_song WHERE band_id = $2)';

  var sql_values = [person_id, band_id];
  this.db_.doSqlQuery(sql_text, sql_values, 'member_ratings', callback);
};

SongRating.prototype.deleteForBandMember = function(person_id, band_id, callback) {
  var sql_text = 'DELETE FROM song_rating WHERE person_id = $1 ' +
    'AND band_song_id in (SELECT id FROM band_song WHERE band_id = $2)';

  var sql_values = [person_id, band_id];
  this.db_.doSqlRun(sql_text, sql_values, 'song_rating', callback);
};

SongRating.prototype.addForSong = function(song_id, band_id, callback) {
  var sql_text = 'INSERT INTO song_rating (person_id, band_song_id) ' +
    'SELECT band_member.person_id, band_song.id FROM band_member, band_song ' + 
    'WHERE band_member.band_id = $1 ' +
    'AND band_song.band_id = $2 AND band_song.song_id = $3';

  var sql_values = [band_id, band_id, song_id];
  this.db_.doSqlRun(sql_text, sql_values, 'last_song_rating_id', callback);
};

SongRating.prototype.getForSong = function(song_id, band_id, callback) {
  var sql_text = 'SELECT * FROM song_rating WHERE band_song_id IN ' +
    '(SELECT id FROM band_song WHERE song_id = $1 AND band_id = $2)';

  var sql_values = [song_id, band_id];
  this.db_.doSqlQuery(sql_text, sql_values, 'song_ratings', callback);
};

SongRating.prototype.deleteForSong = function(song_id, band_id, callback) {
  var sql_text = 'DELETE FROM song_rating WHERE band_song_id IN ' +
    '(SELECT id FROM band_song WHERE song_id = $1 AND band_id = $2)';

  var sql_values = [song_id, band_id];
  this.db_.doSqlRun(sql_text, sql_values, 'song_rating', callback);
};

SongRating.prototype.getForPersonAndBandSong = function(person_id, band_song_id, callback) {
  var sql_text = 'SELECT * FROM song_rating WHERE person_id = $1 AND band_song_id = $2';
  var sql_values = [person_id, band_song_id];
  this.db_.doSqlGet(sql_text, sql_values, 'song_rating', callback);
};

SongRating.prototype.updateForPersonAndBandSong = function(person_id, band_song_id, rating, callback) {
  var sql_text = 'UPDATE song_rating SET rating = $1 WHERE person_id = $2 AND band_song_id = $3';
  var sql_values = [rating, person_id, band_song_id];
  this.db_.doSqlRun(sql_text, sql_values, 'song_rating', callback);
};

SongRating.prototype.getForPersonWithAverage = function(person_id, band_song_id, callback) {
  var sql_text = 'SELECT a.person_id, a.band_song_id, a.rating, avg(b.rating) as average_rating' +
                 '  FROM song_rating a, song_rating b' +
                 ' WHERE a.band_song_id = b.band_song_id' +
                 '   AND a.person_id = $1 AND b.band_song_id = $2' +
                 ' GROUP BY a.band_song_id';

  var sql_values = [person_id, band_song_id];
  this.db_.doSqlGet(sql_text, sql_values, 'song_rating', callback);
};
