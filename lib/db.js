
/*
 * Database library
 */

var sqlite3 = require('sqlite3');
var SqlGenerator = require('sql-generator');
var fs = require('fs');
var flow = require('flow');

var inherits = require('lib/util').inherits;

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

Handle.prototype.request = function() {
  return new Request(this);
};

var Table = function(db, table_name, default_sort, opt_default_fields) {
  this.db_ = db;
  this.table_name_ = table_name;
  this.default_sort_ = default_sort;
  this.default_fields_ = opt_default_fields || '*';
};

Table.check_create_keys = function(args, keys) {
  var missing_args = [];

  keys.forEach(function(key) {
    if (!(key in args)) {
      missing_args.push(key);
    }
  });

  return missing_args;
};

Table.compare_update_args = function(is_create, current, args, compare, keys) {
  var match = true;

  keys.forEach(function(key) {
    if (key in args) {
      if (compare[key] != args[key]) {
        match = false;
      }
    } else if (! is_create) {
      if (compare[key] != current[key]) {
        match = false;
      }
    }
  });

  return match;
};

Table.prototype.table_name_ = null;

Table.prototype.validate = function(is_create, args, callback) {
  callback({});
};

Table.prototype.create = function(args, callback) {
  var creator = flow.define(
    function(table_object, args, callback) {
      this.table_object = table_object;
      this.args = args;
      this.callback = callback;
      var validation = this.table_object.validate(true, args, this);
    },
    function(validation) {
      if ('err' in validation) {
        this.callback(validation);
      } else {
        this(this.table_object, this.args, this.callback);
      }
    },
    function(table_object, args, callback) {
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
      var sql_text = 'INSERT INTO ' + table_object.table_name_ + ' (' + fields + ')' +
        ' VALUES (' + placeholder_string + ')';

      var result_key = table_object.table_name_ + '_id';
      table_object.db_.doSqlRun(sql_text, sql_values, result_key, callback);
    }
  );

  creator(this, args, callback);
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
  var sort = { order: this.default_sort_ };
  var where = {};

  if (args.where)  where = args.where;
  if (args.sort) sort = args.sort;
  if (args.fields)  fields = args.fields;

  var stmt = sqlgen.select(this.table_name_, fields, where, sort);
  var result_key = 'all_' + this.table_name_ + 's';
  this.db_.doSqlQuery(stmt.sql, stmt.values, result_key, callback);
};

Table.prototype.update = function(data, callback) {
  var updater = flow.define(
    function(table_object, data, callback) {
      this.table_object = table_object;
      this.data = data;
      this.callback = callback;
      this.table_object.validate(false, data, this);
    },
    function(validation) {
      if ('err' in validation) {
        this.callback(validation);
      } else {
        this(this.table_object, this.data, this.callback);
      }
    },
    function(table_object, data, callback) {
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

      var sql_text = 'UPDATE ' + table_object.table_name_ + ' SET ' + sets.join(', ') +
        ' WHERE id = $' + sql_idx;

      var result_key = table_object.table_name_;
      table_object.db_.doSqlRun(sql_text, sql_values, result_key, callback);
    }
  );

  updater(this, data, callback);
};

var Band = function(db) {
  Table.call(this, db, 'band', 'name');
};
inherits(Band, Table);

Band.prototype.validate = function(is_create, args, callback) {
  if (is_create) {
    var missing_keys = Table.check_create_keys(args, ['name']);
    if (missing_keys.length > 0) {
      callback({
        err: 'Band Create missing key(s): ' + missing_keys.join(',')
      });
      return;
    }
  }
  if ('name' in args) {
    this.getAllWithArgs({ where: { name: args['name'] } }, function(result) {
      if ('all_bands' in result && result.all_bands && result.all_bands.length > 0) {
        callback({err: 'Band \'' + args['name'] + '\' already exists'});
      } else {
        callback({});
      }
    }.bind(this));
  } else {
    callback({});
  }
};

var Person = function(db) {
  Table.call(this, db, 'person', 'full_name');
};
inherits(Person, Table);

