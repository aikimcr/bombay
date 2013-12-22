var person_model = {
  all_persons: [{
    id: 16,
    name: 'lbird',
    full_name: 'Little Bird',
    email: 'lbird@colossalcave.com',
    system_admin: true
  }, {
    id: 54,
    name: 'bsnake',
    full_name: 'Big Snake',
    email: 'bsname@colossalcave.com',
    system_admin: false
  }, {
    id: 3,
    name: 'ndwarf',
    full_name: 'Nasty Dwarf',
    email: 'ndwarf@colossalcave.com',
    system_admin: false
  }]
};

describe('Person Table', function() {
  describe('#Instantiate', function() {
    var person;
    var expected_id = 1;
    var expected_name = 'lbird';
    var expected_full_name = 'Little Bird';
    var expected_email = 'lbird@colossalcave.com';
    var expected_system_admin = true;

    it('should create a person object', function(done) {
      person = new Person(
        expected_id,
        expected_name,
        expected_full_name,
        expected_email,
        expected_system_admin
      );
      should.exist(person);
      done();
    });

    it('should have an id', function(done) {
      person.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(person.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      person.id().should.eql(expected_id);
      done();
    });

    it('should have an name', function(done) {
      person.should.have.property('name');
      done();
    });

    it('should have observable name', function(done) {
      ko.isObservable(person.name).should.be.true;
      done();
    });

    it('should have name set to expected', function(done) {
      person.name().should.eql(expected_name);
      done();
    });

    it('should have an full_name', function(done) {
      person.should.have.property('full_name');
      done();
    });

    it('should have observable full_name', function(done) {
      ko.isObservable(person.full_name).should.be.true;
      done();
    });

    it('should have full_name set to expected', function(done) {
      person.full_name().should.eql(expected_full_name);
      done();
    });

    it('should have an email', function(done) {
      person.should.have.property('email');
      done();
    });

    it('should have observable email', function(done) {
      ko.isObservable(person.email).should.be.true;
      done();
    });

    it('should have email set to expected', function(done) {
      person.email().should.eql(expected_email);
      done();
    });

    it('should have an system_admin', function(done) {
      person.should.have.property('system_admin');
      done();
    });

    it('should have observable system_admin', function(done) {
      ko.isObservable(person.system_admin).should.be.true;
      done();
    });

    it('should have system_admin set to expected', function(done) {
      person.system_admin().should.eql(expected_system_admin);
      done();
    });
  });

  describe('loadById', function() {
    var person;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should call the person API', function(done) {
      svc.get.result = { person: person_model.all_persons[1] };
      Person.loadById(16, function(result) {
        should.exist(result);
        person = result;
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './person?id=16',
        'function'
      ]]);
      done();
    });

    it('should get the person', function(done) {
      should.exist(person);
      person.should.be.an.instanceOf(Person);
      done();
    });

    it('should be a valid person', function(done) {
      person.should.have.property('id');
      ko.isObservable(person.id).should.be.true;
      person.id().should.eql(person_model.all_persons[1].id);
      person.should.have.property('name');
      ko.isObservable(person.name).should.be.true;
      person.name().should.eql(person_model.all_persons[1].name);
      person.should.have.property('full_name');
      ko.isObservable(person.full_name).should.be.true;
      person.full_name().should.eql(person_model.all_persons[1].full_name);
      person.should.have.property('email');
      ko.isObservable(person.email).should.be.true;
      person.email().should.eql(person_model.all_persons[1].email);
      person.should.have.property('system_admin');
      ko.isObservable(person.system_admin).should.be.true;
      person.system_admin().should.eql(person_model.all_persons[1].system_admin);
      done();
    });
  });

  describe('Delete', function() {
    var person;
    var expected_id = 1;
    var expected_name = 'Person Number 01';
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a person object', function(done) {
      person = new Person(expected_id, expected_name);
      should.exist(person);
      done();
    });

    it('should call the person API', function(done) {
      svc.delete.result = {person: 1};
      svc.get.result = person_model;
      person.delete(function (result) {
        should.exist(result);
        result.should.have.property('person');
        result.person.should.eql(1);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './person?id=1',
        'function'
      ]]);
      done();
    });
  });
});

