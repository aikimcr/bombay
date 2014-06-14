/*
 * ORM DB Access
 */

var orm = require('orm');

var default_db_name = 'bombay.db';
var db_name = null;

exports.getConnect = function() {
  if (! db_name) db_name = default_db_name;
  return 'sqlite://' + db_name;
};

exports.setDBName = function(opt_path) {
  if (opt_path) {
    db_name = opt_path;
  } else {
    db_name = default_db_name;
  }
};

exports.flatten = function(db_model) {
  return JSON.parse(JSON.stringify(db_model));
};

exports.connect = function(cb) {
  orm.connect(exports.getConnect(), function(err, db) {
    if (err) throw err;

    var model = {};
    var columns = {};
    model.Band = db.define('band', {
      name: String
    });
    columns.Band = ['id', 'name'];

    model.Person = db.define('person', {
      name: String,
      full_name: String,
      password: String,
      email: String,
      system_admin: Boolean
    });
    columns.Person = ['id', 'name', 'full_name', 'password', 'email', 'system_admin'];

    model.Artist = db.define('artist', {
      name: String
    });
    columns.Artist = ['id', 'name'];

    model.Song = db.define('song', {
      name: String,
      key_signature: String
    });
    model.Song.hasOne('artist', model.Artist, {reverse: 'songs'});
    columns.Song = ['id', 'name', 'key_siganture', 'artist_id'];

    model.BandMember = db.define('band_member', {
      band_admin: Boolean
    });
    model.BandMember.hasOne('band', model.Band, {reverse: 'members'});
    model.BandMember.hasOne('person', model.Person, {reverse: 'bands'});
    columns.BandMember = ['id', 'band_admin', 'band_id', 'person_id'];

    model.BandSong = db.define('band_song', {
      song_status: Number,
      key_signature: String
    });
    model.BandSong.hasOne('band', model.Band, {reverse: 'songs'});
    model.BandSong.hasOne('song', model.Song, {reverse: 'bands'});
    columns.BandSong = ['id', 'song_status', 'key_signature', 'band_id', 'song_id'];

    model.SongRating = db.define('song_rating', {
      rating: Number
    });
    model.SongRating.hasOne('band_member', model.BandMember, {reverse: 'songRatings'});
    model.SongRating.hasOne('band_song', model.BandSong, {reverse: 'songRatings'});
    columns.SongRating = ['id', 'rating', 'band_member_id', 'band_song_id'];

    model.Request = db.define('request', {
      description: String,
      timestamp: String,
      request_type: Number,
      status: Number
    });
    model.Request.hasOne('band', model.Band, {reverse: 'requests'});
    model.Request.hasOne('person', model.Band, {reverse: 'requests'});
    columns.Request = ['id', 'description', 'timestamp', 'request_type', 'status'];

    cb(model, columns);
  });
};

exports.query = function() {
  var query_args = arguments;
  orm.connect(exports.getConnect(), function(err, db) {
debugger;
    if (err) throw err;
    db.driver.execQuery.apply(db.driver, query_args);
  })
};
