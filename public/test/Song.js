var song_model = {
  all_songs: [{
    id: 45, name: 'Plover', artist_id: 3
  }, {
    id: 16, name: 'Plugh', artist_id: 6
  }, {
    id: 63, name: 'Xyzzy', artist_id: 10
  }]
};

describe('Song Master Table', function() {
  describe('#Instantiate', function() {
    var song;
    var expected_id = 1;
    var expected_name = 'Song Number 01';
    var expected_artist_id = 12;

    it('should create a song object', function(done) {
      song = new Song(expected_id, expected_name, expected_artist_id);
      should.exist(song);
      done();
    });

    it('should have an id', function(done) {
      song.should.have.property('id');
      done();
    });

    it('should have observable id', function(done) {
      ko.isObservable(song.id).should.be.true;
      done();
    });

    it('should have id set to expected', function(done) {
      song.id().should.eql(expected_id);
      done();
    });

    it('should have a name', function(done) {
      song.should.have.property('name');
      done();
    });

    it('should have observable name', function(done) {
      ko.isObservable(song.name).should.be.true;
      done();
    });

    it('should have name set to expected', function(done) {
      song.name().should.eql(expected_name);
      done();
    });

    it('should have a artist_id', function(done) {
      song.should.have.property('artist_id');
      done();
    });

    it('should have observable artist_id', function(done) {
      ko.isObservable(song.artist_id).should.be.true;
      done();
    });

    it('should have artist_id set to expected', function(done) {
      song.artist_id().should.eql(expected_artist_id);
      done();
    });

    after(function(done) {
      delete song;
      song = null;
      done();
    });
  });

  describe('Refresh', function() {
    var song;
    var expected_id = 45;
    var expected_name = 'Not a bird';
    var expected_artist_id = 7;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a song object', function(done) {
      song = new Song(expected_id, expected_name, expected_artist_id);
      should.exist(song);
      done();
    });

    it('should call the song API', function(done) {
      svc.get.result = { song: song_model.all_songs[0] };
      song.refresh(function(result) {
        should.exist(result);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.get.calls.should.be.eql(1);
      svc.get.params.should.eql([[
        './song?id=45',
        'function'
      ]]);
      done();
    });

    it('should have changed the name', function(done) {
      song.name().should.eql(song_model.all_songs[0].name);
      song.artist_id().should.eql(song_model.all_songs[0].artist_id);
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
      manager.songs.clear();
      done();
    });

    it('should call the song API', function(done) {
      svc.post.result = { song: {
        id: 4231,
        name: 'Thunder Monkeys',
        artist_id: 67
      } };
      manager.songs.create({
        name: 'Thunder Monkeys',
        artist_id: 67
      }, function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.not.have.property('err');
        done();
      });
    });

    it('should have called the service', function(done) {
      svc.post.calls.should.be.eql(1);
      svc.post.params.should.eql([[
        './song',
        'function',
        {name: 'Thunder Monkeys', artist_id: 67}
      ]]);
      done();
    });

    it('should have added the song into the list', function(done) {
      var new_song = manager.songs.getById(4231);
      check_object_values(new_song, {
        id: 4231,
        name: 'Thunder Monkeys',
        artist_id: 67
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
      manager.songs.clear();
      var song = new Song(4231, 'Thunder Monkeys', 67);
      manager.songs.insert(song);
      done();
    });

    var song;
    it('should get the song', function(done) {
      song = manager.songs.getById(4231);
      check_object_values(song, {
        id: 4231,
        name: 'Thunder Monkeys',
        artist_id: 67
      });
      done();
    });

    it('should call the song API', function(done) {
      svc.put.result = { song: {
        id: 4231,
        name: 'Lightning Monkeys',
        artist_id: 67
      } };
      song.update({name: 'Lightning Monkeys'}, function(result_code, result) {
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
        './song',
        'function',
        {name: 'Lightning Monkeys'}
      ]]);
      done();
    });

    it('should have modified the name of the song in the list', function(done) {
      var new_song = manager.songs.getById(4231);
      check_object_values(new_song, {
        id: 4231,
        name: 'Lightning Monkeys',
        artist_id: 67
      });
      done();
    });
  });

  describe('Delete', function() {
    var song;
    var expected_id = 1;
    var expected_name = 'Song Number 01';
    var expected_artist_id = 1;
    var svc;

    before(function(done) {
      svc = service.getInstance();
      svc.resetCalls();
      done();
    });

    it('should create a song object', function(done) {
      var song = new Song(expected_id, expected_name, expected_artist_id);
      should.exist(song);
      manager.songs.insert(song);
      done();
    });

    it('should get the song', function(done) {
      song = manager.songs.getById(expected_id);
      check_object_values(song, {
        id: expected_id,
        name: expected_name,
        artist_id: expected_artist_id
      });
      done();
    });

    it('should call the song API', function(done) {
      svc.delete.result = {song: { id: 1}};
      svc.get.result = song_model;
      song.delete(function (result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.have.property('song');
        result.song.should.have.property('id');
        result.song.id.should.eql(expected_id);
        done();
      });
    });

    it('should have called the delete service', function(done) {
      svc.delete.calls.should.be.eql(1);
      svc.delete.params.should.eql([[
        './song?id=1',
        'function'
      ]]);
      done();
    });

    it('should have removed the song from the list', function(done) {
      var song = manager.songs.getById(expected_id);
      should.not.exist(song);
      done();
    });
  });
});

