var request_model = {
  all_requests: [{
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
        expected.band_id,
        expected.person_id,
        expected.description,
        expected.request_type,
        expected.status,
        expected.timestamp
      );
      check_object_values(request, expected);
      done();
    });
  });
});
