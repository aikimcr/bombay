describe('Form', function() {
  describe('#Base', function() {
    var form;
    it('should create the form', function(done) {
      form = new Form();
      should.exist(form);
      done();
    });

    it('should be set to be not visible', function(done) {
      form.isVisible().should.be.false;
      done();
    });

    it('should set the visible flag for the form', function(done) {
      form.show();
      form.isVisible().should.be.true;
      done();
    });

    it('should unset the visible flag for the form', function(done) {
      form.hide();
      form.isVisible().should.be.false;
      done();
    });
  });

  describe('#AddBand', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new AddBand();
      should.exist(form);
      done();
    });

    it('should post to the band API', function(done) {
      svc.set.result = {band_id: 23};
      form.name = 'Cover Story';
      form.postChange(function(result) {
        should.exist(result);
        result.should.have.property('band_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
      svc.set.params.should.eql([[
        './band',
        'function',
        {name: 'Cover Story'},
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name);
      done();
    });
  });

  describe('#AddPerson', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new AddPerson();
      should.exist(form);
      done();
    });

    it('should post to the person API', function(done) {
      svc.set.result = {person_id: 23};
      form.name = 'bbongos';
      form.full_name = 'Billy Bongos';
      form.email = 'bbongos@musichero.foo';
      form.system_admin = true;
      form.postChange(function(result) {
        should.exist(result);
        result.should.have.property('person_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
      svc.set.params.should.eql([[
        './person',
        'function',
        {
          name: 'bbongos',
          full_name: 'Billy Bongos',
          email: 'bbongos@musichero.foo',
          system_admin: true
        },
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name);
      should.not.exist(form.full_name);
      should.not.exist(form.email);
      form.system_admin.should.be.false;
      done();
    });
  });

  describe('#AddArtist', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new AddArtist();
      should.exist(form);
      done();
    });

    it('should post to the artist API', function(done) {
      svc.set.result = {artist_id: 23};
      form.name = 'Mott the Hoople';
      form.postChange(function(result) {
        should.exist(result);
        result.should.have.property('artist_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
      svc.set.params.should.eql([[
        './artist',
        'function',
        {name: 'Mott the Hoople'},
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name);
      done();
    });
  });
});
