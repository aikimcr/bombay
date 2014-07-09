var request_model = {
  all_requests: [{
    id: 1,
    band_id: 1,
    person_id: 1,
    description: 'Drop the little bird',
    request_type: constants.request_type.join_band,
    status: constants.request_status.accepted,
    timestamp: '2014-04-01 15:32:05'
  }]
};

describe('Request Table', function() {
  describe('Instantiate', function() {
    var request;

    var expected = {
      id: 1,
      band_id: 1,
      person_id: 1,
      description: 'Drop the little bird',
      request_type: constants.request_type.join_band,
      status: constants.request_status.pending,
      timestamp: '2014-04-01 15:32:05'
    };

    it('should create a request object', function(done) {
      request = new Request(
        expected.id,
        expected.request_type,
        expected.timestamp,
        expected.person_id,
        expected.band_id,
        expected.description,
        expected.status
      );
      check_object_values(request, expected);
      done();
    });
  });

  describe('Refresh', function() {
    var request;
    var init = {
      id: 1,
      band_id: 1,
      person_id: 1,
      description: 'Drop the little bird',
      request_type: constants.request_type.join_band,
      status: constants.request_status.pending,
      timestamp: '2014-04-01 15:32:05'
    };
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a request object', function(done) {
      request = new Request(
        init.id,
        init.request_type,
        init.timestamp,
        init.person_id,
        init.band_id,
        init.description,
        init.status
      );
      should.exist(request);
      done();
    });

    it('should call the request API', function(done) {
      svc.get.result = { request: request_model.all_requests[0] };
      request.refresh(function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.not.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.eql(1);
      svc.get.params.should.eql([[
        './request?id=' + init.id,
        'function',
      ]]);
      done();
    });

    it('should have changed the status', function(done) {
      request.status().should.eql(request_model.all_requests[0].status);
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
      manager.requests.clear();
      done();
    });

    it('should call the request API', function(done) {
      svc.post.result = { request: {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      } };
      manager.requests.create({
        band_id: 67,
        person_id: 82
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
        './request',
        'function',
        {
          band_id: 67,
          person_id: 82
        }
      ]]);
      done();
    });

    it('should have added the request into the list', function(done) {
      var new_request = manager.requests.getById(4231);
      check_object_values(new_request, {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
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
      manager.requests.clear();
      var request = new Request(
        4231,
        constants.request_type.join_band,
        '2014-04-01 15:32:05',
        82,
        67,
        'Drop the little monkey',
        constants.request_status.pending
      );
      manager.requests.insert(request);
      done();
    });

    var request;
    it('should get the request', function(done) {
      request = manager.requests.getById(4231);
      check_object_values(request, {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      });
      done();
    });

    it('should call the request API', function(done) {
      svc.put.result = { request: {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.accepted,
        timestamp: '2014-04-01 15:32:05'
      } };
      request.update({status: constants.request_status.accepted}, function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.put.calls.should.be.eql(1);
      svc.put.params.should.eql([[
        './request',
        'function',
        {
          id: 4231,
          status: constants.request_status.accepted
        }
      ]]);
      done();
    });

    it('should have modified the status of the request in the list', function(done) {
      var new_request = manager.requests.getById(4231);
      check_object_values(new_request, {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.accepted,
        timestamp: '2014-04-01 15:32:05'
      });
      done();
    });
  });

  describe('Delete', function() {
    var request;
    var init = {
      id: 1,
      band_id: 1,
      person_id: 1,
      description: 'Drop the little bird',
      request_type: constants.request_type.join_band,
      status: constants.request_status.pending,
      timestamp: '2014-04-01 15:32:05'
    };
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    before(function(done) {
      manager.bands.clear();
      manager.persons.clear();
      var band = new Band(1, 'Thunder Monkeys');
      manager.bands.insert(band);
      var person = new Person(1, 'thunder', 'Thunder the Monkey', 'th@monkey.com', false);
      manager.persons.insert(person);
      done();
    });

    it('should create a request object', function(done) {
      var request = new Request(
        init.id,
        init.request_type,
        init.timestamp,
        init.person_id,
        init.band_id,
        init.description,
        init.status
      );
      should.exist(request);
      manager.requests.insert(request);
      done();
    });

    it('should get the request', function(done) {
      request = manager.requests.getById(init.id);
      check_object_values(request, {
        id: init.id,
        request_type: init.request_type,
        timestamp: init.timestamp,
        person_id: init.person_id,
        band_id: init.band_id,
        description: init.description,
        status: init.status
      });
      done();
    });

    it('should call the request API', function(done) {
      svc.delete.result = {request: {id: init.id}};
      svc.get.result = request_model;
      request.delete(function (result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.have.property('request');
        result.request.should.have.property('id');
        result.request.id.should.eql(init.id);
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './request?id=' + init.id,
        'function'
      ]]);
      done();
    });

    it('should have removed the request from the list', function(done) {
      var request = manager.requests.getById(init.id);
      should.not.exist(request);
      done();
    });
  });
});

