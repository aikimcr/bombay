describe('Instantiate Manager', function() {
//XXX Need to mock out the service.
  var instance_stub;

  before(function() {
    var model_list = {
      band: [{
        id: 1, name: 'Standing Rocks'
      }, {
        id: 2, name: 'The Stickbugs'
      }],
      person: [{
        id: 1,
        name: 'mj',
        full_name: 'Mick Jagged',
        email: 'mj@rocks.stand',
        system_admin: 1
      }, {
        id: 2,
        name: 'jl',
        full_name: 'John Lemon',
        email: 'jl@bugs.stick',
        system_admin: 0
      }, {
        id: 3,
        name: 'pm',
        full_name: 'Paul McHardly',
        email: 'pm@bugs.stick',
        system_admin: 0
      }, {
        id: 4,
        name: 'kr',
        full_name: 'Keef Rickets',
        email: 'kr@rocks.stand',
        system_admin: 1
      }, {
        id: 5,
        name: 'George Harriedson',
        email: 'gr@bugs.stick',
        system_admin: 0
      }],
      artist: [{
        id: 1,
        name: 'The Beatles'
      }, {
        id: 2,
        name: 'The Rolling Stones'
      }],
      song: [{
        id: 1,
        name: 'In My Life',
        artist_id: 1,
        key_signature: 'A'
      }, {
        id: 2,
        name: 'Satisfaction',
        artist_id: 2, key_signature: 'E'
      }, {
        id: 3,
        name: 'DayTripper',
        artist_id: 1,
        key_signature: 'Dm'
      }],
      band_member: [{
        id: 1,
        band_id: 1,
        person_id: 1,
        band_admin: 0
      }, {
        id: 2,
        band_id: 2,
        person_id: 2,
        band_admin: 1
      }, {
        id: 3,
        band_id: 1,
        person_id: 4,
        band_admin: 1
      }, {
        id: 4,
        band_id: 2,
        person_id: 3,
        band_admin: 0
      }],
      band_song: [{
        id: 1,
        band_id: 1,
        song_id: 2,
        key_signature: 'E',
        primary_vocal_id: 1,
        secondary_vocal_id: null
      }, {
        id: 2,
        band_id: 2,
        song_id: 1,
        key_signature: 'D',
        primary_vocal_id: 2,
        secondary_vocal_id: 4
      }, {
        id: 3,
        band_id: 2,
        song_id: 3,
        key_signature: 'Am',
        primary_vocal_id: 4,
        secondary_vocal_id: null
      }],
      song_rating: [{
        id: 1,
        band_song_id: 1,
        band_member_id: 2,
        rating: 2,
        is_new: 0
      }, {
        id: 2,
        band_song_id: 1,
        band_member_id: 4,
        rating: 4,
        is_new: 0
      }, {
        id: 3,
        band_song_id: 2,
        band_member_id: 1,
        rating: 3,
        is_new: 1
      }, {
        id: 4,
        band_song_id: 2,
        band_member_id: 3,
        rating: 3,
        is_new: 1
      }, {
        id: 5,
        band_song_id: 3,
        band_member_id: 2,
        rating: 1,
        is_new: 0
      }, {
        id: 6,
        band_song_id: 3,
        band_member_id: 4,
        rating: 2,
        is_new: 0
      }],
      request: [{
        id: 1,
        description: 'George Harriedson wants to join The Stickbugs',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: 2,
        person_id: 5
      }]
    };

    var stub_service = {
      post: function(url, callback, data) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_body = {};
        var req_model = {};
        Object.keys(data).forEach(function(column_name) {
          req_body[column_name] = data[column_name];
        });
        req_body.id = 4;
        req_model[table_name] = req_body;
        model_list[table_name][3] = req_body;
        callback(200, req_model);
      },
      delete: function(url, callback) {
        var id = url.match(/id=(\d+)/)[1];
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        model_list[table_name][id - 1] = null;
        callback(200, {id: id});
      },
      get: function(url, callback) {
        if (url.match('session_info')) {
          callback(200, {person: model_list['person'][0]});
        } else {
          var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
          var req_model = {};
          if (url == './' + table_name) {
            req_model['all_' + table_name + 's'] = model_list[table_name];
          } else {
            var id = url.match(/id=(\d+)/)[1];
            req_model[table_name] = model_list[table_name][id - 1];
          }

          callback(200, req_model);
        }
      }
    };

    instance_stub = sinon.stub(service, 'getInstance', function() { return stub_service; });
  });

  it('should make a manager', function() {
    var new_manager = new Manager();

    should.exist(new_manager);
    should.exist(manager); // Global property.
    manager.should.eql(new_manager);

    var table_types = ['band', 'person', 'artist', 'song', 'band_member', 'band_song', 'song_rating', 'request'];

    table_types.forEach(function(table_type) {
      manager.should.have.property(table_type);
      manager[table_type].should.be.instanceof(orm.table);
    });
 
    should.exist(manager.current_person);
    ko.isObservable(manager.current_person).should.be.true;
    should.not.exist(manager.current_person());

    should.exist(manager.current_band);
    ko.isObservable(manager.current_band).should.be.true;
    should.not.exist(manager.current_band());
  });

  it('should load the tables', function(done) {
    manager.loadTables(function(err, result) {
      try {
        should.not.exist(err);

        should.exist(manager.current_person());
        should.exist(manager.current_band());

        manager.band.list.list().length.should.be.greaterThan(0);
        manager.person.list.list().length.should.be.greaterThan(0);
        manager.artist.list.list().length.should.be.greaterThan(0);
        manager.song.list.list().length.should.be.greaterThan(0);
        manager.band_member.list.list().length.should.be.greaterThan(0);
        manager.band_song.list.list().length.should.be.greaterThan(0);
        manager.song_rating.list.list().length.should.be.greaterThan(0);
        manager.request.list.list().length.should.be.greaterThan(0);

        done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should get the average rating for each band song', function() {
    manager.band_songs.list()[0].band_name().should.equal('Standing Rocks');
    manager.band_songs.list()[0].average_rating().should.equal(3);
    manager.band_songs.list()[1].band_name().should.equal('The Stickbugs');
    manager.band_songs.list()[1].average_rating().should.equal(3);
    manager.band_songs.list()[2].band_name().should.equal('The Stickbugs');
    manager.band_songs.list()[2].average_rating().should.equal(1.5);
  });
});
