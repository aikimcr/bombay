var band_song_model = {
  all_band_songs: [{
    id: 45, band_id: 12, song_id: 2, song_status: -1
  }, {
    id: 16, band_id: 40, song_id: 10, song_status: 0
  }, {
    id: 63, band_id: 9, song_id: 5, song_status: 4
  }]
};

describe('BandSong Table', function() {
  describe('#Instantiate', function() {
    var band_song;
    var expected_id = 1;
    var expected_band_id = 12;
    var expected_song_id = 10;
    var expected_status = 3;

    it('should create a band_song object', function(done) {
      band_song = new BandSong(
        expected_id,
        expected_band_id,
        expected_song_id,
        expected_status
      );
      should.exist(band_song);
      done();
    });

    it('should have an id', function(done) {
      band_song.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(band_song.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      band_song.id().should.eql(expected_id);
      done();
    });

    it('should have a band_id', function(done) {
      band_song.should.have.property('band_id');
      done();
    });

    it('should have observable band_id', function(done) {
      ko.isObservable(band_song.band_id).should.be.true;
      done();
    });

    it('should have band_id set to expected', function(done) {
      band_song.band_id().should.eql(expected_band_id);
      done();
    });

    it('should have a song_id', function(done) {
      band_song.should.have.property('song_id');
      done();
    });

    it('should have observable song_id', function(done) {
      ko.isObservable(band_song.song_id).should.be.true;
      done();
    });

    it('should have song_id set to expected', function(done) {
      band_song.song_id().should.eql(expected_song_id);
      done();
    });

    it('should have a status', function(done) {
      band_song.should.have.property('status');
      done();
    });

    it('should have observable status', function(done) {
      ko.isObservable(band_song.status).should.be.true;
      done();
    });

    it('should have status set to expected', function(done) {
      band_song.status().should.eql(expected_status);
      done();
    });

    after(function(done) {
      delete band_song;
      band_song = null;
      done();
    });
  });

  describe('loadById', function() {
    var band_song;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should call the band_song API', function(done) {
      svc.get.result = { band_song: band_song_model.all_band_songs[1] };
      BandSong.loadById(16, function(result) {
        should.exist(result);
        band_song = result;
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './band_song?id=16',
        'function'
      ]]);
      done();
    });

    it('should get the band_song', function(done) {
      should.exist(band_song);
      band_song.should.be.an.instanceOf(BandSong);
      done();
    });

    it('should be a valid band_song', function(done) {
      band_song.should.have.property('id');
      ko.isObservable(band_song.id).should.be.true;
      band_song.id().should.eql(band_song_model.all_band_songs[1].id);
      band_song.should.have.property('band_id');
      ko.isObservable(band_song.band_id).should.be.true;
      band_song.band_id().should.eql(band_song_model.all_band_songs[1].band_id);
      band_song.should.have.property('song_id');
      ko.isObservable(band_song.song_id).should.be.true;
      band_song.song_id().should.eql(band_song_model.all_band_songs[1].song_id);
      band_song.should.have.property('status');
      ko.isObservable(band_song.status).should.be.true;
      band_song.status().should.eql(band_song_model.all_band_songs[1].status);
      done();
    });
  });

  describe('Delete', function() {
    var band_song;
    var expected_id = 1;
    var expected_band_id = 1;
    var expected_song_id = 1;
    var expected_song_status = 1;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a band_song object', function(done) {
      song = new BandSong(expected_id, expected_band_id, expected_song_id, expected_song_status);
      should.exist(song);
      done();
    });

    it('should call the song API', function(done) {
      svc.delete.result = {band_song: 1};
      svc.get.result = song_model;
      song.delete(function (result) {
        should.exist(result);
        result.should.have.property('band_song');
        result.band_song.should.eql(1);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './band_song?id=1',
        'function'
      ]]);
      done();
    });
  });
});

