describe('Form', function() {
  var old_person;
  var old_band;
  before(function(done) {
    old_person = manager.current_person();
    manager.current_person(new Person(1, 'admin', 'System Admin', 'admin@allnightmusic.com', true)); 
    done();
  });

  before(function(done) {
    old_band = manager.current_band();
    manager.current_band(new Band(1, 'All Night Music'));
    done();
  });

  after(function(done) {
    manager.current_person(old_person);
    done();
  });

  after(function(done) {
    manager.current_band(old_band);
    done();
  });

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

    it('should have an observable name', function(done) {
      ko.isObservable(form.name).should.be.true;
      done();
    });

    it('should post to the band API', function(done) {
      svc.set.result = {band_id: 23};
      form.name('Cover Story');
      form.postChange_(function(result) {
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
      should.not.exist(form.name());
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

    it('should have an observable name', function(done) {
      ko.isObservable(form.name).should.be.true;
      done();
    });

    it('should have an observable full_name', function(done) {
      ko.isObservable(form.full_name).should.be.true;
      done();
    });

    it('should have an observable email', function(done) {
      ko.isObservable(form.email).should.be.true;
      done();
    });

    it('should have an observable system_admin', function(done) {
      ko.isObservable(form.system_admin).should.be.true;
      done();
    });

    it('should post to the person API', function(done) {
      svc.set.result = {person_id: 23};
      form.name('bbongos');
      form.full_name('Billy Bongos');
      form.email('bbongos@musichero.foo');
      form.system_admin(true);
      form.postChange_(function(result) {
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
      should.not.exist(form.name());
      should.not.exist(form.full_name());
      should.not.exist(form.email());
      form.system_admin().should.be.false;
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

    it('should have an observable name', function(done) {
      ko.isObservable(form.name).should.be.true;
      done();
    });

    it('should post to the artist API', function(done) {
      svc.set.result = {artist_id: 23};
      form.name('Mott the Hoople');
      form.postChange_(function(result) {
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
      should.not.exist(form.name());
      done();
    });
  });

  describe('#AddSong', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new AddSong();
      should.exist(form);
      done();
    });

    it('should have an observable name', function(done) {
      ko.isObservable(form.name).should.be.true;
      done();
    });

    it('should have an observable artist', function(done) {
      ko.isObservable(form.artist).should.be.true;
      done();
    });

    it('should post to the song API', function(done) {
      svc.set.result = {song_id: 23};
      form.name('Ziggy Stardust');
      form.artist(new Artist(5, 'David Bowie'));
      form.postChange_(function(result) {
        should.exist(result);
        result.should.have.property('song_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
      svc.set.params.should.eql([[
        './song',
        'function',
        {name: 'Ziggy Stardust', artist_id: 5},
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name());
      should.not.exist(form.artist());
      done();
    });
  });

  describe('#JoinBand', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new JoinBand();
      should.exist(form);
      done();
    });

    it('should have an observable band', function(done) {
      ko.isObservable(form.band).should.be.true;
      done();
    });

    it('should post to the band_member API', function(done) {
      svc.set.result = {band_member_id: 23};
      form.band(new Band(1, 'All Night Music'));
      form.postChange_(function(result) {
        should.exist(result);
        result.should.have.property('band_member_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
      svc.set.params.should.eql([[
        './band_member',
        'function',
        {band_id: 1},
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.band());
      done();
    });
  });

  describe('#AddBandMember', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new AddBandMember();
      should.exist(form);
      done();
    });

    it('should have an observable person', function(done) {
      ko.isObservable(form.person).should.be.true;
      done();
    });

    it('should post to the song API', function(done) {
      svc.set.result = {band_member_id: 23};
      form.person(new Person(2, 'bbongos', 'Billy Bongos', false));
      form.postChange_(function(result) {
        should.exist(result);
        result.should.have.property('band_member_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
      svc.set.params.should.eql([[
        './band_member',
        'function',
        {band_id: 1, person_id: 2},
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.person());
      done();
    });
  });

  describe('#AddBandSong', function() {
    var svc;
    var form;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create the form', function(done) {
      form = new AddBandSong();
      should.exist(form);
      done();
    });

    it('should have an observable song', function(done) {
      ko.isObservable(form.song).should.be.true;
      done();
    });

    it('should post to the song API', function(done) {
      svc.set.result = {band_song_id: 23};
      form.song(new Song(2, 1, 2));
      form.postChange_(function(result) {
        should.exist(result);
        result.should.have.property('band_song_id', 23);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have done the call', function(done) {
      svc.set.calls.should.eql(1);
console.log(svc.set.params);
      svc.set.params.should.eql([[
        './band_song',
        'function',
        {band_id: 1, song_id: 2, song_status: -1, key_signature: ''},
      ]]);
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.song());
      done();
    });
  });
});