Person.prototype.validate = function(is_create, args, callback) {
  if (is_create) {
    var missing_keys = Table.check_create_keys(args, ['name']);
    if (missing_keys.length > 0) {
      callback({
        err: 'Person Create missing key(s): ' + missing_keys.join(',')
      });
      return;
    }
  }
  if ('name' in args) {
    this.getAllWithArgs({ where: { name: args['name'] } }, function(result) {
      if ('all_persons' in result && result.all_persons && result.all_persons.length > 0) {
        callback({err: 'Person \'' + args['name'] + '\' already exists'});
      } else {
        callback({});
      }
    }.bind(this));
  } else {
    callback({});
  }
};

var Artist = function(db) {
  Table.call(this, db, 'artist', 'name');
};
inherits(Artist, Table);

Artist.prototype.validate = function(is_create, args, callback) {
  if (is_create) {
    var missing_keys = Table.check_create_keys(args, ['name']);
    if (missing_keys.length > 0) {
      callback({
        err: 'Artist Create missing key(s): ' + missing_keys.join(',')
      });
      return;
    }
  }
  if ('name' in args) {
    this.getAllWithArgs({ where: { name: args['name'] } }, function(result) {
      if ('all_artists' in result && result.all_artists && result.all_artists.length > 0) {
        callback({err: 'Artist \'' + args['name'] + '\' already exists'});
      } else {
        callback({});
      }
    }.bind(this));
  } else {
    callback({});
  }
};

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

Song.prototype.getArtistName_ = function(artist_id, callback) {
  var artist_handle = this.db_.artist();
  artist_handle.getById(artist_id, function(result) {
    if (result.artist.name == null) {
      callback('<unknown artist ' + artist_id + '>');
    } else {
      callback(result.artist.name);
    }
  });
};

Song.prototype.validate = function(is_create, args, callback) {
  if (is_create) {
    var missing_keys = Table.check_create_keys(args, ['name', 'artist_id']);
    if (missing_keys.length > 0) {
      callback({
        err: 'Song Create missing key(s): ' + missing_keys.join(',')
      });
      return;
    }
  }
  if ('name' in args || 'artist_id' in args) {
    var where_args = {};
    if ('name' in args) { where_args.name = args.name; }
    if ('artist_id' in args) { where_args.artist_id = args.artist_id; }
    this.getAllWithArgs({ where: where_args }, function(result) {
      if ('all_songs' in result && result.all_songs && result.all_songs.length > 0) {
        for(var i = 0; i < result.all_songs.length; i++) {
          var song = result.all_songs[i];
          var match = Table.compare_update_args(
            is_create,
            this,
            args,
            song,
            ['name', 'artist_id']
          );

          if (match) {
            this.getArtistName_(song.artist_id, function(artist_name) {
              callback({err: 'Song \'' + args.name + '\' by \'' +
                        artist_name + '\' already exists'});
            })
          } else {
            callback({});
          }
        }
      } else {
        callback({});
      }
    }.bind(this));
  } else {
    callback({});
  }
};

var BandMember = function(db) {
  Table.call(this, db, 'band_member', 'band_id');
};
inherits(BandMember, Table);

BandMember.prototype.getPersonName_ = function(person_id, callback) {
  var person_handle = this.db_.person();
  person_handle.getById(person_id, function(result) {
    if (result.person.name == null) {
      callback('<unknown person ' + person_id + '>');
    } else {
      callback(result.person.name);
    }
  });
};

BandMember.prototype.getBandName_ = function(band_id, callback) {
  var band_handle = this.db_.band();
  band_handle.getById(band_id, function(result) {
    if (result.band.name == null) {
      callback('<unknown band ' + band_id + '>');
    } else {
      callback(result.band.name);
    }
  });
};