describe('BandSongList', function() {
  var band_song_list;
  var svc;

  before(function(done) {
    band_song_model = {
      all_band_songs: [{
        id: 45, band_id: 1, song_id: 2, song_status: -1
      }, {
        id: 16, band_id: 1, song_id: 10, song_status: 0
      }, {
        id: 63, band_id: 1, song_id: 5, song_status: 4
      }, {
        id: 72, band_id: 2, song_id: 2, song_status: -2
      }]
    };
    done();
  });

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = band_song_model;
    svc.resetCalls();
    done();
  });

  describe('Basic List', function() {
    it('should create a band_song list', function(done) {
      band_song_list = new BandSongList();
      should.exist(band_song_list);
      done();
    });

    it('should have an observable array as list', function(done) {
      ko.isObservable(band_song_list.list).should.be.true;
      done();
    });

    it('should load from the service', function(done) {
      band_song_list.load();
      svc.get.calls.should.eql(1);
      svc.get.params.should.eql([[
        './band_song',
        'function'
      ]]);
      done();
    });

    it('should have all the band_songs', function(done) {
      band_song_list.list().should.have.length(band_song_model.all_band_songs.length);
      done();
    });

    it('should have an id, band_id, song_id and status in each record', function(done) {
      band_song_list.list().forEach(function(band_song, index) {
        band_song.should.have.property('id');
        ko.isObservable(band_song.id).should.be.true;
        band_song.id().should.eql(band_song_model.all_band_songs[index].id);
        band_song.should.have.property('band_id');
        ko.isObservable(band_song.band_id).should.be.true;
        band_song.band_id().should.eql(band_song_model.all_band_songs[index].band_id);
        band_song.should.have.property('song_id');
        ko.isObservable(band_song.song_id).should.be.true;
        band_song.song_id().should.eql(band_song_model.all_band_songs[index].song_id);
        band_song.should.have.property('status');
        ko.isObservable(band_song.status).should.be.true;
        band_song.status().should.eql(band_song_model.all_band_songs[index].song_status);
      });
      done();
    });
  });

  describe('Filters', function() {
    before(function(done) {
      manager.current_band().id(1);
      done();
    });

    before(function(done) {
      manager.current_person().id(1);
      done();
    });

    before(function(done) {
      manager.band_members.list([]);
      manager.band_members.load_({
        all_band_members: [{
          id: 1, band_id: 1, person_id: 1, band_admin: 0
        }, {
          id: 2, band_id: 1, person_id: 2, band_admin: 0
        }]
      });
      done();
    });

    before(function(done) {
      manager.artists.list([]);
      manager.artists.load_({
        all_artists: [{
          id: 2, name: 'Aardvarks Rule'
        }, {
          id: 4, name: 'The Beatles'
        }]
      });
      done();
    });

    before(function(done) {
      manager.songs.list([]);
      manager.songs.load_({
        all_songs: [{
          id: 2, name: 'Zelda Goes To Hollywood', artist_id: 2
        }, {
          id: 10, name: 'Help', artist_id: 4
        }, {
          id: 5, name: 'Help', artist_id: 2
        }]
      });
      done();
    });

    before(function(done) {
      manager.song_ratings.list([]);
      manager.song_ratings.load_({
        all_song_ratings: [{
          id: 1, band_member_id: 1, band_song_id: 45, rating: 2
        }, {
          id: 2, band_member_id: 1, band_song_id: 16, rating: 4
        }, {
          id: 3, band_member_id: 1, band_song_id: 63, rating: 3
        }, {
          id: 1, band_member_id: 2, band_song_id: 45, rating: 3
        }, {
          id: 2, band_member_id: 2, band_song_id: 16, rating: 5
        }, {
          id: 3, band_member_id: 2, band_song_id: 63, rating: 1
        }]
      });
      done();
    });
    
    var map_song = function(band_song) {
        return {
          song_name: band_song.song().name(),
          artist_name: band_song.song().artist().name(),
          song_status: band_song.status(),
          member_rating: band_song.member_rating(),
          average_rating: band_song.average_rating()
        };
    };

    it('should have all the band_songs for the band', function(done) {
      band_song_list.filtered_list().should.have.length(3);
      done();
    });

    it('should be sorted by name and artist_name ascending', function(done) {
      band_song_list.sort_type('name_asc');
      var got = band_song_list.filtered_list().map(map_song);
      got.should.eql([{
        song_name: 'Help',
        artist_name: 'Aardvarks Rule',
        song_status: 4,
        member_rating: 3,
        average_rating: 2
      }, {
        song_name: 'Help',
        artist_name: 'The Beatles',
        song_status: 0,
        member_rating: 4,
        average_rating: 4.5
      }, {
        song_name: 'Zelda Goes To Hollywood',
        artist_name: 'Aardvarks Rule',
        song_status: -1,
        member_rating: 2,
        average_rating: 2.5
      }]);
      done();
    });

    it('should be sorted by name and artist_name descending', function(done) {
      band_song_list.sort_type('name_desc');
      var got = band_song_list.filtered_list().map(map_song);
      got.should.eql([{
        song_name: 'Zelda Goes To Hollywood',
        artist_name: 'Aardvarks Rule',
        song_status: -1,
        member_rating: 2,
        average_rating: 2.5
      }, {
        song_name: 'Help',
        artist_name: 'The Beatles',
        song_status: 0,
        member_rating: 4,
        average_rating: 4.5
      }, {
        song_name: 'Help',
        artist_name: 'Aardvarks Rule',
        song_status: 4,
        member_rating: 3,
        average_rating: 2
      }]);
      done();
    });

    it('should be sorted by artist_name and name ascending', function(done) {
      band_song_list.sort_type('artist_asc');
      var got = band_song_list.filtered_list().map(map_song);
      got.should.eql([{
        song_name: 'Help',
        artist_name: 'Aardvarks Rule',
        song_status: 4,
        member_rating: 3,
        average_rating: 2
      }, {
        song_name: 'Zelda Goes To Hollywood',
        artist_name: 'Aardvarks Rule',
        song_status: -1,
        member_rating: 2,
        average_rating: 2.5
      }, {
        song_name: 'Help',
        artist_name: 'The Beatles',
        song_status: 0,
        member_rating: 4,
        average_rating: 4.5
      }]);
      done();
    });

    it('should be sorted by artist_name and name descending', function(done) {
      band_song_list.sort_type('artist_desc');
      var got = band_song_list.filtered_list().map(map_song);
      got.should.eql([{
        song_name: 'Help',
        artist_name: 'The Beatles',
        song_status: 0,
        member_rating: 4,
        average_rating: 4.5
      }, {
        song_name: 'Zelda Goes To Hollywood',
        artist_name: 'Aardvarks Rule',
        song_status: -1,
        member_rating: 2,
        average_rating: 2.5
      }, {
        song_name: 'Help',
        artist_name: 'Aardvarks Rule',
        song_status: 4,
        member_rating: 3,
        average_rating: 2
      }]);
      done();
    });

    it('should be sorted by member_rating, name and artist_name ascending', function(done) {
      band_song_list.sort_type('rating_asc');
      var got = band_song_list.filtered_list().map(map_song);
      got.should.eql([{
        song_name: 'Zelda Goes To Hollywood',
        artist_name: 'Aardvarks Rule',
        song_status: -1,
        member_rating: 2,
        average_rating: 2.5
      }, {
        song_name: 'Help',
        artist_name: 'Aardvarks Rule',
        song_status: 4,
        member_rating: 3,
        average_rating: 2
      }, {
        song_name: 'Help',
        artist_name: 'The Beatles',
        song_status: 0,
        member_rating: 4,
        average_rating: 4.5
      }]);
      done();
    });

    it('should be sorted by member_rating, name and artist_name descending', function(done) {
      band_song_list.sort_type('rating_desc');
      var got = band_song_list.filtered_list().map(map_song);
      got.should.eql([{
        song_name: 'Help',
        artist_name: 'The Beatles',
        song_status: 0,
        member_rating: 4,
        average_rating: 4.5
      }, {
        song_name: 'Help',
        artist_name: 'Aardvarks Rule',
        song_status: 4,
        member_rating: 3,
        average_rating: 2
      }, {
        song_name: 'Zelda Goes To Hollywood',
        artist_name: 'Aardvarks Rule',
        song_status: -1,
        member_rating: 2,
        average_rating: 2.5
      }]);
      done();
    });
  });
});
