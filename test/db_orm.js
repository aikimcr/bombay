var should = require('should');

var fs = require('fs');
var sqlite3 = require('sqlite3');

var test_util = require('test/lib/util');

var bombay_db = require('lib/db_orm');

describe('db_orm', function() {
  describe('config', function() {
    it('should get a connect string', function() {
      var connect_string = bombay_db.getConnect();
      connect_string.should.eql('sqlite://bombay_test.db');
    });
  });

  describe('access', function() {
    describe('Band', function() {
      before(function(done) { test_util.db.resetDb(done); });

      var last_band_id = null;
      it('should create a band row', function(done) {
        bombay_db.Band.create([{name: 'Plover'}], function(err, bands) {
          should.not.exist(err);
          should.exist(bands);
          bands.length.should.eql(1);
          bands[0].name.should.eql('Plover');
          should.exist(bands[0].id);
          last_band_id = bands[0].id;
          done();
        });
      });

      it('should get the band', function(done) {
        bombay_db.Band.get(last_band_id, function(err, band) {
          should.not.exist(err);
          should.exist(band);
          band.id.should.eql(last_band_id);
          band.name.should.eql('Plover');
          done();
        });
      });
    });

    describe('Person', function() {
      before(function(done) { test_util.db.resetDb(done); });

      var last_person_id = null;
      it('should create a person row', function(done) {
        bombay_db.Person.create([{
          name: 'hjones',
          full_name: 'Herkimer Jones',
          password: 'shorebird',
          email: 'hjones@musichero.non',
          system_admin: true,
          session_expires: 30
        }], function(err, persons) {
          should.not.exist(err);
          should.exist(persons);
          persons.length.should.eql(1);
          persons[0].name.should.eql('hjones');
          persons[0].full_name.should.eql('Herkimer Jones');
          persons[0].password.should.eql('shorebird');
          persons[0].email.should.eql('hjones@musichero.non');
          persons[0].system_admin.should.eql(true);
          persons[0].session_expires.should.eql(30);
          should.exist(persons[0].id);
          last_person_id = persons[0].id;
          done();
        });
      });

      it('should get the person', function(done) {
        bombay_db.Person.get(last_person_id, function(err, person) {
          should.not.exist(err);
          should.exist(person);
          person.id.should.eql(last_person_id);
          person.name.should.eql('hjones');
          person.full_name.should.eql('Herkimer Jones');
          person.password.should.eql('shorebird');
          person.email.should.eql('hjones@musichero.non');
          person.system_admin.should.eql(true);
          person.session_expires.should.eql(30);
          done();
        });
      });
    });

    describe('Artist', function() {
      before(function(done) { test_util.db.resetDb(done); });

      var last_artist_id = null;
      it('should create a artist row', function(done) {
        bombay_db.Artist.create([{name: 'Plover'}], function(err, artists) {
          should.not.exist(err);
          should.exist(artists);
          artists.length.should.eql(1);
          artists[0].name.should.eql('Plover');
          should.exist(artists[0].id);
          last_artist_id = artists[0].id;
          done();
        });
      });

      it('should get the artist', function(done) {
        bombay_db.Artist.get(last_artist_id, function(err, artist) {
          should.not.exist(err);
          should.exist(artist);
          artist.id.should.eql(last_artist_id);
          artist.name.should.eql('Plover');
          done();
        });
      });
    });

    describe('Song', function() {
      before(function(done) { test_util.db.resetDb(done); });

      var last_artist = null;
      before(function(done) {
        bombay_db.Artist.create([{name: 'Plover'}], function(err, artists) {
          last_artist = artists[0];
          done();
        });
      });

      var last_song_id = null;
      it('should create a song row', function(done) {
        bombay_db.Song.create([{
          name: 'Song For A Shorebird',
          artist_id: last_artist.id
        }], function(err, songs) {
          should.not.exist(err);
          should.exist(songs);
          songs.length.should.eql(1);
          songs[0].name.should.eql('Song For A Shorebird');
          songs[0].artist_id.should.eql(last_artist.id);
          should.exist(songs[0].id);
          last_song_id = songs[0].id;
          done();
        });
      });

      var last_song = null;
      it('should get the song', function(done) {
        bombay_db.Song.get(last_song_id, function(err, song) {
          should.not.exist(err);
          should.exist(song);
          song.id.should.eql(last_song_id);
          song.name.should.eql('Song For A Shorebird');
          song.artist_id.should.eql(last_artist.id);
          last_song = song;
          done();
        });
      });

      it('should get the artist', function(done) {
        last_song.getArtist(function(err, artist) {
          should.not.exist(err);
          should.exist(artist);
          artist.id.should.eql(last_artist.id);
          artist.name.should.eql(last_artist.name);
          done();
        });
      });

      it('should create another song', function(done) {
        bombay_db.Song.create([{
          name: 'Seagulls Get Me Down',
          artist_id: last_artist.id
        }], function(err, songs) {
          should.not.exist(err);
          should.exist(songs);
          songs.length.should.eql(1);
          done();
        });
      });

      it('should get the songs for the artist', function(done) {
        last_artist.getSongs(function(err, songs) {
          should.not.exist(err);
          should.exist(songs);
          songs.length.should.eql(2);
          done();
        });
      });
    });

    describe('BandMember', function() {
      before(function(done) { test_util.db.resetDb(done); });

      var last_band = null;
      before(function(done) {
        bombay_db.Band.create([{name: 'Plover'}], function(err, bands) {
          last_band = bands[0];
          done();
        });
      });

      var last_person = null;
      before(function(done) {
        bombay_db.Person.create([{
          name: 'hjones',
          full_name: 'Herkimer Jones',
          password: 'shorebird',
          email: 'hjones@musichero.non',
          system_admin: true,
          session_expires: 30
        }], function(err, persons) {
          last_person = persons[0];
          done();
        });
      });

      var last_band_member_id = null;
      it('should create a band_member row', function(done) {
        bombay_db.BandMember.create([{
          band_id: last_band.id,
          person_id: last_person.id,
          band_admin: false
        }], function(err, band_members) {
          should.not.exist(err);
          should.exist(band_members);
          band_members.length.should.eql(1);
          band_members[0].band_id.should.eql(last_band.id);
          band_members[0].person_id.should.eql(last_person.id);
          band_members[0].band_admin.should.eql(false);
          should.exist(band_members[0].id);
          last_band_member_id = band_members[0].id;
          done();
        });
      });
      
      var last_band_member = null;
      it('should get the band_member', function(done) {
        bombay_db.BandMember.get(last_band_member_id, function(err, band_member) {
          should.not.exist(err);
          should.exist(band_member);
          band_member.id.should.eql(last_band_member_id);
          band_member.band_id.should.eql(last_band.id);
          band_member.person_id.should.eql(last_person.id);
          band_member.band_admin.should.eql(false);
          last_band_member = band_member;
          done();
        });
      });

      it('should get the band', function(done) {
        last_band_member.getBand(function(err, band) {
          should.not.exist(err);
          should.exist(band);
          band.should.eql(last_band);
          done();
        });
      });

      it('should get the person', function(done) {
        last_band_member.getPerson(function(err, person) {
          should.not.exist(err);
          should.exist(person);
          person.should.eql(last_person);
          done();
        });
      });

      it('should get the member list', function(done) {
        last_band.getMembers(function(err, members) {
          should.not.exist(err);
          should.exist(members);
          members.length.should.eql(1);
          members[0].id.should.eql(last_band_member.id);
          done();
        })
      });

      it('should get the band list', function(done) {
        last_person.getBands(function(err, bands) {
          should.not.exist(err);
          should.exist(bands);
          bands.length.should.eql(1);
          bands[0].id.should.eql(last_band_member.id);
          done();
        })
      });
    });

    describe('BandSong', function() {
      before(function(done) { test_util.db.resetDb(done); });

      var last_band = null;
      before(function(done) {
        bombay_db.Band.create([{name: 'Plover'}], function(err, bands) {
          last_band = bands[0];
          done();
        });
      });

      var last_artist = null;
      before(function(done) {
        bombay_db.Artist.create([{name: 'Plover'}], function(err, artists) {
          last_artist = artists[0];
          done();
        });
      });

      var last_song = null;
      before(function(done) {
        bombay_db.Song.create([{
          name: 'Song For A Shorebird',
          artist_id: last_artist.id
        }], function(err, songs) {
          last_song = songs[0];
          done();
        });
      });

      var last_band_song_id = null;
      it('should create a band_song row', function(done) {
        bombay_db.BandSong.create([{
          band_id: last_band.id,
          song_id: last_song.id,
          song_status: 3,
          key_signature: 'Am'
        }], function(err, band_songs) {
          should.not.exist(err);
          should.exist(band_songs);
          band_songs.length.should.eql(1);
          band_songs[0].band_id.should.eql(last_band.id);
          band_songs[0].song_id.should.eql(last_song.id);
          band_songs[0].song_status.should.eql(3);
          band_songs[0].key_signature.should.eql('Am');
          should.exist(band_songs[0].id);
          last_band_song_id = band_songs[0].id;
          done();
        });
      });
      
      var last_band_song = null;
      it('should get the band_song', function(done) {
        bombay_db.BandSong.get(last_band_song_id, function(err, band_song) {
          should.not.exist(err);
          should.exist(band_song);
          band_song.id.should.eql(last_band_song_id);
          band_song.band_id.should.eql(last_band.id);
          band_song.song_id.should.eql(last_song.id);
          band_song.song_status.should.eql(3);
          band_song.key_signature.should.eql('Am');
          last_band_song = band_song;
          done();
        });
      });

      it('should get the band', function(done) {
        last_band_song.getBand(function(err, band) {
          should.not.exist(err);
          should.exist(band);
          band.should.eql(last_band);
          done();
        });
      });

      it('should get the song', function(done) {
        last_band_song.getSong(function(err, song) {
          should.not.exist(err);
          should.exist(song);
          song.id.should.eql(last_song.id);
          song.name.should.eql(last_song.name);
          song.artist_id.should.eql(last_song.artist_id);
          done();
        });
      });

      it('should get the song list', function(done) {
        last_band.getSongs(function(err, songs) {
          should.not.exist(err);
          should.exist(songs);
          songs.length.should.eql(1);
          songs[0].id.should.eql(last_band_song.id);
          done();
        })
      });

      it('should get the band list', function(done) {
        last_song.getBands(function(err, bands) {
          should.not.exist(err);
          should.exist(bands);
          bands.length.should.eql(1);
          bands[0].id.should.eql(last_band_song.id);
          done();
        })
      });
    });
  });

  describe('Ratings', function() {
    before(function(done) { test_util.db.resetDb(done); });

    var bands_by_name = {};
    var bands_by_id = {};
    before(function(done) {
      bombay_db.Band.create([{
        name: 'Plover'
      }, {
        name: 'Plugh'
      }], function(err, bands) {
        if (err) throw err;
        bands.forEach(function(band) {
          bands_by_name[band.name] = band.id;
          bands_by_id[band.id] = band.name;
        });
        done();
      });
    });

    var persons_by_name = {};
    var persons_by_id = {};
    before(function(done) {
      bombay_db.Person.create([{
        name: 'hjones',
        full_name: 'Herkimer Jones',
        password: 'shorebird',
        email: 'hjones@musichero.non',
        system_admin: true,
        session_expires: 30
      }, {
        name: 'bbunny',
        full_name: 'Bugs Bunny',
        password: 'harebrain',
        email: 'bbunny@looney.tunes',
        system_admin: false,
        session_expires: 30
      }, {
        name: 'jguitar',
        full_name: 'Johnny Guitar',
        password: 'shredd',
        email: 'jguitar@musichero.non',
        system_admin: false,
        session_expires: 30
      }], function(err, persons) {
        if (err) throw err;
        persons.forEach(function(person) {
          persons_by_name[person.name] = person.id;
          persons_by_id[person.id] = person.name;
        });
        done();
      });
    });

    var artists_by_name = {};
    before(function(done) {
      bombay_db.Artist.create([{
        name: 'David Bowie'
      }, {
        name: 'Led Zeppelin'
      }, {
        name: 'Elton John'
      }], function(err, artists) {
        if (err) throw err;
        artists.forEach(function(artist) {
          artists_by_name[artist.name] = artist.id;
        });
        done();
      });
    });

    var songs_by_name = {};
    var songs_by_id = {};
    before(function(done) {
      bombay_db.Song.create([{
        name: 'Rebel, Rebel',
        artist_id: artists_by_name['David Bowie']
      }, {
        name: 'Bron-Y-Aur',
        artist_id: artists_by_name['Led Zeppelin']
      }, {
        name: 'Tiny Dancer',
        artist_id: artists_by_name['Elton John']
      }, {
        name: 'Ziggy Stardust',
        artist_id: artists_by_name['David Bowie']
      }, {
        name: 'Rock-n-Roll',
        artist_id: artists_by_name['Led Zeppelin']
      }, {
        name: 'Crocodile Rock',
        artist_id: artists_by_name['Elton John']
      }, {
        name: 'Misty Mountain Hop',
        artist_id: artists_by_name['Led Zeppelin']
      }], function(err, songs) {
        if (err) throw err;
        songs.forEach(function(song) {
          songs_by_name[song.name] = song.id;
          songs_by_id[song.id] = song.name;
        });
        done();
      });
    });

    var band_songs_by_id = {};
    before(function(done) {
      bombay_db.BandSong.create([{
        band_id: bands_by_name['Plover'],
        song_id: songs_by_name['Rebel, Rebel'],
        song_status: 1
      }, {
        band_id: bands_by_name['Plover'],
        song_id: songs_by_name['Bron-Y-Aur'],
        song_status: 2
      }, {
        band_id: bands_by_name['Plover'],
        song_id: songs_by_name['Tiny Dancer'],
        song_status: 3
      }, {
        band_id: bands_by_name['Plover'],
        song_id: songs_by_name['Ziggy Stardust'],
        song_status: 4
      }, {
        band_id: bands_by_name['Plover'],
        song_id: songs_by_name['Rock-n-Roll'],
        song_status: 5
      }, {
        band_id: bands_by_name['Plugh'],
        song_id: songs_by_name['Ziggy Stardust'],
        song_status: 1
      }, {
        band_id: bands_by_name['Plugh'],
        song_id: songs_by_name['Rock-n-Roll'],
        song_status: 2
      }, {
        band_id: bands_by_name['Plugh'],
        song_id: songs_by_name['Crocodile Rock'],
        song_status: 3
      }, {
        band_id: bands_by_name['Plugh'],
        song_id: songs_by_name['Misty Mountain Hop'],
        song_status: 4
      }], function(err, band_songs) {
        if (err) throw err;
        band_songs.forEach(function(band_song) {
          band_songs_by_id[band_song.id] = {
            band: bands_by_id[band_song.band_id],
            song: songs_by_id[band_song.song_id]
          };
        });
        done();
      });
    });

    var members_by_id = {};
    before(function(done) {
      bombay_db.BandMember.create([{
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['hjones'],
        band_admin: false
      }, {
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['bbunny'],
        band_admin: true
      }, {
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['jguitar'],
        band_admin: false
      }, {
        band_id: bands_by_name['Plugh'],
        person_id: persons_by_name['bbunny'],
        band_admin: false
      }, {
        band_id: bands_by_name['Plugh'],
        person_id: persons_by_name['jguitar'],
        band_admin: true
      }], function(err, members) {
        if (err) throw err;
        members.forEach(function(member) {
          members_by_id[member.id] = {
            band: bands_by_id[member.band_id],
            person: persons_by_id[member.person_id]
          };
        });
        done();
      });
    });

    it('should get the ratings for Plover', function(done) {
      bombay_db.Band.find({name: 'Plover'}, function(err, bands) {
        should.not.exist(err);
        should.exist(bands);
        bands.length.should.eql(1);
        bands[0].getSongs(function(err, band_songs) {
          should.not.exist(err);
          should.exist(band_songs);
          band_songs.length.should.eql(5);
          band_songs[0].getSongRatings(function(err, song_ratings) {
            should.not.exist(err);
            should.exist(song_ratings);
            song_ratings.length.should.eql(3);

            var persons_seen = {};
            song_ratings.forEach(function(song_rating) {
              song_rating.rating.should.eql(3);

              var member_info = members_by_id[song_rating.band_member_id];
              member_info.band.should.eql('Plover');
              persons_seen[member_info.person] = 1;

              var song_info = band_songs_by_id[song_rating.band_song_id];
              song_info.band.should.eql('Plover');
              song_info.song.should.eql('Rebel, Rebel');
            });

            persons_seen.should.eql({
              hjones: 1,
              bbunny: 1,
              jguitar: 1
            });
            done();
          });
        });
      });
    });
  });

  describe('Requests', function() {
    before(function(done) { test_util.db.resetDb(done); });

    var bands_by_name = {};
    var bands_by_id = {};
    before(function(done) {
      bombay_db.Band.create([{
        name: 'Plover'
      }, {
        name: 'Plugh'
      }], function(err, bands) {
        if (err) throw err;
        bands.forEach(function(band) {
          bands_by_name[band.name] = band.id;
          bands_by_id[band.id] = band.name;
        });
        done();
      });
    });

    var persons_by_name = {};
    var persons_by_id = {};
    before(function(done) {
      bombay_db.Person.create([{
        name: 'hjones',
        full_name: 'Herkimer Jones',
        password: 'shorebird',
        email: 'hjones@musichero.non',
        system_admin: true,
        session_expires: 30
      }, {
        name: 'bbunny',
        full_name: 'Bugs Bunny',
        password: 'harebrain',
        email: 'bbunny@looney.tunes',
        system_admin: false,
        session_expires: 30
      }, {
        name: 'jguitar',
        full_name: 'Johnny Guitar',
        password: 'shredd',
        email: 'jguitar@musichero.non',
        system_admin: false,
        session_expires: 30
      }, {
        name: 'ddrums',
        full_name: 'Danny Drums',
        password: 'pounder',
        email: 'ddrums@musichero.non',
        system_admin: false,
        session_expires: 30
      }], function(err, persons) {
        if (err) throw err;
        persons.forEach(function(person) {
          persons_by_name[person.name] = person.id;
          persons_by_id[person.id] = person.name;
        });
        done();
      });
    });

    var members_by_id = {};
    before(function(done) {
      bombay_db.BandMember.create([{
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['hjones'],
        band_admin: false
      }, {
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['bbunny'],
        band_admin: true
      }, {
        band_id: bands_by_name['Plugh'],
        person_id: persons_by_name['jguitar'],
        band_admin: true
      }, {
        band_id: bands_by_name['Plugh'],
        person_id: persons_by_name['bbunny'],
        band_admin: false
      }], function(err, members) {
        if (err) throw err;
        members.forEach(function(member) {
          members_by_id[member.id] = {
            band: bands_by_id[member.band_id],
            person: persons_by_id[member.person_id]
          };
        });
        done();
      });
    });

    it('should create some requests', function(done) {
      bombay_db.Request.create([{
        description: 'Shorebirds',
        timestamp: '2014-05-22 22:28:05',
        request_type: constants.request_type.join_band,
        status: constants.request_status.pending,
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['jguitar']
      }, {
        description: 'Shorebirds',
        timestamp: '2014-05-22 22:28:05',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: bands_by_name['Plover'],
        person_id: persons_by_name['ddrums']
      }, {
        description: 'Shorebirds',
        timestamp: '2014-05-22 22:28:05',
        request_type: constants.request_type.add_band_member,
        status: constants.request_status.pending,
        band_id: bands_by_name['Plugh'],
        person_id: persons_by_name['ddrums']
      }], function(err, requests) {
        should.not.exist(err);
        should.exist(requests);
        requests.length.should.eql(3);
        done();
      });
    });

    it('should get the requests for jguitar', function(done) {
      bombay_db.Request.find({person_id: persons_by_name['jguitar']}, function(err, requests) {
        should.not.exist(err);
        should.exist(requests);
        requests.length.should.eql(1);
        done();
      });
    });

    it('should get the requests for Plover', function(done) {
      bombay_db.Request.find({band_id: bands_by_name['Plover']}, function(err, requests) {
        should.not.exist(err);
        should.exist(requests);
        requests.length.should.eql(2);
        done();
      });
    });
  });;

  describe('Raw_query', function() {
    before(function(done) { test_util.db.resetDb(done); });

    var persons_by_name = {};
    var persons_by_id = {};
    before(function(done) {
      bombay_db.Person.create([{
        name: 'hjones',
        full_name: 'Herkimer Jones',
        password: 'shorebird',
        email: 'hjones@musichero.non',
        system_admin: true,
        session_expires: 30
      }, {
        name: 'bbunny',
        full_name: 'Bugs Bunny',
        password: 'harebrain',
        email: 'bbunny@looney.tunes',
        system_admin: false,
        session_expires: 30
      }, {
        name: 'jguitar',
        full_name: 'Johnny Guitar',
        password: 'shredd',
        email: 'jguitar@musichero.non',
        system_admin: false,
        session_expires: 30
      }], function(err, persons) {
        if (err) throw err;
        persons.forEach(function(person) {
          persons_by_name[person.name] = person.id;
          persons_by_id[person.id] = person.name;
        });
        done();
      });
    });

    it('should get some rows', function(done) {
      bombay_db.driver.execQuery('SELECT id FROM person', function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(4);
        done();
      });
    });
  });
});
