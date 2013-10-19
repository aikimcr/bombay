var should = require('should');
var fs = require('fs');

var db = require('lib/db');
var routes = require('routes/db');

describe('routes', function() {
  var dbh;
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    dbh = new db.Handle()
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    dbh.doSqlExec([sql], done);
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addSongRatings.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  var req = {
    session: {
      passport: {
        user: 1
      }
    },
    query: {
    }
  };

  describe('#person', function() {
    it('should return the person profile', function(done) {
      var res = {
	json: function(result) {
	  result.should.eql({
	    person: 
	    {
	      id: 1,
	      name: 'test',
	      full_name: 'System Admin Test User',
	      password: 'admin',
	      email: null,
	      system_admin: true
	    }
	  });
	  done();
	}
      };

      routes.getPerson(req, res);
    });

    var person_id;
    it('should create a person', function(done) {
      req.body = {
	name: 'dduck',
	full_name: 'Daffy Duck',
	email: 'dduck@looneytunes.com'
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.person_id);
	  should.not.exist(result.err);
	  person_id = result.person_id
	  dbh.person().getById(person_id, function(result) {
	    should.exist(result);
	    should.exist(result.person);
	    should.not.exist(result.err);
	    result.person.should.eql({
	      id: person_id,
	      name: 'dduck',
	      full_name: 'Daffy Duck',
	      password: 'password',
	      email: 'dduck@looneytunes.com',
	      system_admin: false
	    });
	    done();
	  });
	}
      };

      routes.createPerson(req, res);
    });

    it('should update the person', function(done) {
      req.body = {
	id: person_id,
	password: 'IAmTheEggDuck',
	system_admin: true
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.person().getById(person_id, function(result) {
	    should.exist(result);
	    should.exist(result.person);
	    should.not.exist(result.err);
	    result.person.should.eql({
	      id: person_id,
	      name: 'dduck',
	      full_name: 'Daffy Duck',
	      password: 'IAmTheEggDuck',
	      email: 'dduck@looneytunes.com',
	      system_admin: true
	    });
	    done();
	  });
	}
      };

      routes.updatePerson(req, res);
    });

    it('should delete the person', function(done) {
      req.query.person_id = person_id;
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.person().getById(person_id, function(result) {
	    should.exist(result);
	    should.not.exist(result.person);
	    should.not.exist(result.err);
	    done();
	  });
	}
      };

      routes.removePerson(req, res);
    });
  });

  describe('#band', function() {
    it('should return the band tab object', function(done) {
      var res = {
	json: function(result) {
	  result.should.eql({
	    person_id: 1,
	    system_admin: 1,
	    band_id: null,
	    band_admin: null,
	    person_bands: [{
	      id: 1, name: 'band1'
	    }, {
	      id: 2, name: 'band2'
	    }],
	    other_bands: [{
	      id: 3, name: 'band3'
	    }, {
	      id: 4, name: 'band4'
	    }]
	  });
	  done();
	}
      };

      routes.bandInfoForPerson(req, res);
    });

    var band_id;
    it('should create a new band for a person', function(done) {
      req.body = { name: 'Looney Tunes' };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.band_id);
	  should.not.exist(result.err);
	  band_id = result.band_id;
	  dbh.band().getsByPersonId(1, function(result) {
	    should.exist(result);
	    should.exist(result.person_bands);
	    should.not.exist(result.err);
	    result.person_bands.should.eql([{
	      id: band_id, name: 'Looney Tunes'
	    }, {
	      id: 1, name: 'band1'
	    }, {
	      id: 2, name: 'band2'
	    }]);
	    dbh.person().getLoginPermissions(1, band_id, function(result) {
	      should.exist(result);
	      should.exist(result.band_admin);
	      result.band_admin.should.eql(true);
	      done();
	    });
	  });
	}
      };

      routes.createBand(req, res);
    });

    before(function(done) {
      dbh.band_member().deleteByPersonAndBandId(1, band_id, function(result) {
	done();
      });
    });
    
    it('should remove the band', function(done) {
      req.query.band_id = band_id;
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.band().getById(band_id, function(result) {
	    should.exist(result);
	    should.not.exist(result.band);
	    should.not.exist(result.err);
	    done();
	  });
	}
      };

      routes.removeBand(req, res);
    });
  });

  describe('#band_member', function() {
    it('should return the band_member tab info', function(done) {
      req.query.band_id = 1;
      var res = {
	json: function(result) {
	  result.should.eql({
	    person_id: 1,
	    system_admin: 1,
	    band_id: 1,
	    band_admin: 0,
	    band_members: [{
	      id: 3,
              full_name: 'Herkimer Jones',
              email: null,
              system_admin: 0,
              band_admin: 0 
	    }, {
	      id: 1,
              full_name: 'System Admin Test User',
              email: null,
              system_admin: 1,
              band_admin: 0 
	    }],
	    non_band_members: [{
	      id: 4, full_name: 'Bugs Bunny', email: null
	    }, {
	      id: 2, full_name: 'Non System Admin Test User', email: null 
	    }],
	    band: { id: 1, name: 'band1' }
	  });
	  done();
	}
      };

      routes.bandMemberInfo(req, res);
    });

    it('should not find the band member', function(done) {
      dbh.band_member().getByPersonAndBandId(4, 1, function(result) {
	should.exist(result);
	should.not.exist(result.band_member);
	should.not.exist(result.err);
	done();
      });
    });

    it('should find no ratings for person', function(done) {
      dbh.song_rating().getForBandMember(4, 1, function(result) {
	should.exist(result);
	should.exist(result.member_ratings);
	should.not.exist(result.err);
	result.member_ratings.should.eql([]);
	done();
      });
    });

    var band_member_id;
    it('should add a band_member', function(done) {
      req.body = {
	band_id: 1,
	person_id: 4,
	band_admin: true
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.band_member_id);
	  should.not.exist(result.err);
	  band_member_id = result.band_member_id;
	  dbh.band_member().getById(band_member_id, function(result) {
	    should.exist(result);
	    should.exist(result.band_member);
	    should.not.exist(result.err);
	    result.band_member.should.eql({
	      id: band_member_id,
	      band_id: 1,
	      person_id: 4,
	      band_admin: true
	    });
	    dbh.song_rating().getForBandMember(4, 1, function(result) {
	      should.exist(result);
	      should.exist(result.member_ratings);
	      should.not.exist(result.err);
	      result.member_ratings.should.eql([{
		id: 11, person_id: 4, band_song_id: 1, rating: 3
	      }, {
		id: 12, person_id: 4, band_song_id: 2, rating: 3
	      }, {
		id: 13, person_id: 4, band_song_id: 3, rating: 3
	      }, {
		id: 14, person_id: 4, band_song_id: 4, rating: 3
	      }, {
		id: 15, person_id: 4, band_song_id: 5, rating: 3
	      }]);
	      done();
	    });
	  });
	}
      };

      routes.addBandMember(req, res);
    });

    it('should remove the band member and song ratings', function(done) {
      req.query = {
	person_id: 4,
	band_id: 1
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.song_rating().getForBandMember(4, 1, function(result) {
	    should.exist(result);
	    should.exist(result.member_ratings);
	    should.not.exist(result.err);
	    result.member_ratings.should.eql([]);
	    dbh.band_member().getById(band_member_id, function(result) {
	      should.exist(result);
	      should.not.exist(result.band_member);
	      should.not.exist(result.err);
	      done();
	    });
	  });
	}
      };

      routes.removeBandMember(req, res);
    });
  });

  describe('#artist', function() {
    it('should return the artist tab info', function(done) {
      req.query.band_id = 2; // Need to know if user is a band_admin
      var res = {
	json: function(result) {
	  result.should.eql({
	    person_id: 1,
	    system_admin: 1,
	    band_id: 2,
	    band_admin: 1,
	    artists: [
	      { id: 1, name: 'AC/DC', song_count: 1 },
	      { id: 5, name: 'David Bowie', song_count: 2 },
	      { id: 3, name: 'Led Zeppelin', song_count: 1 },
	      { id: 4, name: 'The Beatles', song_count: 3 },
	      { id: 2, name: 'ZZ Top', song_count: 0 }
	    ]
	  });
	  done();
	}
      };

      routes.artistInfo(req, res);
    });

    var artist_id;
    it('should create an artist', function(done) {
      req.body = {name: 'Mel Blanc'};
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.artist_id);
	  should.not.exist(result.err);
	  artist_id = result.artist_id;
	  dbh.artist().getById(artist_id, function(result) {
	    should.exist(result);
	    should.exist(result.artist);
	    should.not.exist(result.err);
	    result.artist.should.eql({
	      id: artist_id,
	      name: 'Mel Blanc'
	    });
	    done();
	  });
	}
      };

      routes.createArtist(req, res);
    });

    it('should remove the artist', function(done) {
      req.query = { artist_id: artist_id };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.artist().getById(artist_id, function(result) {
	    should.exist(result);
	    should.not.exist(result.artist);
	    should.not.exist(result.err);
	    done();
	  });
	}
      };

      routes.removeArtist(req, res);
    });
  });

  describe('#song_info', function() {
    it('should return the song tab info', function(done) {
      req.query = {
	band_id: 1,
	sort_type: 'song_name',
	filters: JSON.stringify([])
      };
      var res = {
	json: function(result) {
	  result.should.eql({
	    sort_type: 'song_name',
	    filters: {},
	    person_id: 1,
	    system_admin: 1,
	    band_id: 1,
	    band_admin: 0,
	    band_songs: [{
	      name: 'I Wanna Hold Your Hand',
              artist_name: 'The Beatles',
              band_song_id: 5,
              song_status: -1,
              rating: 5,
              avg_rating: 5
	    }, {
	      name: 'Love Me Do',
              artist_name: 'The Beatles',
              band_song_id: 4,
              song_status: 1,
              rating: 4,
              avg_rating: 3.5
	    }, {
	      name: 'Rebel, Rebel',
              artist_name: 'David Bowie',
              band_song_id: 2,
              song_status: 2,
              rating: 2,
              avg_rating: 2.5
	    }, {
	      name: 'Space Oddity',
              artist_name: 'David Bowie',
              band_song_id: 1,
              song_status: 4,
              rating: 1,
              avg_rating: 1
	    }, {
	      name: 'You Shook Me All Night Long',
              artist_name: 'AC/DC',
              band_song_id: 3,
              song_status: 3,
              rating: 3,
              avg_rating: 3 
	    }],
	    all_artists: [
	      { id: 1, name: 'AC/DC' },
	      { id: 5, name: 'David Bowie' },
	      { id: 3, name: 'Led Zeppelin' },
	      { id: 4, name: 'The Beatles' },
	      { id: 2, name: 'ZZ Top' }
	    ],
	    other_songs: [{
	      id: 6,
              name: 'Help',
              artist_id: 4,
              artist_name: 'The Beatles',
              description: 'Help by The Beatles'
	    }, {
	      id: 7,
              name: 'Stairway To Heaven',
              artist_id: 3,
              artist_name: 'Led Zeppelin',
              description: 'Stairway To Heaven by Led Zeppelin' }]
	  });
	  done();
	}
      };

      routes.bandSongInfo(req, res);
    });

    var song_id;
    it('should create a song', function(done) {
      req.body = {
	name: 'Whole Lotta Rosie',
	artist_id: 1
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.song_id);
	  should.not.exist(result.err);
	  song_id = result.song_id;
	  dbh.song().getById(song_id, function(result) {
	    should.exist(result);
	    should.exist(result.song);
	    should.not.exist(result.err);
	    result.song.should.eql({
	      id: song_id,
	      name: 'Whole Lotta Rosie',
	      artist_id: 1
	    });
	    done();
	  });
	}
      };

      routes.createSong(req, res);
    });

    var band_song_id;
    it('should add song to a band', function(done) {
      req.body = {
	band_id: 1,
	song_id: song_id
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.band_song_id);
	  should.not.exist(result.err);
	  band_song_id = result.band_song_id;
	  dbh.band_song().getById(band_song_id, function(result) {
	    should.exist(result);
	    should.exist(result.band_song);
	    should.not.exist(result.err);
	    result.band_song.should.eql({
	      id: band_song_id,
	      band_id: 1,
	      song_id: song_id,
	      song_status: 0
	    });
	    dbh.song_rating().getForSong(song_id, 1, function(result) {
	      should.exist(result);
	      should.exist(result.song_ratings);
	      should.not.exist(result.err);
	      result.song_ratings.should.eql([{
		id: 16, person_id: 1, band_song_id: band_song_id, rating: 3
	      }, {
		id: 17, person_id: 3, band_song_id: band_song_id, rating: 3
	      }])
	      done();
	    });
	  });
	}
      };

      routes.addBandSong(req, res);
    });

    it('should update the band song status', function(done) {
      req.body = {
	id: band_song_id,
	song_status: 4,
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  result.should.eql({
	    band_song_id: band_song_id,
	    song_status: 4
	  });
	  dbh.band_song().getById(band_song_id, function(result) {
	    should.exist(result);
	    should.exist(result.band_song);
	    should.not.exist(result.err);
	    result.band_song.should.eql({
	      id: band_song_id,
	      band_id: 1,
	      song_id: song_id,
	      song_status: 4
	    });
	    done();
	  });
	}
      };

      routes.updateBandSongStatus(req, res);
    });

    it('should update the song rating', function(done) {
      req.body = {
	person_id: 1,
	band_song_id: band_song_id,
	rating: 1
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.exist(result.band_song_id);
	  should.exist(result.song_rating);
	  should.not.exist(result.err);
	  result.band_song_id.should.eql(band_song_id);
	  result.song_rating.should.eql({
	    person_id: 1,
	    band_song_id: band_song_id,
	    rating: 1,
	    average_rating: 2
	  });
	  done();
	}
      };

      routes.updateBandSongRating(req, res);
    });

    it('should remove the song and ratings from the band', function(done) {
      req.query = {
	band_id: 1,
	band_song_id: band_song_id
      };
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.band_song().getById(band_song_id, function(result) {
	    should.exist(result);
	    should.not.exist(result.band_song);
	    should.not.exist(result.err);
	    dbh.song_rating().getForBandMember(3, 1, function(result) {
	      should.exist(result);
	      should.exist(result.member_ratings);
	      should.not.exist(result.err);
	      result.member_ratings.should.eql([]);
	      done();
	    });
	  });
	}
      };

      routes.removeBandSong(req, res);
    });

    it('should remove the song from the database', function(done) {
      req.query.song_id = song_id;
      var res = {
	json: function(result) {
	  should.exist(result);
	  should.not.exist(result.err);
	  dbh.song().getById(song_id, function(result) {
	    should.exist(result);
	    should.not.exist(result.song);
	    should.not.exist(result.err);
	    done();
	  });
	}
      };

      routes.removeSong(req, res);
    });
  });

  afterEach(function(done) { req.query = {}; done(); });
  afterEach(function(done) { req.body = {}; done(); });
});
