/*
 * ORM DB Access
 */

var orm = require('orm');
var path = require('path');

var sqlite3 = require('sqlite3');

var default_db_name = 'bombay.db';
var db_name = null;

exports.getConnect = function() {
  if (! db_name) db_name = process.env.db_name || default_db_name;
  return 'sqlite://' + db_name;
};

exports.db_handle = function() {
  if (!db_name) {
    db_name = default_db_name;
  }
  var db_path = path.join('.', db_name);
  sqlite3.verbose();
  var dbh = new sqlite3.Database(db_path, function(err) {
    if (err) throw err;
  });
  dbh.exec('PRAGMA foreigh_keys = ON;');
  return dbh;
};

exports.execSqlList = function(sql_list, callback) {
  var sql_text;

  if (sql_list instanceof Array) {
    sql_text = sql_list.join('\n');
  } else {
    sql_text = sql_list;
  }
  var dbh = exports.db_handle();
  dbh.exec(sql_text, function(err) {
    if (err) {
      db.logError(err, sql_text, []);
      callback(err);
    }
    else {
      callback(null);
    }
  });
};

orm.connect(exports.getConnect() + '?strdates=true', function(err, db) {
  if (err) throw err;

  var columns = {};
  Band = db.define('band', {
    name: String
  }, {
    cache: false
  });
  columns.Band = ['id', 'name'];
  exports.Band = Band;

  Person = db.define('person', {
    name: String,
    full_name: String,
    password: String,
    email: String,
    system_admin: Boolean
  }, {
    cache: false
  });
  columns.Person = ['id', 'name', 'full_name', 'password', 'email', 'system_admin'];
  exports.Person = Person;

  Artist = db.define('artist', {
    name: String
  }, {
    cache: false
  });
  columns.Artist = ['id', 'name'];
  exports.Artist = Artist;

  Song = db.define('song', {
    name: String,
    key_signature: String
  }, {
    cache: false
  });
  Song.hasOne('artist', Artist, {reverse: 'songs'});
  columns.Song = ['id', 'name', 'key_siganture', 'artist_id'];
  exports.Song = Song;

  BandMember = db.define('band_member', {
    band_admin: Boolean
  }, {
    cache: false
  });
  BandMember.hasOne('band', Band, {reverse: 'members'});
  BandMember.hasOne('person', Person, {reverse: 'bands'});
  columns.BandMember = ['id', 'band_admin', 'band_id', 'person_id'];
  exports.BandMember = BandMember;

  BandSong = db.define('band_song', {
    song_status: Number,
    key_signature: String
  }, {
    cache: false
  });
  BandSong.hasOne('band', Band, {reverse: 'songs'});
  BandSong.hasOne('song', Song, {reverse: 'bands'});
  columns.BandSong = ['id', 'song_status', 'key_signature', 'band_id', 'song_id'];
  exports.BandSong = BandSong;

  SongRating = db.define('song_rating', {
    rating: Number
  }, {
    cache: false
  });
  SongRating.hasOne('band_member', BandMember, {reverse: 'songRatings'});
  SongRating.hasOne('band_song', BandSong, {reverse: 'songRatings'});
  columns.SongRating = ['id', 'rating', 'band_member_id', 'band_song_id'];
  exports.SongRating = SongRating;

  Request = db.define('request', {
    description: String,
    timestamp: {type: 'date', time: true},
    request_type: Number,
    status: Number
  }, {
    cache: false,
    hooks: {
      beforeCreate: function(next) {
        this.timestamp = new Date();
        return next();
      }
    }
  });
  Request.hasOne('band', Band, {reverse: 'requests'});
  Request.hasOne('person', Band, {reverse: 'requests'});
  columns.Request = ['id', 'description', 'timestamp', 'request_type', 'status'];
  exports.Request = Request;

  exports.db = db;
  exports.models = db.models;
  exports.columns = columns;
  exports.driver = db.driver;
});
