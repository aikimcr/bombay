var artist_model = {
  all_artists: [{
    id: 13, name: 'Twisty Maze'
  }, {
    id: 12, name: 'Canyon'
  }, {
    id: 90, name: 'Pump House'
  }]
};

describe('Artist Table', function() {
  describe('#Instantiate', function() {
    var artist;
    var expected_id = 1;
    var expected_name = 'Artist Number 01';

    it('should create a artist object', function(done) {
      artist = new Artist(expected_id, expected_name);
      should.exist(artist);
      done();
    });

    it('should have an id', function(done) {
      artist.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(artist.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      artist.id().should.eql(expected_id);
      done();
    });

    it('should have a name', function(done) {
      artist.should.have.property('name');
      done();
    });

    it('should have observable name', function(done) {
      ko.isObservable(artist.name).should.be.true;
      done();
    });

    it('should have name set to expected', function(done) {
      artist.name().should.eql(expected_name);
      done();
    });

    after(function(done) {
      delete artist;
      artist = null;
      done();
    });
  });

  describe('loadById', function() {
    var artist;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should call the artist API', function(done) {
      svc.get.result = { artist: artist_model.all_artists[1] };
      Artist.loadById(16, function(result) {
        should.exist(result);
        artist = result;
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './artist?id=16',
        'function'
      ]]);
      done();
    });

    it('should get the artist', function(done) {
      should.exist(artist);
      artist.should.be.an.instanceOf(Artist);
      done();
    });

    it('should be a valid artist', function(done) {
      artist.should.have.property('id');
      ko.isObservable(artist.id).should.be.true;
      artist.id().should.eql(artist_model.all_artists[1].id);
      artist.should.have.property('name');
      ko.isObservable(artist.name).should.be.true;
      artist.name().should.eql(artist_model.all_artists[1].name);
      done();
    });
  });

  describe('Delete', function() {
    var artist;
    var expected_id = 1;
    var expected_name = 'Artist Number 01';
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a artist object', function(done) {
      artist = new Artist(expected_id, expected_name);
      should.exist(artist);
      done();
    });

    it('should call the artist API', function(done) {
      svc.delete.result = {artist: 1};
      svc.get.result = artist_model;
      artist.delete(function (result) {
        should.exist(result);
        result.should.have.property('artist');
        result.artist.should.eql(1);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './artist?id=1',
        'function'
      ]]);
      done();
    });
  });
});

describe('ArtistList', function() {
  var artist_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = artist_model;
    svc.resetCalls();
    done();
  });

  it('should create a artist list', function(done) {
    artist_list = new ArtistList();
    should.exist(artist_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(artist_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    artist_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './artist',
      'function'
    ]]);
    done();
  });

  it('should have all the artists', function(done) {
    artist_list.list().should.have.length(artist_model.all_artists.length);
    done();
  });

  it('should have an id and name in each record', function() {
    artist_list.list().forEach(function(artist, index) {
      artist.should.have.property('id');
      ko.isObservable(artist.id).should.be.true;
      artist.id().should.eql(artist_model.all_artists[index].id);
      artist.should.have.property('name');
      ko.isObservable(artist.name).should.be.true;
      artist.name().should.eql(artist_model.all_artists[index].name);
    });
  });
});