BandMember.prototype.validate = function(is_create, args, callback) {
  if (is_create) {
    var missing_keys = Table.check_create_keys(args, ['person_id', 'band_id']);
    if (missing_keys.length > 0) {
      callback({
        err: 'Band Member Create missing key(s): ' + missing_keys.join(',')
      });
      return;
    }
  }
  if ('person_id' in args || 'band_id' in args) {
    var where_args = {};
    if ('person_id' in args) { where_args.person_id = args.person_id; }
    if ('band_id' in args) { where_args.band_id = args.band_id; }
    this.getAllWithArgs({ where: where_args }, function(result) {
      if ('all_band_members' in result && result.all_band_members && result.all_band_members.length > 0) {
        for(var i = 0; i < result.all_band_members.length; i++) {
          var band_member = result.all_band_members[i];
          var match = Table.compare_update_args(
            is_create,
            this,
            args,
            band_member,
            ['person_id', 'band_id']          );

          if (match) {
            var do_msg = flow.define(
              function(table_object, person_id, band_id, callback) {
                this.table_object = table_object;
                this.person_id = person_id;
                this.band_id = band_id;
                this.callback = callback;
                this.table_object.getPersonName_(this.person_id, this);
              },
              function(person_name) {
                this.person_name = person_name;
                this.table_object.getBandName_(this.band_id, this);
              },
              function(band_name) {
                this.band_name = band_name;
                this.callback({err: 'Band Member \'' + this.person_name + '\' in \'' +
                               this.band_name + '\' already exists'});
              }
            );
            do_msg(this, band_member.person_id, band_member.band_id, callback);
          } else {
            callback({});
          }
        }
      } else {
        callback({});
      }
    }.bind(this));
  } else {
    callback({});
  }
};

var BandSong = function(db) {
  Table.call(this, db, 'band_song', 'band_id');
};
inherits(BandSong, Table);

BandSong.prototype.getSongName_ = function(song_id, callback) {
  var song_handle = this.db_.song();
  song_handle.getById(song_id, function(result) {
    if (result.song.name == null) {
      callback('<unknown song ' + song_id + '>');
    } else {
      callback(result.song.name);
    }
  });
};

BandSong.prototype.getBandName_ = function(band_id, callback) {
  var band_handle = this.db_.band();
  band_handle.getById(band_id, function(result) {
    if (result.band.name == null) {
      callback('<unknown band ' + band_id + '>');
    } else {
      callback(result.band.name);
    }
  });
};

BandSong.prototype.validate = function(is_create, args, callback) {
  if (is_create) {
    var missing_keys = Table.check_create_keys(args, ['song_id', 'band_id']);
    if (missing_keys.length > 0) {
      callback({
        err: 'Band Song Create missing key(s): ' + missing_keys.join(',')
      });
      return;
    }
  }
  if ('song_id' in args || 'band_id' in args) {
    var where_args = {};
    if ('song_id' in args) { where_args.song_id = args.song_id; }
    if ('band_id' in args) { where_args.band_id = args.band_id; }
    this.getAllWithArgs({ where: where_args }, function(result) {
      if ('all_band_songs' in result && result.all_band_songs && result.all_band_songs.length > 0) {
        for(var i = 0; i < result.all_band_songs.length; i++) {
          var band_song = result.all_band_songs[i];
          var match = Table.compare_update_args(
            is_create,
            this,
            args,
            band_song,
            ['song_id', 'band_id']
          );

          if (match) {
            var do_msg = flow.define(
              function(table_object, song_id, band_id, callback) {
                this.table_object = table_object;
                this.song_id = song_id;
                this.band_id = band_id;
                this.callback = callback;
                this.table_object.getSongName_(this.song_id, this);
              },
              function(song_name) {
                this.song_name = song_name;
                this.table_object.getBandName_(this.band_id, this);
              },
              function(band_name) {
                this.band_name = band_name;
                this.callback({err: 'Band Song \'' + this.song_name + '\' in \'' +
                               this.band_name + '\' already exists'});
              }
            );
            do_msg(this, band_song.song_id, band_song.band_id, callback);
          } else {
            callback({});
          }
        }
      } else {
        callback({});
      }
    }.bind(this));
  } else {
    callback({});
  }
};

var SongRating = function(db) {
  Table.call(this, db, 'song_rating', 'band_member_id');
};
inherits(SongRating, Table);

var Request = function(db) {
  Table.call(this, db, 'request', 'timestamp');
}
inherits(Request, Table);
