var band_model = {
  all_bands: [{
    id: 45, name: 'Plover'
  }, {
    id: 16, name: 'Plugh'
  }, {
    id: 63, name: 'Xyzzy'
  }]
};

describe('Band Table', function() {
  describe('Instantiate', function() {
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

  describe('Refresh', function() {
    var band;
    var expected_id = 45;
    var expected_name = 'Not a bird';
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a band object', function(done) {
      band = new Band(expected_id, expected_name);
      should.exist(band);
      done();
    });

    it('should call the band API', function(done) {
      svc.get.result = { band: band_model.all_bands[0] };
      band.refresh(function(result) {
        should.exist(result);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './band?id=45',
        'function'
      ]]);
      done();
    });

    it('should have changed the name', function(done) {
      band.name().should.eql(band_model.all_bands[0].name);
      done();
    });
  });

  describe('Delete', function() {
    var band;
    var expected_id = 1;
    var expected_name = 'Band Number 01';
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a band object', function(done) {
      band = new Band(expected_id, expected_name);
      should.exist(band);
      done();
    });

    it('should call the band API', function(done) {
      svc.delete.result = {band: 1};
      svc.get.result = band_model;
      band.delete(function (result) {
        should.exist(result);
        result.should.have.property('band');
        result.band.should.eql(1);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './band?id=1',
        'function'
      ]]);
      done();
    });
  });
});

describe('Band List', function() {
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

describe('BandFilters', function() {
  var band_list = function() {
    return manager.bands.filtered_list().map(function(band) {
      return {id: band.id(), name: band.name()};
    });
  };

  before(function(done) {
    load_test_models();
    done();
  });

  it('should have a list of sort types', function(done) {
    manager.bands.sort_types().should.eql([{
      value: 'name_asc', label: 'Name (A-Z)'
    }, {
      value: 'name_desc', label: 'Name (Z-A)'
    }]);
    done();
  });

  it('should have bands', function(done) {
    band_list().length.should.eql(4);
    done();
  });

  it('should have the bands sorted by name, ascending', function(done) {
    band_list().should.eql([{
      id: 2, name: 'Aces and Eights'
    }, {
      id: 3, name: 'Cover Story'
    }, {
      id: 4, name: 'Time Out'
    }, {
      id: 1, name: 'Wild At Heart'
    }]);
    done();
  });

  it('should have the bands sorted by name, descending', function(done) {
    manager.bands.sort_type('name_desc');
    band_list().should.eql([{
      id: 1, name: 'Wild At Heart'
    }, {
      id: 4, name: 'Time Out'
    }, {
      id: 3, name: 'Cover Story'
    }, {
      id: 2, name: 'Aces and Eights'
    }]);
    done();
  });

  it('should return only Cover Story', function(done) {
    manager.bands.filter_values.name('cover');
    band_list().should.eql([{
      id: 3, name: 'Cover Story'
    }]);
    done();
  });

  it('should return only bands with an "A" in the name', function(done) {
    manager.bands.filter_values.name('A');
    band_list().should.eql([{
      id: 1, name: 'Wild At Heart'
    }, {
      id: 2, name: 'Aces and Eights'
    }]);
    done();
  });
});
