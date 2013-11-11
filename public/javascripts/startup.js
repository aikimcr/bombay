var manager;

function Band(id, name) {
  this.id = ko.observable(id);
  this.name = ko.observable(name);

  this.band_members = ko.computed(function () {
    return ko.utils.arrayFilter(manager.band_members(), function(band_member) {
      return band_member.band_id() == this.id();
    }.bind(this));
  }.bind(this));
  this.band_member_count = ko.computed(function () {
    return this.band_members().length;
  }.bind(this));
  this.band_songs = ko.computed(function () {
    return ko.utils.arrayFilter(manager.band_songs(), function(band_song) {
      return band_song.band_id() == this.id();
    }.bind(this));
  }.bind(this));
}

function Person(id, name, full_name, email) {
  this.id = ko.observable(id);
  this.name = ko.observable(name);
  this.full_name = ko.observable(full_name);
  this.email = ko.observable(email);
  this.band_members = ko.computed(function() {
    return ko.utils.arrayFilter(manager.band_members(), function(band_member) {
      return band_member.person_id() == this.id();
    }.bind(this));
  }.bind(this));
  this.song_ratings = ko.computed(function () {
    return ko.utils.arrayFilter(manager.song_ratings(), function(song_rating) {
      return song_rating.person_id() == this.id();
    }.bind(this));
  }.bind(this));
}

function Artist(id, name) {
  this.id = ko.observable(id);
  this.name = ko.observable(name);
  this.songs = ko.computed(function () {
    return ko.utils.arrayFilter(manager.songs(), function(song) {
      return song.artist_id() == this.id();
    }.bind(this));
  }.bind(this));
  this.song_count = ko.computed(function () {
    return this.songs().length;
  }.bind(this));
}

function Song(id, name, artist_id) {
  this.id = ko.observable(id);
  this.name = ko.observable(name);
  this.artist_id = ko.observable(artist_id);
  this.artist = ko.computed(function () {
    return manager.getById(manager.artists, this.artist_id());
  }.bind(this));
  this.band_songs = ko.computed(function () {
    return ko.utils.arrayFilter(manager.band_songs(), function (band_song) {
      return band_song.song_id() == this.id();
    }.bind(this));
  }.bind(this));
  this.description = ko.computed(function () {
    if (!this.name() || !this.artist()) { return ''; }
    return this.name() + ' by ' + this.artist().name();
  }.bind(this));
  this.bands = ko.computed(function () {
    return ko.utils.arrayMap(this.band_songs(), function(band_song) {
      return band_song.band();
    }.bind(this));
  }.bind(this));
  this.band_count = ko.computed(function () {
    return this.bands().length;
  }.bind(this));
}

function BandMember(id, band_id, person_id, band_admin) {
  this.id = ko.observable(id);
  this.band_id = ko.observable(band_id);
  this.person_id = ko.observable(person_id);
  this.person = ko.computed(function () {
    return manager.getById(manager.people, this.person_id());
  }.bind(this));
  this.band_admin = ko.observable(band_admin);
  this.band = ko.computed(function () {
    return manager.getById(manager.bands, this.band_id());
  }.bind(this));
}

function BandSong(id, band_id, song_id, status) {
  this.id = ko.observable(id);
  this.band_id = ko.observable(band_id);
  this.song_id = ko.observable(song_id);
  this.status = ko.observable(status);

  // Joins
  this.band = ko.computed(function () {
    return manager.getById(manager.bands, this.band_id());
  }.bind(this));
  this.song = ko.computed(function () {
    return manager.getById(manager.songs, this.song_id());
  }.bind(this));
  this.song_ratings = ko.computed(function () {
    return ko.utils.arrayFilter(manager.song_ratings(), function (rating) {
      return rating.band_song_id() == this.id();
    }.bind(this));
  }.bind(this));

  // Calculations
  this.member_rating = ko.computed(function () {
    var ratings = this.song_ratings();
    if (ratings.length == 0) {
      return '**no ratings**';
    } else {
      var member_rating = ko.utils.arrayFirst(ratings, function(rating) {
        return rating.person_id() == manager.current_person().id();
      }.bind(this));
      if (member_rating) {
        return member_rating.song_rating();
      } else {
        return '**unrated**';
      }
    }
  }.bind(this));

  this.average_rating = ko.computed(function () {
    var ratings = this.song_ratings();
    if (ratings.length == 0) {
      return '**no ratings**';
    }
    var rating_sum = 0;
    ratings.forEach(function(rating) {
      rating_sum += rating.song_rating();
    });

    return rating_sum / ratings.length;
  }.bind(this));

  // Additional Add logic
  ko.utils.arrayForEach(this.band().band_members(), function(band_member) {
    manager.addSongRatingWithArgs(band_member.person_id(), this.id());
  }.bind(this));
}

function SongRating(id, person_id, band_song_id, rating) {
  this.id = ko.observable(id);
  this.person_id = ko.observable(person_id);
  this.band_song_id = ko.observable(band_song_id);
  this.song_rating = ko.observable(rating);
  this.person_name = ko.computed(function () {
    return manager.getById(manager.people, this.person_id()).full_name();
  }.bind(this));
}

