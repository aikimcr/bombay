/*
 * ORM DB Access
 */

var orm = require('orm');

var default_db_name = 'bombay.db';
var db_name = null;

exports.getConnect = function() {
  if (! db_name) db_name = process.env.db_name || default_db_name;
  return 'sqlite://' + db_name;
};

exports.flatten = function(db_model) {
  return JSON.parse(JSON.stringify(db_model));
};

orm.connect(exports.getConnect(), function(err, db) {
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
    timestamp: String,
    request_type: Number,
    status: Number
  }, {
    cache: false
  });
  Request.hasOne('band', Band, {reverse: 'requests'});
  Request.hasOne('person', Band, {reverse: 'requests'});
  columns.Request = ['id', 'description', 'timestamp', 'request_type', 'status'];
  exports.Request = Request;

  exports.db = db;
  exports.models = db.models;
  exports.columns = columns;
  exports.driver = db.driver;
  exports.query = db.driver.execQuery;
});
