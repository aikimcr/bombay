var song_rating_model = {
  all_song_ratings: [{
    id: 45, band_member_id: 12, band_song_id: 2, rating: 3
  }, {
    id: 16, band_member_id: 40, band_song_id: 10, rating: 1
  }, {
    id: 63, band_member_id: 9, band_song_id: 5, rating: 4
  }]
};

describe('SongRating Table', function() {
  describe('#Instantiate', function() {
    var song_rating;
    var expected_id = 1;
    var expected_band_member_id = 12;
    var expected_band_song_id = 10;
    var expected_rating = 3;

    it('should create a song_rating object', function(done) {
      song_rating = new SongRating(
        expected_id,
        expected_band_member_id,
        expected_band_song_id,
        expected_rating
      );
      should.exist(song_rating);
      done();
    });

    it('should have an id', function(done) {
      song_rating.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(song_rating.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      song_rating.id().should.eql(expected_id);
      done();
    });

    it('should have a band_member_id', function(done) {
      song_rating.should.have.property('band_member_id');
      done();
    });

    it('should have observable band_member_id', function(done) {
      ko.isObservable(song_rating.band_member_id).should.be.true;
      done();
    });

    it('should have band_member_id set to expected', function(done) {
      song_rating.band_member_id().should.eql(expected_band_member_id);
      done();
    });

    it('should have a band_song_id', function(done) {
      song_rating.should.have.property('band_song_id');
      done();
    });

    it('should have observable band_song_id', function(done) {
      ko.isObservable(song_rating.band_song_id).should.be.true;
      done();
    });

    it('should have band_song_id set to expected', function(done) {
      song_rating.band_song_id().should.eql(expected_band_song_id);
      done();
    });

    it('should have a song_rating', function(done) {
      song_rating.should.have.property('rating');
      done();
    });

    it('should have observable song_rating', function(done) {
      ko.isObservable(song_rating.rating).should.be.true;
      done();
    });

    it('should have song_rating set to expected', function(done) {
      song_rating.rating().should.eql(expected_rating);
      done();
    });

    after(function(done) {
      delete song_rating;
      song_rating = null;
      done();
    });
  });

  describe('Refresh', function() {
    var song_rating;
    var expected_id = 45;
    var expected_band_member_id = 1;
    var expected_band_song_id = 1;
    var expected_rating = 5;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a song_rating object', function(done) {
      song_rating = new SongRating(
        expected_id,
        expected_band_member_id,
        expected_band_song_id,
        expected_rating
      );
      should.exist(song_rating);
      done();
    });

    it('should call the song_rating API', function(done) {
      svc.get.result = { song_rating: song_rating_model.all_song_ratings[0] };
      song_rating.refresh(function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.not.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './song_rating?id=' + expected_id,
        'function'
      ]]);
      done();
    });

    it('should have changed the fields', function(done) {
      song_rating.band_member_id().should.eql(song_rating_model.all_song_ratings[0].band_member_id);
      song_rating.band_song_id().should.eql(song_rating_model.all_song_ratings[0].band_song_id);
      song_rating.rating().should.eql(song_rating_model.all_song_ratings[0].rating);
      done();
    });
  });

  describe('Put', function() {
    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    before(function(done) {
      manager.song_ratings.clear();
      var song_rating = new SongRating(4231, 67, 367, 4);
      manager.song_ratings.insert(song_rating);
      done();
    });

    var song_rating;
    it('should get the song_rating', function(done) {
      song_rating = manager.song_ratings.getById(4231);
      check_object_values(song_rating, {
        id: 4231,
        band_member_id: 67,
        band_song_id: 367,
        rating: 4
      });
      done();
    });

    it('should call the band API', function(done) {
      svc.put.result = { song_rating: {
        id: 4231,
        band_member_id: 67,
        band_song_id: 367,
        rating: 2
      } };
      song_rating.update({rating: 2}, function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.put.calls.should.be.eql(1);
      svc.put.params.should.eql([[
        './song_rating',
        'function',
        {id: 4231, rating: 2}
      ]]);
      done();
    });

    it('should have modified the song_rating in the list', function(done) {
      var new_song_rating = manager.song_ratings.getById(4231);
      check_object_values(new_song_rating, {
        id: 4231,
        band_member_id: 67,
        band_song_id: 367,
        rating: 2,
      });
      done();
    });
  });
});

describe('SongRating List', function() {
  var song_rating_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = song_rating_model;
    svc.resetCalls();
    done();
  });

  it('should create a song_rating list', function(done) {
    song_rating_list = new SongRatingList();
    should.exist(song_rating_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(song_rating_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    song_rating_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './song_rating',
      'function'
    ]]);
    done();
  });

  it('should have all the song_ratings', function(done) {
    song_rating_list.list().should.have.length(song_rating_model.all_song_ratings.length);
    done();
  });

  it('should have an id, band_member_id, band_song_id and song_rating in each record', function() {
    song_rating_list.list().forEach(function(song_rating, index) {
      song_rating.should.have.property('id');
      ko.isObservable(song_rating.id).should.be.true;
      song_rating.id().should.eql(song_rating_model.all_song_ratings[index].id);
      song_rating.should.have.property('band_member_id');
      ko.isObservable(song_rating.band_member_id).should.be.true;
      song_rating.band_member_id().should.eql(song_rating_model.all_song_ratings[index].band_member_id);
      song_rating.should.have.property('band_song_id');
      ko.isObservable(song_rating.band_song_id).should.be.true;
      song_rating.band_song_id().should.eql(song_rating_model.all_song_ratings[index].band_song_id);
      song_rating.should.have.property('rating');
      ko.isObservable(song_rating.rating).should.be.true;
      song_rating.rating().should.eql(song_rating_model.all_song_ratings[index].rating);
    });
  });
});
