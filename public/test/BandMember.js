var band_member_model = {
  all_band_members: [{
    id: 45, band_id: 12, person_id: 2, band_admin: true
  }, {
    id: 16, band_id: 40, person_id: 10, band_admin: false
  }, {
    id: 63, band_id: 9, person_id: 5, band_admin: false
  }]
};

describe('BandMember Table', function() {
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

  describe('Refresh', function() {
    var band_member;
    var expected_id = 45;
    var expected_band_id = 1;
    var expected_person_id = 1;
    var expected_band_admin = 0;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

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

    it('should call the band_member API', function(done) {
      svc.get.result = { band_member: band_member_model.all_band_members[0] };
      band_member.refresh(function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.not.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './band_member?id=45',
        'function'
      ]]);
      done();
    });

    it('should have changed the fields', function(done) {
      band_member.band_id().should.eql(band_member_model.all_band_members[0].band_id);
      band_member.person_id().should.eql(band_member_model.all_band_members[0].person_id);
      band_member.band_admin().should.eql(band_member_model.all_band_members[0].band_admin);
      done();
    });
  });

  describe('Post', function() {
    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    before(function(done) {
      manager.band_members.clear();
      done();
    });

    it('should call the band_member API', function(done) {
      svc.post.result = { band_member: {
        id: 4231,
        band_id: 67,
        person_id: 367,
        band_admin: false
      } };
      manager.band_members.create({
        band_id: 67,
        person_id: 367,
        band_admin: false
      }, function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.post.calls.should.be.eql(1);
      svc.post.params.should.eql([[
        './band_member',
        'function',
        {
          band_id: 67,
          person_id: 367,
          band_admin: false
        }
      ]]);
      done();
    });

    it('should have added the band_member into the list', function(done) {
      var new_band_member = manager.band_members.getById(4231);
      check_object_values(new_band_member, {
        id: 4231,
        band_id: 67,
        person_id: 367,
        band_admin: false
      });
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
      manager.band_members.clear();
      var band_member = new BandMember(4231, 67, 367, false);
      manager.band_members.insert(band_member);
      done();
    });

    var band;
    it('should get the band', function(done) {
      band_member = manager.band_members.getById(4231);
      check_object_values(band_member, {
        id: 4231,
        band_id: 67,
        person_id: 367,
        band_admin: false
      });
      done();
    });

    it('should call the band API', function(done) {
      svc.put.result = { band_member: {
        id: 4231,
        band_id: 67,
        person_id: 367,
        band_admin: true
      } };
      band_member.update({band_admin: true}, function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.put.calls.should.be.eql(1);
      svc.put.params.should.eql([[
        './band_member',
        'function',
        {id: 4231, band_admin: true}
      ]]);
      done();
    });

    it('should have modified the band_member in the list', function(done) {
      var new_band_member = manager.band_members.getById(4231);
      check_object_values(new_band_member, {
        id: 4231,
        band_id: 67,
        person_id: 367,
        band_admin: true
      });
      done();
    });
  });

  describe('Delete', function() {
    var band_member;
    var expected_id = 1;
    var expected_band_id = 1;
    var expected_person_id = 1;
    var expected_band_admin = 1;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a band_member object', function(done) {
      var band_member = new BandMember(expected_id, expected_band_id, expected_person_id, expected_band_admin);
      should.exist(band_member);
      manager.band_members.insert(band_member);
      done();
    });

    it('should get the band_member', function(done) {
      band_member = manager.band_members.getById(expected_id);
      check_object_values(band_member, {
        id: expected_id,
        band_id: expected_band_id,
        person_id: expected_person_id,
        band_admin: expected_band_admin
      });
      done();
    });

    it('should call the band_member API', function(done) {
      svc.delete.result = {band_member: {id: 1}};
      band_member.delete(function (result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.have.property('band_member');
        result.band_member.should.have.property('id');
        result.band_member.id.should.eql(expected_id);
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './band_member?id=1',
        'function'
      ]]);
      done();
    });

    it('should have removed the band_member from the list', function(done) {
      var band_member = manager.band_members.getById(expected_id);
      should.not.exist(band_member);
      done();
    });
  });
});

