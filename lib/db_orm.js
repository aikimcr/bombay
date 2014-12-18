/*
 * ORM DB Access
 */

var orm = require('orm');
var path = require('path');
var util = require('util');
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
      console.log("Error" + util.inspect(err));
      console.log(sql_text);
      callback(err);
    }
    else {
      callback(null);
    }
  });
};

exports.querySql = function(sql, values, callback) {
  var dbh = exports.db_handle();
  dbh.all(sql, values, function(err, rows) {
    if (err) {
      console.log("Error" + util.inspect(err));
      console.log(sql);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
};

var models = {
  Band: 'band',
  Person: 'person',
  Artist: 'artist',
  Song: 'song',
  BandMember: 'band_member',
  BandSong: 'band_song',
  Session: 'session',
  SongRating: 'song_rating',
  Snapshot: 'snapshot',
  SongRatingSnapshot: 'song_rating_snapshot'
};

var methods = ['get', 'find', 'create'];

Object.keys(models).forEach(function(model_key) {
  this[model_key] = function() {};
  methods.forEach(function(method) {
    this[model_key][method] = function() {
      var args = arguments;
      var retry = function() {
        if (this.models) {
          var orm_model = exports.models[models[model_key]];
          orm_model[method].apply(orm_model, args);
        } else {
          setTimeout(retry, 500);
        }
      }.bind(this);
      retry();
    }.bind(this);
  }.bind(this));
}.bind(exports));

//orm.connect(exports.getConnect() + '?strdates=true&debug=true', function(err, db) {
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
    system_admin: Boolean,
    session_expires: Number
  }, {
    cache: false
  });
  columns.Person = ['id', 'name', 'full_name', 'password', 'email', 'system_admin', 'session_expires'];
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
  columns.Song = ['id', 'name', 'key_signature', 'artist_id'];
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
  BandSong.hasOne('primary_vocal', BandMember, {reverse: 'primaryVocals'});
  BandSong.hasOne('secondary_vocal', BandMember, {reverse: 'secondaryVocals'});
  columns.BandSong = ['id', 'song_status', 'key_signature', 'band_id', 'song_id', 'primary_vocal_id', 'secondary_vocal_id'];
  exports.BandSong = BandSong;

  SongRating = db.define('song_rating', {
    rating: Number,
    is_new: Boolean
  }, {
    cache: false
  });
  SongRating.hasOne('band_member', BandMember, {reverse: 'songRatings'});
  SongRating.hasOne('band_song', BandSong, {reverse: 'songRatings'});
  columns.SongRating = ['id', 'rating', 'band_member_id', 'band_song_id', 'is_new'];
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

  Session = db.define('session', {
    session_token: {type: 'text'},
    session_start: {type: 'date', time: true}
  }, {
    cache: false,
    methods: {
      generateToken: function() {
        return parseInt(Math.random() * parseInt('FFFFFFFF', 16), 10)
          .toString(16)
          .toUpperCase(); 
      }
    },
    hooks: {
      beforeCreate: function(next) {
        this.session_token = this.generateToken(),
        this.session_start = new Date();
        return next();
      }
    }
  });
  Session.hasOne('person', Person, {reverse: 'sessions'});
  columns.Session = ['id', 'session_token', 'session_start', 'person_id'];
  exports.Session = Session;

  Snapshot = db.define('snapshot', {
    timestamp: {type: 'date', time: true},
  }, {
    cache: false,
    hooks: {
      beforeCreate: function(next) {
        this.timestamp = new Date();
        return next();
      }
    }
  });
  columns.Snapshot = ['id', 'timestamp'];
  exports.Snapshot = Snapshot;

  SongRatingSnapshot = db.define('song_rating_snapshot', {
    snapshot_id: {type: 'integer'},
    band_id: {type: 'integer'},
    band_name: {type: 'text'},
    song_name: {type: 'text'},
    artist_name: {type: 'text'},
    average_rating: {type: 'number'},
    high_rating: {type: 'integer'},
    low_rating: {type: 'integer'},
    variance: {type: 'number'}
  }, {
    cache: false
  });
  SongRatingSnapshot.hasOne('band', Band, {reverse: 'songRatingSnapshots'});
  SongRatingSnapshot.hasOne('snapshot', Snapshot, {reverse: 'songRatingSnapshots'});
  columns.SongRatingSnapshot = ['id', 'snapshot_id', 'band_id', 'band_name', 'song_name',
                                'artist_name', 'average_rating', 'high_rating',
                                'low_rating', 'variance'];
  exports.SongRatingSnapshot = SongRatingSnapshot;

  RehearsalPlan = db.define('rehearsal_plan', {
    rehearsal_date: {type: 'date', time: false}
  }, {
    cache: false,
  });
  RehearsalPlan.hasOne('band', Band, {reverse: 'band'});
  columns.RehearsalPlan = ['id', 'rehearsal_data'];
  exports.RehearsalPlan = RehearsalPlan;

  RehearsalPlanRunThroughSong = db.define('rehearsal_run_through', {
    sequence: {type: 'number'}
  }, {
    cache: false,
  });
  RehearsalPlanRunThroughSong.hasOne('rehearsal_plan', RehearsalPlan, {reverse: 'rehearsalPlan'});
  RehearsalPlanRunThroughSong.hasOne('band_song', RehearsalPlan, {reverse: 'bandSong'});
  columns.RehearsalPlanRunThroughSong = ['id', 'rehearsal_plan_id', 'sequence', 'band_song_id'];
  exports.RehearsalPlanRunThroughSong = RehearsalPlanRunThroughSong;

  RehearsalPlanLearningSong = db.define('rehearsal_learning', {
    sequence: Number
  }, {
    cache: false,
  });
  RehearsalPlanLearningSong.hasOne('rehearsal_plan', RehearsalPlan, {reverse: 'rehearsalPlan'});
  RehearsalPlanLearningSong.hasOne('band_song', RehearsalPlan, {reverse: 'bandSong'});
  columns.RehearsalPlanLearningSong = ['id', 'rehearsal_plan_id', 'sequence', 'band_song_id'];
  exports.RehearsalPlanLearningSong = RehearsalPlanLearningSong;

  exports.db = db;
  exports.models = db.models;
  exports.columns = columns;
  exports.driver = db.driver;
});