describe('Request Table List', function() {
  var request_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = request_model;
    svc.resetCalls();
    done();
  });

  it('should create a request list', function(done) {
    request_list = new RequestList();
    should.exist(request_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(request_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    request_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './request',
      'function'
    ]]);
    done();
  });

  it('should have all the requests', function(done) {
    request_list.list().should.have.length(request_model.all_requests.length);
    done();
  });

  it('should have an id and name in each record', function() {
    request_list.list().forEach(function(request, index) {
      request.should.have.property('id');
      ko.isObservable(request.id).should.be.true;
      request.id().should.eql(request_model.all_requests[index].id);
      request.should.have.property('request_type');
      ko.isObservable(request.request_type).should.be.true;
      request.request_type().should.eql(request_model.all_requests[index].request_type);
      request.should.have.property('timestamp');
      ko.isObservable(request.timestamp).should.be.true;
      request.timestamp().should.eql(request_model.all_requests[index].timestamp);
      request.should.have.property('person_id');
      ko.isObservable(request.person_id).should.be.true;
      request.person_id().should.eql(request_model.all_requests[index].person_id);
      request.should.have.property('band_id');
      ko.isObservable(request.band_id).should.be.true;
      request.band_id().should.eql(request_model.all_requests[index].band_id);
      request.should.have.property('description');
      ko.isObservable(request.description).should.be.true;
      request.description().should.eql(request_model.all_requests[index].description);
      request.should.have.property('status');
      ko.isObservable(request.status).should.be.true;
      request.status().should.eql(request_model.all_requests[index].status);
    });
  });
});

describe('Request Table Special', function() {
  describe('Join a Band', function() {
    var band;
    var person;
    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    before(function(done) {
      manager.requests.clear();
      done();
    });

    before(function(done) {
      manager.bands.clear();
      manager.persons.clear();
      band = new Band(67, 'Thunder Monkeys');
      manager.bands.insert(band);
      person = new Person(82, 'thunder', 'Thunder the Monkey', 'th@monkey.com', false);
      manager.persons.insert(person);
      manager.current_person(person);
      done();
    });

    it('should call the request API', function(done) {
      svc.post.result = { request: {
        id: 4231,
        band_id: band.id(),
        person_id: person.id(),
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      } };
      manager.requests.joinBand(band.id(), function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.post.calls.should.be.eql(1);
      svc.post.params.should.eql([[
        './request/join_band',
        'function',
        {
          band_id: band.id(),
          person_id: manager.current_person().id(),
        }
      ]]);
      done();
    });

    it('should have added the request into the list', function(done) {
      var new_request = manager.requests.getById(4231);
      check_object_values(new_request, {
        id: 4231,
        band_id: band.id(),
        person_id: manager.current_person().id(),
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      });
      done();
    });
  });

  describe('Add a Member', function() {
    var band;
    var person;
    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    before(function(done) {
      manager.requests.clear();
      done();
    });

    before(function(done) {
      manager.bands.clear();
      manager.persons.clear();
      band = new Band(67, 'Thunder Monkeys');
      manager.bands.insert(band);
      manager.current_band(band);
      person = new Person(82, 'thunder', 'Thunder the Monkey', 'th@monkey.com', false);
      manager.persons.insert(person);
      done();
    });

    it('should call the request API', function(done) {
      svc.post.result = { request: {
        id: 4231,
        band_id: band.id(),
        person_id: person.id(),
        description: 'Drop the little monkey',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      } };
      manager.requests.addBandMember(person.id(), function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.post.calls.should.be.eql(1);
      svc.post.params.should.eql([[
        './request/add_band_member',
        'function',
        {
          band_id: manager.current_band().id(),
          person_id: person.id(),
        }
      ]]);
      done();
    });

    it('should have added the request into the list', function(done) {
      var new_request = manager.requests.getById(4231);
      check_object_values(new_request, {
        id: 4231,
        band_id: band.id(),
        person_id: manager.current_person().id(),
        description: 'Drop the little monkey',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      });
      done();
    });
  });
  describe('Change Status', function() {
    var band;
    var person;
    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    before(function(done) {
      manager.requests.clear();
      done();
    });

    before(function(done) {
      manager.bands.clear();
      manager.persons.clear();
      band = new Band(67, 'Thunder Monkeys');
      manager.bands.insert(band);
      manager.current_band(band);
      person = new Person(82, 'thunder', 'Thunder the Monkey', 'th@monkey.com', false);
      manager.persons.insert(person);
      done();
    });
    before(function(done) {
      manager.requests.clear();
      var request = new Request(
        4231,
        constants.request_type.join_band,
        '2014-04-01 15:32:05',
        82,
        67,
        'Drop the little monkey',
        constants.request_status.pending
      );
      manager.requests.insert(request);
      done();
    });

    var request;
    it('should get the request', function(done) {
      request = manager.requests.getById(4231);
      check_object_values(request, {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        timestamp: '2014-04-01 15:32:05'
      });
      done();
    });

    it('should call the request API', function(done) {
      svc.put.result = { request: {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.accepted,
        timestamp: '2014-04-01 15:32:05'
      } };
      request.change_status('accept', function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.put.calls.should.be.eql(1);
      svc.put.params.should.eql([[
        './request/accept',
        'function',
        {id: 4231}
      ]]);
      done();
    });

    it('should have modified the status of the request in the list', function(done) {
      var new_request = manager.requests.getById(4231);
      check_object_values(new_request, {
        id: 4231,
        band_id: 67,
        person_id: 82,
        description: 'Drop the little monkey',
        request_type: constants.request_type.join_band,
        status: constants.request_status.accepted,
        timestamp: '2014-04-01 15:32:05'
      });
      done();
    });
  });
});