function Manager() {
  manager = this;

  this.getById = function(list, id) {
    return list().filter(function(item) { return (item.id() == id) })[0];
  };

  // Declare the model lists
  this.people = ko.observableArray([]);
  this.bands = ko.observableArray([]);
  this.band_members = ko.observableArray([]);
  this.artists = ko.observableArray([]);
  this.songs = ko.observableArray([]);
  this.band_songs = ko.observableArray([]);
  this.song_ratings = ko.observableArray([]);

  // Populate the model lists
  this.people.push(new Person(1, 'mriehle', 'Michael Riehle', 'rumbler@mriehle.com'))
  this.people.push(new Person(2, 'bbunny', 'Bugs Bunny', 'bbunny@mriehle.com'))
  this.current_person = ko.observable(this.people()[1]);
  this.next_person_id = 3;

  this.bands.push(new Band(1, 'All Night Music'));
  this.bands.push(new Band(2, 'Date Night'));
  this.bands.push(new Band(3, 'Wild At Heart'));
  this.bands.push(new Band(4, 'Pieces Of Eight'));
  this.current_band = ko.observable(this.bands()[0]);
  this.next_band_id = 5;

  this.band_members.push(new BandMember(1, 1, 1, true));
  this.band_members.push(new BandMember(2, 1, 2, false));
  this.band_members.push(new BandMember(3, 2, 2, true));
  this.band_members.push(new BandMember(4, 2, 1, false));
  this.band_members.push(new BandMember(5, 3, 1, true));
  this.band_members.push(new BandMember(6, 4, 2, true));
  this.next_band_member_id = 7;

  this.artists.push(new Artist(1, 'AC/DC'))
  this.artists.push(new Artist(2, 'The Beatles'))
  this.artists.push(new Artist(3, 'David Bowie'))
  this.artists.push(new Artist(4, 'ZZ Top'))
  this.artists.push(new Artist(5, 'Led Zeppelin'))
  this.next_artist_id = 6;

  this.songs.push(new Song(1, 'You Shook Me All Night Long', 1));
  this.songs.push(new Song(2, 'Help', 2));
  this.songs.push(new Song(3, 'Rebel, Rebel', 3));
  this.songs.push(new Song(4, 'La Grange', 4));
  this.next_song_id = 5;

  var next_song_rating_id = 1;
  this.addSongRatingWithArgs = function(person_id, band_song_id) {
    this.song_ratings.push(new SongRating(next_song_rating_id, person_id, band_song_id, 3));
  };

  this.band_songs.push(new BandSong(1, 1, 1, 0));
  this.band_songs.push(new BandSong(2, 1, 2, 1));
  this.band_songs.push(new BandSong(3, 2, 3, 2));
  this.band_songs.push(new BandSong(4, 2, 4, -1));
  this.next_band_song_id = 5;

  // Standard filtered lists
  this.current_bands = ko.computed(function() {
    return ko.utils.arrayMap(
      this.current_person().band_members(), 
      function(band_member) {
        return band_member.band();
      }.bind(this)
    );
  }.bind(this));

  this.other_bands = ko.computed(function() {
    return ko.utils.arrayFilter(this.bands(), function(band) {
      var result = ko.utils.arrayFirst(this.band_members(), function(band_member) {
        return band_member.person_id() == this.current_person().id() &&
          band_member.band_id() == band.id();
      }.bind(this));
      return !result;
    }.bind(this));
  }.bind(this));

  this.current_members = ko.computed(function () {
    return ko.utils.arrayFilter(this.band_members(), function(band_member) {
      return band_member.band_id() == this.current_band().id();
    }.bind(this));
  }.bind(this));

  this.other_people = ko.computed(function () {
    return ko.utils.arrayFilter(this.people(), function(person) {
      var result = ko.utils.arrayFirst(this.band_members(), function(band_member) {
        return band_member.person_id() == person.id() &&
          band_member.band_id() == this.current_band().id();
      }.bind(this));
      return !result;
    }.bind(this));
  }.bind(this));

  this.current_band_songs = ko.computed(function () {
    return ko.utils.arrayFilter(this.band_songs(), function(band_song) {
      return band_song.band_id() == this.current_band().id();
    }.bind(this));
  }.bind(this));

  this.non_band_songs = ko.computed(function () {
    return ko.utils.arrayFilter(this.songs(), function(song) {
      var result = ko.utils.arrayFirst(this.band_songs(), function(band_song) {
        return band_song.band_id() == this.current_band().id() &&
          band_song.song_id() == song.id();
      }.bind(this));
      return !result;
    }.bind(this));
  }.bind(this));

  // Show Editors
  this.joinBandFormVisible = ko.observable(false);
  this.showJoinBandForm = function () {
    this.joinBandFormVisible(true);
  };
  this.hideJoinBandForm = function () {
    this.joinBandFormVisible(false);
  };
  this.newBandMemberBand = ko.observable();
  this.joinBand = function() {
    this.band_members.push(new BandMember(
      this.next_band_member_id,
      this.newBandMemberBand().id(),
      this.current_person().id(),
      false
    ));
    this.next_band_member_id++;
    this.newBandMemberBand(null);
  };

  this.bandFormVisible = ko.observable(false);
  this.showBandForm = function () {
    this.bandFormVisible(true);
  };
  this.hideBandForm = function () {
    this.bandFormVisible(false);
  };
  this.newBandName = ko.observable();
  this.addBand = function() {
    this.bands.push(new Band(this.next_band_id, this.newBandName()));
    this.band_members.push(new BandMember(
      this.next_band_member_id,
      this.next_band_id,
      this.current_person().id(),
      true
    ));
    this.next_band_id++;
    this.next_band_member_id++;
    this.newBandName(null);
  };

  this.bandMemberFormVisible = ko.observable(false);
  this.showBandMemberForm = function () {
    this.bandMemberFormVisible(true);
  };
  this.hideBandMemberForm = function () {
    this.bandMemberFormVisible(false);
  };
  this.newBandMemberPerson = ko.observable();
  this.addBandMember = function() {
    this.band_members.push(new BandMember(
      this.next_band_member_id,
      this.current_band().id(),
      this.newBandMemberPerson().id(),
      false
    ));
    this.next_band_member_id++;
    this.newBandMemberPerson(null);
  };

  this.personFormVisible = ko.observable(false);
  this.showPersonForm = function () {
    this.personFormVisible(true);
  };
  this.hidePersonForm = function () {
    this.personFormVisible(false);
  };
  this.newPersonLoginName = ko.observable();
  this.newPersonFullName = ko.observable();
  this.newPersonEmail = ko.observable();
  this.addPerson = function() {
    this.people.push(new Person(
      this.next_person_id,
      this.newPersonLoginName(),
      this.newPersonFullName(),
      this.newPersonEmail()
    ));
    this.next_person_id++;
    this.newPersonLoginName(null);
    this.newPersonFullName(null);
    this.newPersonEmail(null);
  };

  this.artistFormVisible = ko.observable(false);
  this.showArtistForm = function () {
    this.artistFormVisible(true);
  };
  this.hideArtistForm = function () {
    this.artistFormVisible(false);
  };
  this.newArtistName = ko.observable();
  this.addArtist = function() {
    this.artists.push(new Artist(this.next_artist_id, this.newArtistName()));
    this.next_artist_id++;
    this.newArtistName(null);
  };

  this.songFormVisible = ko.observable(false);
  this.showSongForm = function () {
    this.songFormVisible(true);
  };
  this.hideSongForm = function () {
    this.songFormVisible(false);
  };
  this.newSongName = ko.observable();
  this.newSongArtist = ko.observable();
  this.addSong = function() {
    this.songs.push(new Song(
      this.next_song_id,
      this.newSongName(),
      this.newSongArtist().id()
    ));
    this.next_song_id++;
    this.newSongName(null);
    this.newSongArtist(null);
  };

  this.bandSongFormVisible = ko.observable(false);
  this.showBandSongForm = function () {
    this.bandSongFormVisible(true);
  };
  this.hideBandSongForm = function () {
    this.bandSongFormVisible(false);
  };
  this.newBandSongSong = ko.observable();
  this.addBandSong = function() {
    this.band_songs.push(new BandSong(
      this.next_band_song_id,
      this.current_band().id(),
      this.newBandSongSong().id()
    ));
    this.next_song_id++;
    this.newBandSongSong(null);
  };

  // Delete Code
  this.deleteBand = function(band) {
    manager.bands.remove(band);
    delete band;
  };

  this.deleteBandMember = function(band_member) {
    ko.utils.arrayForEach(band_member.person().song_ratings(), function(song_rating) {
      if (song_rating.band_song().band_id() == band_member.band_id()) {
        manager.song_ratings.remove(song_rating);
        delete song_rating;
      }
    }.bind(this));
    manager.band_members.remove(band_member);
    delete band_member;
  };

  this.quitBand = function(band) {
    ko.utils.arrayForEach(band.band_songs().song_ratings(), function(song_rating) {
      if (song_rating.person_id() == manager.current_person().id()) {
        manager.song_ratings.remove(song_rating);
        delete song_rating;
      }
    }.bind(this));
    var band_member = ko.utils.arrayFirst(manager.band_members(), function(band_member) {
      return band_member.band_id() == band.id() && band_member.person_id() == this.current_person().id();
    }.bind(manager));
    manager.deleteBandMember(band_member);
  };

  this.deleteArtist = function(artist) {
    manager.artists.remove(artist);
    delete artist;
  };

  this.deleteSong = function(song) {
    manager.songs.remove(song);
    delete song;
  };

  this.deleteBandSong = function(band_song) {
    ko.utils.arrayForEach(band_song.song_ratings(), function (song_rating) {
      manager.song_ratings.remove(song_rating);
      delete song_rating;
    }.bind(this));
    manager.band_songs.remove(band_song);
    delete band_song;
  };
}

function app_start() {
  ko.applyBindings(new Manager());
}
