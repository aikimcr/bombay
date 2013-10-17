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
	      system_admin: 1
	    }
	  });
	  done();
	}
      };

      routes.personProfile(req, res);
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
	    all_artists: [
	      { id: 1, name: 'AC/DC' },
	      { id: 5, name: 'David Bowie' },
	      { id: 3, name: 'Led Zeppelin' },
	      { id: 4, name: 'The Beatles' },
	      { id: 2, name: 'ZZ Top' }
	    ]
	  });
	  done();
	}
      };

      routes.artistInfo(req, res);
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

      routes.songInfo(req, res);
    });
  });

  afterEach(function(done) { req.query = {}; done(); });
});
