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

exports.connect = function(cb) {
  orm.connect(exports.getConnect(), function(err, db) {
    if (err) throw err;

    var model = {};
    model.Band = db.define('band', {
      name: String
    });

    model.Person = db.define('person', {
      name: String,
      full_name: String,
      password: String,
      email: String,
      system_admin: Boolean
    });

    model.Artist = db.define('artist', {
      name: String
    });

    model.Song = db.define('song', {
      name: String,
      key_signature: String
    });
    model.Song.hasOne('artist', model.Artist, {reverse: 'songs'});

    model.BandMember = db.define('band_member', {
      band_admin: Boolean
    });
    model.BandMember.hasOne('band', model.Band, {reverse: 'members'});
    model.BandMember.hasOne('person', model.Person, {reverse: 'bands'});

    model.BandSong = db.define('band_song', {
      song_status: Number,
      key_signature: String
    });
    model.BandSong.hasOne('band', model.Band, {reverse: 'songs'});
    model.BandSong.hasOne('song', model.Song, {reverse: 'bands'});

    model.SongRating = db.define('song_rating', {
      rating: Number
    });
    model.SongRating.hasOne('band_member', model.BandMember, {reverse: 'songRatings'});
    model.SongRating.hasOne('band_song', model.BandSong, {reverse: 'songRatings'});

    model.Request = db.define('request', {
      description: String,
      timestamp: String,
      request_type: Number,
      status: Number
    });
    model.Request.hasOne('band', model.Band, {reverse: 'requests'});
    model.Request.hasOne('person', model.Band, {reverse: 'requests'});

    cb(model);
  });
};
