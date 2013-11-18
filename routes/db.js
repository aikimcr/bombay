
/*
 * Database manipulation methods.
 */
var flow = require('flow');
var db = require('lib/db');
var util = require('lib/util');

exports.getBandTable = function(req, res) {
  var band_id = req.params.id;
  if (!band_id) band_id = req.query.id;

  var dbh = new db.Handle();

  if (band_id) {
    dbh.band().getById(band_id, res.json);
  } else {
    var params = { sort: { order: 'name' }};
    dbh.band().getAllWithArgs(params, res.json);
  }
};

exports.postBandTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().create(req.body, res.json);
};

exports.putBandTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().update(req.query, res.json);
};

exports.deleteBandTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().deleteById(req.query.id, res.json);
};

exports.getPersonTable = function(req, res) {
  var person_id = req.params.id;
  if (!person_id) person_id = req.query.id;

  var dbh = new db.Handle();

  if (person_id) {
    dbh.person().getById(person_id, res.json);
  } else {
    var params = { sort: { order: 'full_name' }};
    dbh.person().getAllWithArgs(params, res.json);
  }
};

exports.postPersonTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().create(req.body, res.json);
};

exports.putPersonTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().update(req.query, res.json);
};

exports.deletePersonTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().deleteById(req.query.id, res.json);
};

exports.getArtistTable = function(req, res) {
  var artist_id = req.params.id;
  if (!artist_id) artist_id = req.query.id;

  var dbh = new db.Handle();

  if (artist_id) {
    dbh.artist().getById(artist_id, res.json);
  } else {
    var params = { sort: { order: 'name' }};
    dbh.artist().getAllWithArgs(params, res.json);
  }
};

exports.postArtistTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().create(req.body, res.json);
};

exports.putArtistTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().update(req.query, res.json);
};

exports.deleteArtistTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().deleteById(req.query.id, res.json);
};

exports.getSongTable = function(req, res) {
  var song_id = req.params.id;
  if (!song_id) song_id = req.query.id;

  var dbh = new db.Handle();

  if (song_id) {
    dbh.song().getById(song_id, res.json);
  } else {
    var params = { sort: { order: 'name' }};
    dbh.song().getAllWithArgs(params, res.json);
  }
};

exports.postSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().create(req.body, res.json);
};

exports.putSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().update(req.query, res.json);
};

exports.deleteSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().deleteById(req.query.id, res.json);
};

exports.getBandMemberTable = function(req, res) {
  var band_member_id = req.params.id;
  if (!band_member_id) band_member_id = req.query.id;

  var dbh = new db.Handle();

  if (band_member_id) {
    dbh.band_member().getById(band_member_id, res.json);
  } else {
    var params = { sort: { order: [ 'band_id', 'person_id' ] }};
    dbh.band_member().getAllWithArgs(params, res.json);
  }
};

exports.postBandMemberTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_member().create(req.body, res.json);
};

exports.putBandMemberTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_member().update(req.query, res.json);
};

exports.deleteBandMemberTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_member().deleteById(req.query.id, res.json);
};

exports.getBandSongTable = function(req, res) {
  var band_song_id = req.params.id;
  if (!band_song_id) band_song_id = req.query.id;

  var dbh = new db.Handle();

  if (band_song_id) {
    dbh.band_song().getById(band_song_id, res.json);
  } else {
    var params = { sort: { order: [ 'band_id', 'song_id' ] }};
    dbh.band_song().getAllWithArgs(params, res.json);
  }
};

exports.postBandSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_song().create(req.body, res.json);
};

exports.putBandSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_song().update(req.query, res.json);
};

exports.deleteBandSongTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.band_song().deleteById(req.query.id, res.json);
};

exports.getSongRatingTable = function(req, res) {
  var song_rating_id = req.params.id;
  if (!song_rating_id) song_rating_id = req.query.id;

  var dbh = new db.Handle();

  if (song_rating_id) {
    dbh.song_rating().getById(song_rating_id, res.json);
  } else {
    var params = { sort: { order: [ 'band_member_id', 'band_song_id' ] }};
    dbh.song_rating().getAllWithArgs(params, res.json);
  }
};

exports.postSongRatingTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song_rating().create(req.body, res.json);
};

exports.putSongRatingTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song_rating().update(req.query, res.json);
};

exports.deleteSongRatingTable = function(req, res) {
  var dbh = new db.Handle();
  dbh.song_rating().deleteById(req.query.id, res.json);
};
