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
      band_song.status().should.eql(band_song_model.all_band_songs[1].song_status);
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
});

describe('BandSongFilters', function() {
  var band_song_list = function() {
    return manager.band_songs.filtered_list().map(function(band_song) {
      return {
        id: band_song.id(),
        band_id: band_song.band().id(),
        band_name: band_song.band().name(),
        song_id: band_song.song().id(),
        song_name: band_song.song().name(),
        artist_name: band_song.song().artist().name(),
        song_status: band_song.status()
      };
    });
  };

  before(function(done) {
    load_test_models();
    done();
  });

  it('should have a list of sort types', function(done) {
    manager.band_songs.sort_types().should.eql([{
      value: 'artist_name_asc', label: 'Artist Name (A-Z)'
    }, {
      value: 'artist_name_desc', label: 'Artist Name (Z-A)'
    }, {
      value: 'average_rating_desc', label: 'Average Rating (High to Low)'
    }, {
      value: 'average_rating_asc', label: 'Average Rating (Low to High)'
    }, {
      value: 'song_name_asc', label: 'Song Name (A-Z)'
    }, {
      value: 'song_name_desc', label: 'Song Name (Z-A)'
    }]);
    done();
  });

  it('should have band_songs', function(done) {
    band_song_list().length.should.eql(8);
    done();
  });

  it('should have the band_songs sorted by song_name and artist_name, ascending', function(done) {
    manager.band_songs.sort_type('song_name_asc');
    band_song_list().should.eql([{
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 6,
      song_name: 'California Girls',
      artist_name: 'Katy Perry',
      song_status: 0
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 5,
      song_name: 'Changes',
      artist_name: 'Black Sabbath',
      song_status: 4
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 1,
      song_name: 'Changes',
      artist_name: 'David Bowie',
      song_status: 0
    }, {
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 2,
      song_name: 'Help',
      artist_name: 'The Beatles',
      song_status: 1
    }, {
      id: 8,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 8,
      song_name: 'Lazy',
      artist_name: 'Deep Purple',
      song_status: -1
    }, {
      id: 7,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 7,
      song_name: 'Material Girl',
      artist_name: 'Madonna',
      song_status: 2
    }, {
      id: 4,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 4,
      song_name: 'You Shook Me',
      artist_name: 'Led Zeppelin',
      song_status: 3
    }, {
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 3,
      song_name: 'You Shook Me All Night Long',
      artist_name: 'AC/DC',
      song_status: -1
    }]);
    done();
  });

  it('should have the band_songs sorted by song_name and artist name, descending', function(done) {
    manager.band_songs.sort_type('song_name_desc');
    band_song_list().should.eql([{
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 3,
      song_name: 'You Shook Me All Night Long',
      artist_name: 'AC/DC',
      song_status: -1
    }, {
      id: 4,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 4,
      song_name: 'You Shook Me',
      artist_name: 'Led Zeppelin',
      song_status: 3
    }, {
      id: 7,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 7,
      song_name: 'Material Girl',
      artist_name: 'Madonna',
      song_status: 2
    }, {
      id: 8,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 8,
      song_name: 'Lazy',
      artist_name: 'Deep Purple',
      song_status: -1
    }, {
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 2,
      song_name: 'Help',
      artist_name: 'The Beatles',
      song_status: 1
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 1,
      song_name: 'Changes',
      artist_name: 'David Bowie',
      song_status: 0
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 5,
      song_name: 'Changes',
      artist_name: 'Black Sabbath',
      song_status: 4
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 6,
      song_name: 'California Girls',
      artist_name: 'Katy Perry',
      song_status: 0
    }]);
    done();
  });

  it('should have the band_songs sorted by artist_name and song_name, ascending', function(done) {
    manager.band_songs.sort_type('artist_name_asc');
    band_song_list().should.eql([{
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 3,
      song_name: 'You Shook Me All Night Long',
      artist_name: 'AC/DC',
      song_status: -1
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 5,
      song_name: 'Changes',
      artist_name: 'Black Sabbath',
      song_status: 4
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 1,
      song_name: 'Changes',
      artist_name: 'David Bowie',
      song_status: 0
    }, {
      id: 8,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 8,
      song_name: 'Lazy',
      artist_name: 'Deep Purple',
      song_status: -1
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 6,
      song_name: 'California Girls',
      artist_name: 'Katy Perry',
      song_status: 0
    }, {
      id: 4,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 4,
      song_name: 'You Shook Me',
      artist_name: 'Led Zeppelin',
      song_status: 3
    }, {
      id: 7,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 7,
      song_name: 'Material Girl',
      artist_name: 'Madonna',
      song_status: 2
    }, {
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 2,
      song_name: 'Help',
      artist_name: 'The Beatles',
      song_status: 1
    }]);
    done();
  });

  it('should have the band_songs sorted by artist_name and song_name, descending', function(done) {
    manager.band_songs.sort_type('artist_name_desc');
    band_song_list().should.eql([{
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 2,
      song_name: 'Help',
      artist_name: 'The Beatles',
      song_status: 1
    }, {
      id: 7,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 7,
      song_name: 'Material Girl',
      artist_name: 'Madonna',
      song_status: 2
    }, {
      id: 4,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 4,
      song_name: 'You Shook Me',
      artist_name: 'Led Zeppelin',
      song_status: 3
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 6,
      song_name: 'California Girls',
      artist_name: 'Katy Perry',
      song_status: 0
    }, {
      id: 8,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 8,
      song_name: 'Lazy',
      artist_name: 'Deep Purple',
      song_status: -1
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 1,
      song_name: 'Changes',
      artist_name: 'David Bowie',
      song_status: 0
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 5,
      song_name: 'Changes',
      artist_name: 'Black Sabbath',
      song_status: 4
    }, {
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 3,
      song_name: 'You Shook Me All Night Long',
      artist_name: 'AC/DC',
      song_status: -1
    }]);
    done();
  });

  it('should return only songs with name "Changes"', function(done) {
    manager.band_songs.sort_type('song_name_desc');
    manager.band_songs.filter_values.song_name('hangE');
    band_song_list().should.eql([{
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      song_id: 1,
      song_name: 'Changes',
      artist_name: 'David Bowie',
      song_status: 0
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 5,
      song_name: 'Changes',
      artist_name: 'Black Sabbath',
      song_status: 4
    }]);
    manager.band_songs.filter_values.song_name('');
    done();
  });

  it('should return only songs by Deep Purple', function(done) {
    manager.band_songs.sort_type('song_name_desc');
    manager.band_songs.filter_values.artist_id(8);
    band_song_list().should.eql([{
      id: 8,
      band_id: 2,
      band_name: 'Aces and Eights',
      song_id: 8,
      song_name: 'Lazy',
      artist_name: 'Deep Purple',
      song_status: -1
    }]);
    manager.band_songs.filter_values.artist_id(null);
    done();
  });
});
