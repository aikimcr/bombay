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
    var form;
    var create_stub;

    before(function(done) {
      create_stub = sinon.stub(manager.bands, 'create', function(options, callback) {
        callback(null, {id: 23, name: 'Cover Story'});
      });
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
      form.name('Cover Story');
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {
          id: 23,
          name: 'Cover Story'
        });
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({name: 'Cover Story'});
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name());
      done();
    });
  });

  describe('#AddPerson', function() {
    var create_stub;
    var form;

    before(function(done) {
      create_stub = sinon.stub(manager.persons, 'create', function(options, callback) {
        callback(null, {
          id: 23,
          name: 'bbongos',
          full_name: 'Billy Bongos',
          email: 'bbongos@musichero.foo',
          system_admin: true
        });
      });
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
      form.name('bbongos');
      form.full_name('Billy Bongos');
      form.email('bbongos@musichero.foo');
      form.system_admin(true);
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {
          id: 23,
          name: 'bbongos',
          full_name: 'Billy Bongos',
          email: 'bbongos@musichero.foo',
          system_admin: true
        });
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({
        name: 'bbongos',
        full_name: 'Billy Bongos',
        email: 'bbongos@musichero.foo',
        system_admin: true
      });
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
    var create_stub;
    var form;

    before(function(done) {
      create_stub = sinon.stub(manager.artists, 'create', function(options, callback) {
        callback(null, {id: 23, name: 'Mott the Hoople'});
      });
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
      form.name('Mott the Hoople');
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {
          id: 23,
          name: 'Mott the Hoople'
        });
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({name: 'Mott the Hoople'});
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name());
      done();
    });
  });

  describe('#AddSong', function() {
    var create_stub;
    var form;
    var artist;

    before(function(done) {
      manager.songs.clear();
      manager.artists.clear();
      artist = new Artist(5, 'David Bowie');
      manager.artists.insert(artist);
      done();
    });

    before(function(done) {
      create_stub = sinon.stub(manager.songs, 'create', function(options, callback) {
        callback(null, {id: 23, name: 'Ziggy Stardust', artist_id: 5});
      });
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
      form.name('Ziggy Stardust');
      form.artist(artist);
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {id: 23, name: 'Ziggy Stardust', artist_id: 5});
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({name: 'Ziggy Stardust', artist_id: 5});
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.name());
      should.not.exist(form.artist());
      done();
    });
  });

  describe('#JoinBand', function() {
    var create_stub;
    var form;
    var band;
    var person;

    before(function(done) {
      manager.bands.clear();
      manager.persons.clear();
      manager.requests.clear();
      band = new Band(23, 'Cover Story');
      manager.bands.insert(band);
      person = new Person(23, 'bbongos', 'Billy Bongos', 'bbongos@musichero.foo', true);
      manager.persons.insert(person);
      manager.current_person(person);
      done();
    });

    before(function(done) {
      create_stub = sinon.stub(manager.requests, 'create', function(options, callback) {
        callback(null, {
          id: 23,
          band_id: band.id(),
          person_id: person.id(),
          description: 'Bongos Rule',
          request_type: constants.request_type.join_band,
          status: constants.request_status.accepted,
          timestamp: '2014-04-01 15:32:05'
        });
      });
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
      form.band(band);
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {
          id: 23,
          band_id: band.id(),
          person_id: person.id(),
          description: 'Bongos Rule',
          request_type: constants.request_type.join_band,
          status: constants.request_status.accepted,
          timestamp: '2014-04-01 15:32:05'
        });
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({
        band_id: band.id(),
        person_id: person.id(),
      });
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.band());
      done();
    });
  });

  describe('#AddBandMember', function() {
    var create_stub;
    var form;
    var band;
    var person;

    before(function(done) {
      manager.bands.clear();
      manager.persons.clear();
      manager.requests.clear();
      band = new Band(23, 'Cover Story');
      manager.bands.insert(band);
      manager.current_band(band);
      person = new Person(23, 'bbongos', 'Billy Bongos', 'bbongos@musichero.foo', true);
      manager.persons.insert(person);
      done();
    });

    before(function(done) {
      manager.requests.create.restore();
      create_stub = sinon.stub(manager.requests, 'create', function(options, callback) {
        callback(null, {
          id: 23,
          band_id: band.id(),
          person_id: person.id(),
          description: 'Bongos Rule',
          request_type: constants.request_type.join_band,
          status: constants.request_status.accepted,
          timestamp: '2014-04-01 15:32:05'
        });
      });
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
      form.person(person);
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {
          id: 23,
          band_id: band.id(),
          person_id: person.id(),
          description: 'Bongos Rule',
          request_type: constants.request_type.join_band,
          status: constants.request_status.accepted,
          timestamp: '2014-04-01 15:32:05'
        });
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({
        band_id: band.id(),
        person_id: person.id(),
      });
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.person());
      done();
    });
  });

  describe('#AddBandSong', function() {
    var create_stub;
    var form;
    var band;
    var artist;
    var song;

    before(function(done) {
      manager.bands.clear();
      manager.artists.clear();
      manager.songs.clear();
      manager.band_songs.clear();
      band = new Band(23, 'Cover Story');
      manager.bands.insert(band);
      manager.current_band(band);
      artist = new Artist(5, 'David Bowie');
      manager.artists.insert(artist);
      song = new Song(23, 'Ziggy Stardust', artist.id());
      manager.songs.insert(song);
      done();
    });

    before(function(done) {
      create_stub = sinon.stub(manager.band_songs, 'create', function(options, callback) {
        callback(null, {
          id: 23,
          band_id: band.id(),
          song_id: song.id(),
          song_status: -1,
          key_signature: 'C'
        });
      });
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

    it('should have an observable key signature', function(done) {
      ko.isObservable(form.key_signature).should.be.true;
      done();
    });

    it('should post to the song API', function(done) {
      form.song(song);
      form.key_signature('C');
      form.postChange_(function(err, result) {
        should.not.exist(err);
        should.exist(result);
        check_result_values(result, {
          id: 23,
          band_id: band.id(),
          song_id: song.id(),
          song_status: -1,
          key_signature: 'C'
        });
        done();
      });
    });

    it('should have done the call exactly once', function(done) {
      create_stub.should.have.been.calledOnce;
      done();
    });

    it('should have called the create with correct params', function(done) {
      create_stub.should.have.been.calledWith({
        band_id: band.id(),
        song_id: song.id(),
        song_status: -1,
        key_signature: 'C'
      });
      done();
    });

    it('should have reset the form values', function(done) {
      should.not.exist(form.song());
      should.not.exist(form.key_signature());
      done();
    });
  });
});
