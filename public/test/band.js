var band_model = {
  all_bands: [{
    id: 45, name: 'Plover'
  }, {
    id: 16, name: 'Plugh'
  }, {
    id: 63, name: 'Xyzzy'
  }]
};

describe('Band', function() {
  describe('#Instantiate', function() {
    var band;
    var expected_id = 1;
    var expected_name = 'Band Number 01';

    it('should create a band object', function(done) {
      band = new Band(expected_id, expected_name);
      should.exist(band);
      done();
    });

    it('should have an id', function(done) {
      band.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(band.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      band.id().should.eql(expected_id);
      done();
    });

    it('should have a name', function(done) {
      band.should.have.property('name');
      done();
    });

    it('should have observable name', function(done) {
      ko.isObservable(band.name).should.be.true;
      done();
    });

    it('should have name set to expected', function(done) {
      band.name().should.eql(expected_name);
      done();
    });

    after(function(done) {
      delete band;
      band = null;
      done();
    });
  });

  describe('loadById', function() {
    var band;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should call the band API', function(done) {
      svc.get.result = { band: band_model.all_bands[1] };
      Band.loadById(16, function(result) {
        should.exist(result);
        band = result;
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './band?id=16',
        'function'
      ]]);
      done();
    });

    it('should get the band', function(done) {
      should.exist(band);
      band.should.be.an.instanceOf(Band);
      done();
    });

    it('should be a valid band', function(done) {
      band.should.have.property('id');
      ko.isObservable(band.id).should.be.true;
      band.id().should.eql(band_model.all_bands[1].id);
      band.should.have.property('name');
      ko.isObservable(band.name).should.be.true;
      band.name().should.eql(band_model.all_bands[1].name);
      done();
    });
  });
});

describe('BandList', function() {
  var band_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = band_model;
    svc.resetCalls();
    done();
  });

  it('should create a band list', function(done) {
    band_list = new BandList();
    should.exist(band_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(band_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    band_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './band',
      'function'
    ]]);
    done();
  });

  it('should have all the bands', function(done) {
    band_list.list().should.have.length(band_model.all_bands.length);
    done();
  });

  it('should have an id and name in each record', function() {
    band_list.list().forEach(function(band, index) {
      band.should.have.property('id');
      ko.isObservable(band.id).should.be.true;
      band.id().should.eql(band_model.all_bands[index].id);
      band.should.have.property('name');
      ko.isObservable(band.name).should.be.true;
      band.name().should.eql(band_model.all_bands[index].name);
    });
  });
});
