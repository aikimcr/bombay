
/*
 * Database library
 */

var sqlite3 = require('sqlite3');
var SqlGenerator = require('sql-generator');
var fs = require('fs');

var util = require('lib/util');

var db_name = null;
var log_errors = true;

exports.getDbPath = function() {
  return db_name;
};

exports.setDbPath = function(opt_path) {
  if (opt_path) {
    db_name = fs.realpathSync(opt_path);
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

exports.setLogDbErrors = function(state) {
  log_errors = state;
};

exports.Handle = function() {
  if (!db_name) {
    db_name = './bombay.db';
  }
  sqlite3.verbose();
  this.dbh_ = new sqlite3.Database(db_name, function(err) {
    if (err) {
      console.log(err);
      this.dbh_ = undef;
    }
  }.bind(this));
  this.dbh_.exec('PRAGMA foreign_keys = ON;');
  this.log_sql_ = false;
  this.log_errors_ = log_errors;
};

var Handle = exports.Handle;

Handle.prototype.setLogSql = function(state) {
  this.log_sql_ = state;
};

Handle.prototype.setLogErrors = function(state) {
  this.log_errors_ = state;
};

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
  if (this.log_errors_) {
    console.log("Error " + err);
    console.log(err);
    console.log(sql_text);
    console.log(sql_values);
  }
};

Handle.prototype.logSql = function(sql_text, sql_values) {
  if (this.log_sql_) {
    console.log('------------------------------------------------');
    console.log('SQL: "' + sql_text + '"');
    console.log(sql_values);
    console.log('------------------------------------------------');
  }
};

Handle.prototype.doSqlQuery = function(sql_text, sql_values, result_key, callback) {
  this.logSql(sql_text, sql_values);
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
  this.logSql(sql_text, sql_values);
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
  this.logSql(sql_text, sql_values);
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
  this.logSql(sql_text, []);

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

var Table = function(db, table_name, default_sort, opt_default_fields) {
  this.db_ = db;
  this.table_name_ = table_name;
  this.default_sort_ = default_sort;
  this.default_fields_ = opt_default_fields || '*';
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
    var value = args[arg_keys[i]];
    if (value === false || value == 'false') value = 0;
    if (value === true || value == 'true') value = 1;
    sql_values.push(value);
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

Table.prototype.getAllWithArgs = function(args, callback) {
  var sqlgen = new SqlGenerator();
  var fields = this.default_fields_;
  var sort = this.default_sort_;
  var where = {};

  if (args.where)  where = args.where;
  if (args.sort) sort = args.sort;
  if (args.fields)  fields = args.fields;

  var stmt = sqlgen.select(this.table_name_, fields, where, sort);
  var result_key = 'all_' + this.table_name_ + 's';
  this.db_.doSqlQuery(stmt.sql, stmt.values, result_key, callback);
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
    var value = data[fields[field]];
    if (value === false || value == 'false') value = 0;
    if (value === true || value == 'true') value = 1;
    sql_values.push(value);
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

var Person = function(db) {
  Table.call(this, db, 'person', 'full_name');
};
inherits(Person, Table);

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

var Song = function(db) {
  Table.call(this, db, 'song', 'name');
};
inherits(Song, Table);

var BandMember = function(db) {
  Table.call(this, db, 'band_member', 'band_id');
};
inherits(BandMember, Table);

var BandSong = function(db) {
  Table.call(this, db, 'band_song', 'band_id');
};
inherits(BandSong, Table);

var SongRating = function(db) {
  Table.call(this, db, 'song_rating', 'band_member_id');
};
inherits(SongRating, Table);
