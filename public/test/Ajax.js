describe.only('Ajax module testing', function() {
  describe('Instance management', function() {
    var new_instance;

    it('should not be instantiated yet', function() {
      should.not.exist(Ajax.instance_);
    });

    it('should get the instance', function() {
      new_instance = Ajax.getInstance();
      should.exist(new_instance);
      new_instance.should.eql(Ajax.instance_);
    });

    it('should get the same instance', function() {
      var second_instance = Ajax.getInstance();
      should.exist(second_instance);
      second_instance.should.eql(new_instance);
    });
  });

  describe('request list', function() {
    it('should get a request', function() {
      var ajax = Ajax.getInstance();
      ajax.requests_.should.eql({});
      var request = ajax.getRequest('/ajax_testing/json/cichlids');
      should.exist(request);
      request.should.have.property('key');
      ajax.requests_[request.key].should.eql(request);
    });

    it('should cancel all requests and remove them', function() {
      (function() {
        Ajax.getInstance().cancelAllRequests();
      }).should.not.throw();

      Ajax.getInstance().requests_.should.eql({});
    });
  });

  describe('get request', function() {
    it('should get json data using a promise', function(done) {
      var request = Ajax.getInstance().getRequest('/ajax_testing/json/cichlids');
      request.get()
        .then(function(result) {
          should.exist(result);
          result.should.have.property('params');
          result.params.should.eql(['cichlids']);
          done();
        }, function(err) {
          console.log(err);
          should.not.exist(err);
          done(err);
        });
    });

    it('should get json data using a callback', function(done) {
      var request = Ajax.getInstance().getRequest('/ajax_testing/json/cichlids');
      request.get(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.property('params');
        result.params.should.eql(['cichlids']);
        done();
      });
    });

    it('should get html data using a promise', function(done) {
      var request = Ajax.getInstance().getRequest('/ajax_testing/html/cichlids');
      request.get()
        .then(function(result) {
          should.exist(result);
          done();
        }, function(err) {
          console.log(err);
          should.not.exist(err);
          done(err);
        });
    });
  });
});