describe('Song Master List', function() {
  var song_list;
  var svc;

  before(function(done) {
    svc = service.getInstance();
    svc.get.result = song_model;
    svc.resetCalls();
    done();
  });

  it('should create a song list', function(done) {
    song_list = new SongList();
    should.exist(song_list);
    done();
  });

  it('should have an observable array as list', function(done) {
    ko.isObservable(song_list.list).should.be.true;
    done();
  });

  it('should load from the service', function(done) {
    song_list.load();
    svc.get.calls.should.eql(1);
    svc.get.params.should.eql([[
      './song',
      'function'
    ]]);
    done();
  });

  it('should have all the songs', function(done) {
    song_list.list().should.have.length(song_model.all_songs.length);
    done();
  });

  it('should have an id, name and artist_id in each record', function() {
    song_list.list().forEach(function(song, index) {
      song.should.have.property('id');
      ko.isObservable(song.id).should.be.true;
      song.id().should.eql(song_model.all_songs[index].id);
      song.should.have.property('name');
      ko.isObservable(song.name).should.be.true;
      song.name().should.eql(song_model.all_songs[index].name);
      song.should.have.property('artist_id');
      ko.isObservable(song.artist_id).should.be.true;
      song.artist_id().should.eql(song_model.all_songs[index].artist_id);
    });
  });
});

