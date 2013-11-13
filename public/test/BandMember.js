var band_member_model = {
  all_band_members: [{
    id: 45, band_id: 12, person_id: 2, band_admin: true
  }, {
    id: 16, band_id: 40, person_id: 10, band_admin: false
  }, {
    id: 63, band_id: 9, person_id: 5, band_admin: false
  }]
};

describe('BandMember', function() {
  describe('#Instantiate', function() {
    var band_member;
    var expected_id = 1;
    var expected_band_id = 12;
    var expected_person_id = 10;
    var expected_band_admin = true;

    it('should create a band_member object', function(done) {
      band_member = new BandMember(
        expected_id,
        expected_band_id,
        expected_person_id,
        expected_band_admin
      );
      should.exist(band_member);
      done();
    });

    it('should have an id', function(done) {
      band_member.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(band_member.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      band_member.id().should.eql(expected_id);
      done();
    });

    it('should have a band_id', function(done) {
      band_member.should.have.property('band_id');
      done();
    });

    it('should have observable band_id', function(done) {
      ko.isObservable(band_member.band_id).should.be.true;
      done();
    });

    it('should have band_id set to expected', function(done) {
      band_member.band_id().should.eql(expected_band_id);
      done();
    });

    it('should have a person_id', function(done) {
      band_member.should.have.property('person_id');
      done();
    });

    it('should have observable person_id', function(done) {
      ko.isObservable(band_member.person_id).should.be.true;
      done();
    });

    it('should have person_id set to expected', function(done) {
      band_member.person_id().should.eql(expected_person_id);
      done();
    });

    it('should have a band_admin', function(done) {
      band_member.should.have.property('band_admin');
      done();
    });

    it('should have observable band_admin', function(done) {
      ko.isObservable(band_member.band_admin).should.be.true;
      done();
    });

    it('should have band_admin set to expected', function(done) {
      band_member.band_admin().should.eql(expected_band_admin);
      done();
    });

    after(function(done) {
      delete band_member;
      band_member = null;
      done();
    });
  });

  describe('loadById', function() {
    var band_member;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should call the band_member API', function(done) {
      svc.get.result = { band_member: band_member_model.all_band_members[1] };
      BandMember.loadById(16, function(result) {
        should.exist(result);
        band_member = result;
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './band_member?id=16',
        'function'
      ]]);
      done();
    });

    it('should get the band_member', function(done) {
      should.exist(band_member);
      band_member.should.be.an.instanceOf(BandMember);
      done();
    });

    it('should be a valid band_member', function(done) {
      band_member.should.have.property('id');
      ko.isObservable(band_member.id).should.be.true;
      band_member.id().should.eql(band_member_model.all_band_members[1].id);
      band_member.should.have.property('band_id');
      ko.isObservable(band_member.band_id).should.be.true;
      band_member.band_id().should.eql(band_member_model.all_band_members[1].band_id);
      band_member.should.have.property('person_id');
      ko.isObservable(band_member.person_id).should.be.true;
      band_member.person_id().should.eql(band_member_model.all_band_members[1].person_id);
      band_member.should.have.property('band_admin');
      ko.isObservable(band_member.band_admin).should.be.true;
      band_member.band_admin().should.eql(band_member_model.all_band_members[1].band_admin);
      done();
    });
  });
});

describe('BandMemberList', function() {
  var band_member_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = band_member_model;
    svc.resetCalls();
    done();
  });

  it('should create a band_member list', function(done) {
    band_member_list = new BandMemberList();
    should.exist(band_member_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(band_member_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    band_member_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './band_member',
      'function'
    ]]);
    done();
  });

  it('should have all the band_members', function(done) {
    band_member_list.list().should.have.length(band_member_model.all_band_members.length);
    done();
  });

  it('should have an id, band_id, person_id and band_admin in each record', function() {
    band_member_list.list().forEach(function(band_member, index) {
      band_member.should.have.property('id');
      ko.isObservable(band_member.id).should.be.true;
      band_member.id().should.eql(band_member_model.all_band_members[index].id);
      band_member.should.have.property('band_id');
      ko.isObservable(band_member.band_id).should.be.true;
      band_member.band_id().should.eql(band_member_model.all_band_members[index].band_id);
      band_member.should.have.property('person_id');
      ko.isObservable(band_member.person_id).should.be.true;
      band_member.person_id().should.eql(band_member_model.all_band_members[index].person_id);
      band_member.should.have.property('band_admin');
      ko.isObservable(band_member.band_admin).should.be.true;
      band_member.band_admin().should.eql(band_member_model.all_band_members[index].band_admin);
    });
  });
});