describe('PersonList', function() {
  var person_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = person_model;
    svc.resetCalls();
    done();
  });

  it('should create a person list', function(done) {
    person_list = new PersonList();
    should.exist(person_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(person_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    person_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './person',
      'function'
    ]]);
    done();
  });

  it('should have all the persons', function(done) {
    person_list.list().should.have.length(person_model.all_persons.length);
    done();
  });

  it('should have an id and name in each record', function() {
    person_list.list().forEach(function(person, index) {
      person.should.have.property('id');
      ko.isObservable(person.id).should.be.true;
      person.id().should.eql(person_model.all_persons[index].id);
      person.should.have.property('name');
      ko.isObservable(person.name).should.be.true;
      person.name().should.eql(person_model.all_persons[index].name);
      person.should.have.property('full_name');
      ko.isObservable(person.full_name).should.be.true;
      person.full_name().should.eql(person_model.all_persons[index].full_name);
      person.should.have.property('email');
      ko.isObservable(person.email).should.be.true;
      person.email().should.eql(person_model.all_persons[index].email);
      person.should.have.property('system_admin');
      ko.isObservable(person.system_admin).should.be.true;
      person.system_admin().should.eql(person_model.all_persons[index].system_admin);
    });
  });
});

describe('PersonFilters', function() {
  var person_list = function() {
    return manager.persons.filtered_list().map(function(person) {
      return {id: person.id(), name: person.name(), full_name: person.full_name(), email: person.email(), system_admin: !!person.system_admin()};
    });
  };

  before(function(done) {
    load_test_models();
    done();
  });

  it('should have persons', function(done) {
    person_list().length.should.eql(4);
    done();
  });

  it('should have the persons sorted by full_name, ascending', function(done) {
    person_list().should.eql([{
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }]);
    done();
  });

  it('should have the persons sorted by full_name, descending', function(done) {
    manager.persons.sort_type('full_name_desc');
    person_list().should.eql([{
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }, {
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }]);
    done();
  });

  it('should have the persons sorted by name, ascending', function(done) {
    manager.persons.sort_type('name_asc');
    person_list().should.eql([{
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }]);
    done();
  });

  it('should have the persons sorted by name, descending', function(done) {
    manager.persons.sort_type('name_desc');
    person_list().should.eql([{
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }, {
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }]);
    done();
  });

  it('should have the persons sorted by email, ascending', function(done) {
    manager.persons.sort_type('email_asc');
    person_list().should.eql([{
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }]);
    done();
  });

  it('should have the persons sorted by email, descending', function(done) {
    manager.persons.sort_type('email_desc');
    person_list().should.eql([{
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }, {
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }]);
    done();
  });

  it('should return only Elmer Fudd', function(done) {
    manager.persons.sort_type('name_desc');
    manager.persons.filter_values.full_name('Fudd');
    person_list().should.eql([{
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }]);
    manager.persons.filter_values.full_name('');
    done();
  });

  it('should return only persons with an "F" in the full_name', function(done) {
    manager.persons.sort_type('name_desc');
    manager.persons.filter_values.full_name('F');
    person_list().should.eql([{
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }]);
    manager.persons.filter_values.full_name('');
    done();
  });

  it('should return only Bugs Bunny', function(done) {
    manager.persons.sort_type('name_desc');
    manager.persons.filter_values.name('Bunny');
    person_list().should.eql([{
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }]);
    manager.persons.filter_values.name('');
    done();
  });

  it('should return only Daffy Duck', function(done) {
    manager.persons.sort_type('name_desc');
    manager.persons.filter_values.email('DDu');
    person_list().should.eql([{
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }]);
    manager.persons.filter_values.email('');
    done();
  });

  it('should return only Administrator', function(done) {
    manager.persons.sort_type('name_desc');
    manager.persons.filter_values.system_admin(true);
    person_list().should.eql([{
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: true
    }]);
    manager.persons.filter_values.system_admin(null);
    done();
  });

  it('should not return Administrator', function(done) {
    manager.persons.sort_type('name_desc');
    manager.persons.filter_values.system_admin(false);
    person_list().should.eql([{
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: false
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: false
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: false
    }]);
    manager.persons.filter_values.system_admin(null);
    done();
  });
});