describe('Song Master Table Filters', function() {
  var song_list = function() {
    return manager.songs.filtered_list().map(function(song) {
      return {
        id: song.id(),
        name: song.name(),
        artist_id: song.artist_id(),
        artist_name: song.artist().name()
      };
    });
  };

  before(function(done) {
    load_test_models();
    done();
  });

  it('should have a list of sort types', function(done) {
    manager.songs.sort_types().should.eql([{
      value: 'artist_name_asc', label: 'Artist Name (A-Z)'
    }, {
      value: 'artist_name_desc', label: 'Artist Name (Z-A)'
    }, {
      value: 'name_asc', label: 'Name (A-Z)'
    }, {
      value: 'name_desc', label: 'Name (Z-A)'
    }]);
    done();
  });

  it('should have songs', function(done) {
    song_list().length.should.eql(8);
    done();
  });

  it('should have the songs sorted by name, ascending', function(done) {
    manager.songs.sort_type('name_asc');
    song_list().should.eql([{
      id: 6, name: 'California Girls', artist_id: 6, artist_name: 'Katy Perry'
    }, {
      id: 5, name: 'Changes', artist_id: 5, artist_name: 'Black Sabbath'
    }, {
      id: 1, name: 'Changes', artist_id: 1, artist_name: 'David Bowie'
    }, {
      id: 2, name: 'Help', artist_id: 2, artist_name: 'The Beatles'
    }, {
      id: 8, name: 'Lazy', artist_id: 8, artist_name: 'Deep Purple'
    }, {
      id: 7, name: 'Material Girl', artist_id: 7, artist_name: 'Madonna'
    }, {
      id: 4, name: 'You Shook Me', artist_id: 4, artist_name: 'Led Zeppelin'
    }, {
      id: 3, name: 'You Shook Me All Night Long', artist_id: 3, artist_name: 'AC/DC'
    }]);
    done();
  });

  it('should have the songs sorted by name, descending', function(done) {
    manager.songs.sort_type('name_desc');
    song_list().should.eql([{
      id: 3, name: 'You Shook Me All Night Long', artist_id: 3, artist_name: 'AC/DC'
    }, {
      id: 4, name: 'You Shook Me', artist_id: 4, artist_name: 'Led Zeppelin'
    }, {
      id: 7, name: 'Material Girl', artist_id: 7, artist_name: 'Madonna'
    }, {
      id: 8, name: 'Lazy', artist_id: 8, artist_name: 'Deep Purple'
    }, {
      id: 2, name: 'Help', artist_id: 2, artist_name: 'The Beatles'
    }, {
      id: 1, name: 'Changes', artist_id: 1, artist_name: 'David Bowie'
    }, {
      id: 5, name: 'Changes', artist_id: 5, artist_name: 'Black Sabbath'
    }, {
      id: 6, name: 'California Girls', artist_id: 6, artist_name: 'Katy Perry'
    }]);
    done();
  });

  it('should have the songs sorted by artist_name, ascending', function(done) {
    manager.songs.sort_type('artist_name_asc');
    song_list().should.eql([{
      id: 3, name: 'You Shook Me All Night Long', artist_id: 3, artist_name: 'AC/DC'
    }, {
      id: 5, name: 'Changes', artist_id: 5, artist_name: 'Black Sabbath'
    }, {
      id: 1, name: 'Changes', artist_id: 1, artist_name: 'David Bowie'
    }, {
      id: 8, name: 'Lazy', artist_id: 8, artist_name: 'Deep Purple'
    }, {
      id: 6, name: 'California Girls', artist_id: 6, artist_name: 'Katy Perry'
    }, {
      id: 4, name: 'You Shook Me', artist_id: 4, artist_name: 'Led Zeppelin'
    }, {
      id: 7, name: 'Material Girl', artist_id: 7, artist_name: 'Madonna'
    }, {
      id: 2, name: 'Help', artist_id: 2, artist_name: 'The Beatles'
    }]);
    done();
  });

  it('should have the songs sorted by artist_name, descending', function(done) {
    manager.songs.sort_type('artist_name_desc');
    song_list().should.eql([{
      id: 2, name: 'Help', artist_id: 2, artist_name: 'The Beatles'
    }, {
      id: 7, name: 'Material Girl', artist_id: 7, artist_name: 'Madonna'
    }, {
      id: 4, name: 'You Shook Me', artist_id: 4, artist_name: 'Led Zeppelin'
    }, {
      id: 6, name: 'California Girls', artist_id: 6, artist_name: 'Katy Perry'
    }, {
      id: 8, name: 'Lazy', artist_id: 8, artist_name: 'Deep Purple'
    }, {
      id: 1, name: 'Changes', artist_id: 1, artist_name: 'David Bowie'
    }, {
      id: 5, name: 'Changes', artist_id: 5, artist_name: 'Black Sabbath'
    }, {
      id: 3, name: 'You Shook Me All Night Long', artist_id: 3, artist_name: 'AC/DC'
    }]);
    done();
  });

  it('should return only Material Girl', function(done) {
    manager.songs.filter_values.name('material');
    song_list().should.eql([{
      id: 7, name: 'Material Girl', artist_id: 7, artist_name: 'Madonna'
    }]);
    done();
  });

  it('should return only songs with "Changes" in the name', function(done) {
    manager.songs.sort_type('name_desc');
    manager.songs.filter_values.name('chaNges');
    song_list().should.eql([{
      id: 1, name: 'Changes', artist_id: 1, artist_name: 'David Bowie'
    }, {
      id: 5, name: 'Changes', artist_id: 5, artist_name: 'Black Sabbath'
    }]);
    manager.songs.filter_values.name('');
    done();
  });

  it('should return only Lazy', function(done) {
    manager.songs.filter_values.artist_id(8);
    song_list().should.eql([{
      id: 8, name: 'Lazy', artist_id: 8, artist_name: 'Deep Purple'
    }]);
    manager.songs.filter_values.artist_id(null);
    done();
  });
});
