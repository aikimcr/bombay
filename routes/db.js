
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

/*
// JSON API Links
exports.createPerson = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().create(req.body, function(result) {
    res.json(result);
  });
};

exports.updatePerson = function(req, res) {
debugger;
  var dbh = new db.Handle();
  dbh.person().update(req.body, function(result) {
    res.json(result);
  });
};

exports.removePerson = function(req, res) {
  var dbh = new db.Handle();
  dbh.person().deleteById(req.query.person_id, function(result) {
    res.json(result);
  });
};

exports.createBand = function(req, res) {
  var person_id = req.session.passport.user;
  var dbh = new db.Handle();

  var createTheBand = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band().create(req.body, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	var data = {
	  person_id: person_id,
	  band_id: result.band_id,
	  band_admin: true
	};
	dbh.band_member().create(data, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  createTheBand();
};

exports.removeBand = function(req, res) {
  var dbh = new db.Handle();
  dbh.band().deleteById(req.query.band_id, function(result) {
    res.json(result);
  });
};

exports.addBandMember = function(req, res) {
  var dbh = new db.Handle();

  var addMember = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band_member().create(req.body, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.song_rating().addForBandMember(
	  req.body.person_id,
	  req.body.band_id,
	  this
	);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err);
      } else {
	res.json(this.result);
      }
    }
  );

  addMember();
};

exports.updateBandMember = function(req, res) {
  var dbh = new db.Handle();
  var band_id = req.query.band_id;
  var person_id = req.query.person_id;
  var band_admin = req.query.band_admin;
  var params = {
    band_admin: band_admin
  };

  dbh.band_member().updateByPersonAndBandId(person_id, band_id, params, function(result) {
    res.json(result);
  });
};

exports.removeBandMember = function(req, res) {
  var dbh = new db.Handle();
  var band_id = req.query.band_id;
  var person_id = req.query.person_id;

  var deleteMember = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.song_rating().deleteForBandMember(person_id, band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.band_member().deleteByPersonAndBandId(person_id, band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  deleteMember();
};

exports.createArtist = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().create(req.body, function(result) {
    res.json(result);
  });
};

exports.removeArtist = function(req, res) {
  var dbh = new db.Handle();
  dbh.artist().deleteById(req.query.artist_id, function(result) {
    res.json(result);
  });
};

exports.createSong = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().create(req.body, function(result) {
    res.json(result);
  });
};

exports.removeSong = function(req, res) {
  var dbh = new db.Handle();
  dbh.song().deleteById(req.query.song_id, function(result) {
    res.json(result);
  });
};

exports.addBandSong = function(req, res) {
  var dbh = new db.Handle();

  var addSong = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band_song().create(req.body, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.song_rating().addForSong(req.body.song_id, req.body.band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  addSong();
};

exports.updateBandSong = function(req, res) {
  var dbh = new db.Handle();
  var data = {
    id: req.query.band_song_id,
    song_status: req.query.song_status
  };

  var updateStatus = flow.define(
    function() {
      this.result = { band_song_id: data.id };
      dbh.band_song().update(data, this);
    }, function(result) {
      if (result.err) {
	res.json(result);
      } else {
	dbh.band_song().getById(this.result.band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	res.json(err);
      } else {
	this.result.song_status = result.band_song.song_status;
	res.json(this.result);
      }
    }
  );

  updateStatus();
};

exports.removeBandSong = function(req, res) {
  var dbh = new db.Handle();
  var band_song_id = req.query.band_song_id;
  var band_id = req.query.band_id;

  var removeSong = flow.define(
    function() {
      this.result = {};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.band_song().getById(band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.song_id = result.band_song.song_id;
	dbh.song_rating().deleteForSong(this.song_id, band_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.band_song().deleteById(band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	dbh.errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  removeSong();
};

exports.updateSongRating = function(req, res) {
  var dbh = new db.Handle();
  var person_id = req.session.passport.user;
  var band_song_id = req.query.band_song_id;
  var rating = req.query.rating;

  var updateRating = flow.define(
    function() {
      this.result = {band_song_id: band_song_id};
      dbh.beginTransaction(this);
    }, function(err) {
      if (err) {
	dbh.errorAndRollback(err, res.json);
      } else {
	dbh.song_rating().updateForPersonAndBandSong(person_id, band_song_id, rating, this);
      }
    }, function(result) {
      if (result.err) {
	errorAndRollback(result.err, res.json);
      } else {
	dbh.song_rating().getForPersonWithAverage(person_id, band_song_id, this);
      }
    }, function(result) {
      if (result.err) {
	errorAndRollback(result.err, res.json);
      } else {
	this.result = util.obj_merge(this.result, result);
	dbh.commit(this);
      }
    }, function(err) {
      if (err) {
	errorAndRollback(err, res.json);
      } else {
	res.json(this.result);
      }
    }
  );

  updateRating();
};
*/