describe('BandMember List', function() {
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

describe('BandMember Filters', function() {
  var band_member_list = function() {
    return manager.band_members.filtered_list().map(function(band_member) {
      return {
        id: band_member.id(),
        band_id: band_member.band().id(),
        band_name: band_member.band().name(),
        person_id: band_member.person().id(),
        person_name: band_member.person().name(),
        person_full_name: band_member.person().full_name(),
        person_email: band_member.person().email(),
        band_admin: !!band_member.band_admin()
      };
    });
  };

  before(function(done) {
    load_test_models();
    done();
  });

  it('should have a list of sort types', function(done) {
    manager.band_members.sort_types().should.eql([{
      value: 'band_name_asc', label: 'Band Name (A-Z)'
    }, {
      value: 'band_name_desc', label: 'Band Name (Z-A)'
    }, {
      value: 'person_email_asc', label: 'Member Email (A-Z)'
    }, {
      value: 'person_email_desc', label: 'Member Email (Z-A)'
    }, {
      value: 'person_full_name_asc', label: 'Member Full Name (A-Z)'
    }, {
      value: 'person_full_name_desc', label: 'Member Full Name (Z-A)'
    }]);
    done();
  });

  it('should have band_members', function(done) {
    band_member_list().length.should.eql(9);
    done();
  });

  it('should have the band_members sorted by person_full_name and band_name, ascending', function(done) {
    manager.band_members.sort_type('person_full_name_asc');
    band_member_list().should.eql([{
      id: 9,
      band_id: 4,
      band_name: 'Time Out',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: true
    }, {
      id: 7,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }, {
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: false
    }, {
      id: 8,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: true
    }]);
    done();
  });

  it('should have the band_members sorted by person_name, descending', function(done) {
    manager.band_members.sort_type('person_full_name_desc');
    band_member_list().should.eql([{
      id: 8,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: true
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: false
    }, {
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }, {
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 7,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: true
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 9,
      band_id: 4,
      band_name: 'Time Out',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }]);
    done();
  });

  it('should have the band_members sorted by band_name, ascending', function(done) {
    manager.band_members.sort_type('band_name_asc');
    band_member_list().should.eql([{
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: true
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: false
    }, {
      id: 7,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 8,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: true
    }, {
      id: 9,
      band_id: 4,
      band_name: 'Time Out',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }]);
    done();
  });

  it('should have the band_members sorted by band_name, descending', function(done) {
    manager.band_members.sort_type('band_name_desc');
    band_member_list().should.eql([{
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 3,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 1,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 9,
      band_id: 4,
      band_name: 'Time Out',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }, {
      id: 8,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: true
    }, {
      id: 7,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: false
    }, {
      id: 6,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: false
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: true
    }]);
    done();
  });

  it('should return only dduck', function(done) {
    manager.band_members.sort_type('person_name_desc');
    manager.band_members.filter_values.person_name('duck');
    band_member_list().should.eql([{
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }]);
    manager.band_members.filter_values.person_name('');
    done();
  });

  it('should return only Daffy Duck', function(done) {
    manager.band_members.sort_type('person_name_desc');
    manager.band_members.filter_values.person_full_name('daFFy');
    band_member_list().should.eql([{
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }]);
    manager.band_members.filter_values.person_full_name('');
    done();
  });

  it('should return only dduck@foo.com', function(done) {
    manager.band_members.sort_type('person_name_desc');
    manager.band_members.filter_values.person_email('ddu');
    band_member_list().should.eql([{
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 4,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: false
    }]);
    manager.band_members.filter_values.person_email('');
    done();
  });

  it('should return only Time Out', function(done) {
    manager.band_members.sort_type('person_name_desc');
    manager.band_members.filter_values.band_name('ime ou');
    band_member_list().should.eql([{
      id: 9,
      band_id: 4,
      band_name: 'Time Out',
      person_id: 1,
      person_name: 'admin',
      person_full_name: 'Administrator',
      person_email: 'admin@foo.com',
      band_admin: false
    }]);
    manager.band_members.filter_values.band_name('');
    done();
  });

  it('should return only band admins', function(done) {
    manager.band_members.sort_type('band_name_desc');
    manager.band_members.filter_values.band_admin(true);
    band_member_list().should.eql([{
      id: 2,
      band_id: 1,
      band_name: 'Wild At Heart',
      person_id: 2,
      person_name: 'dduck',
      person_full_name: 'Daffy Duck',
      person_email: 'dduck@foo.com',
      band_admin: true
    }, {
      id: 8,
      band_id: 3,
      band_name: 'Cover Story',
      person_id: 4,
      person_name: 'efudd',
      person_full_name: 'Elmer Fudd',
      person_email: 'efudd@foo.com',
      band_admin: true
    }, {
      id: 5,
      band_id: 2,
      band_name: 'Aces and Eights',
      person_id: 3,
      person_name: 'bbunny',
      person_full_name: 'Bugs Bunny',
      person_email: 'bbunny@foo.com',
      band_admin: true
    }]);
    manager.band_members.filter_values.band_admin(null);
    done();
  });
});
