
/*
 * Database library
 */

var sqlite3 = require('sqlite3');
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
  return new Table(this, 'band', 'name');
};

Handle.prototype.artist = function() {
  return new Table(this, 'artist', 'name');
};

Handle.prototype.person = function() {
  return new Table(this, 'person', 'name');
};

Handle.prototype.song = function() {
  return new Table(this, 'song', 'name');
};

Handle.prototype.band_member = function() {
  return new Table(this, 'band_member', 'band_id');
};

Handle.prototype.band_song = function() {
  return new Table(this, 'band_song', 'band_id');
};

Handle.prototype.song_rating = function() {
  return new Table(this, 'song_rating', 'person_id');
};

exports.Table = function(db, table_name, default_sort) {
  this.db_ = db;
  this.table_name_ = table_name;
  this.default_sort_ = default_sort;
};

var Table = exports.Table;

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
