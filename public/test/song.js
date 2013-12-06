var song_model = {
  all_songs: [{
    id: 45, name: 'Plover', artist_id: 3
  }, {
    id: 16, name: 'Plugh', artist_id: 6
  }, {
    id: 63, name: 'Xyzzy', artist_id: 10
  }]
};

describe('Song Table', function() {
  describe('#Instantiate', function() {
    var song;
    var expected_id = 1;
    var expected_name = 'Song Number 01';
    var expected_artist_id = 12;

    it('should create a song object', function(done) {
      song = new Song(expected_id, expected_name, expected_artist_id);
      should.exist(song);
      done();
    });

    it('should have an id', function(done) {
      song.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(song.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      song.id().should.eql(expected_id);
      done();
    });

    it('should have a name', function(done) {
      song.should.have.property('name');
      done();
    });

    it('should have observable name', function(done) {
      ko.isObservable(song.name).should.be.true;
      done();
    });

    it('should have name set to expected', function(done) {
      song.name().should.eql(expected_name);
      done();
    });

    it('should have a artist_id', function(done) {
      song.should.have.property('artist_id');
      done();
    });

    it('should have observable artist_id', function(done) {
      ko.isObservable(song.artist_id).should.be.true;
      done();
    });

    it('should have artist_id set to expected', function(done) {
      song.artist_id().should.eql(expected_artist_id);
      done();
    });

    after(function(done) {
      delete song;
      song = null;
      done();
    });
  });

  describe('loadById', function() {
    var song;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should call the song API', function(done) {
      svc.get.result = { song: song_model.all_songs[1] };
      Song.loadById(16, function(result) {
        should.exist(result);
        song = result;
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './song?id=16',
        'function'
      ]]);
      done();
    });

    it('should get the song', function(done) {
      should.exist(song);
      song.should.be.an.instanceOf(Song);
      done();
    });

    it('should be a valid song', function(done) {
      song.should.have.property('id');
      ko.isObservable(song.id).should.be.true;
      song.id().should.eql(song_model.all_songs[1].id);
      song.should.have.property('name');
      ko.isObservable(song.name).should.be.true;
      song.name().should.eql(song_model.all_songs[1].name);
      song.should.have.property('artist_id');
      ko.isObservable(song.artist_id).should.be.true;
      song.artist_id().should.eql(song_model.all_songs[1].artist_id);
      done();
    });
  });

  describe('Delete', function() {
    var song;
    var expected_id = 1;
    var expected_name = 'Song Number 01';
    var expected_artist_id = 1;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a song object', function(done) {
      song = new Song(expected_id, expected_name, expected_artist_id);
      should.exist(song);
      done();
    });

    it('should call the song API', function(done) {
      svc.delete.result = {song: 1};
      svc.get.result = song_model;
      song.delete(function (result) {
        should.exist(result);
        result.should.have.property('song');
        result.song.should.eql(1);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './song?id=1',
        'function'
      ]]);
      done();
    });
  });
});

describe('SongList', function() {
  var song_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = song_model;
    svc.resetCalls();
    done();
  });

  it('should create a song list', function(done) {
    song_list = new SongList();
    should.exist(song_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(song_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    song_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './song',
      'function'
    ]]);
    done();
  });

  it('should have all the songs', function(done) {
    song_list.list().should.have.length(song_model.all_songs.length);
    done();
  });

  it('should have an id, name and artist_id in each record', function() {
    song_list.list().forEach(function(song, index) {
      song.should.have.property('id');
      ko.isObservable(song.id).should.be.true;
      song.id().should.eql(song_model.all_songs[index].id);
      song.should.have.property('name');
      ko.isObservable(song.name).should.be.true;
      song.name().should.eql(song_model.all_songs[index].name);
      song.should.have.property('artist_id');
      ko.isObservable(song.artist_id).should.be.true;
      song.artist_id().should.eql(song_model.all_songs[index].artist_id);
    });
  });
});
