var manager;

function Manager() {
  manager = this;

  this.bands = new BandList();
  this.persons = new PersonList();
  this.artists = new ArtistList();
  this.songs = new SongList();
  this.band_members = new BandMemberList();
  this.band_songs = new BandSongList();
  this.song_ratings = new SongRatingList();

  this.current_person = ko.observable(new Person(-1, '', '', '', '', false));
  this.current_band = ko.observable(new Band(-1, ''));

  var svc = service.getInstance();
  svc.get('./session_info', function(result) {
    this.current_person(new Person(
      result.person.id,
      result.person.name,
      result.person.full_name,
      result.person.email,
      result.person.system_admin
    ));
  }.bind(this));

  this.bands.load();
  this.persons.load();
  this.artists.load();
  this.songs.load();
  this.band_members.load();
  this.band_songs.load();
  this.song_ratings.load();

  this.current_band_member = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFirst(this.band_members.list(), function(band_member) {
        return band_member.band_id() == this.current_band().id() &&
          band_member.person_id() == this.current_person().id();
      }.bind(this));
    } else {
      return new BandMember();
    }
  }.bind(this));

  this.current_bands = ko.computed(function() {
    return ko.utils.arrayMap(
      this.band_members.filterByKey('person_id', this.current_person().id()),
      function(band_member) { return band_member.band() }
    );
  }.bind(this));

  this.current_members = ko.computed(function() {
    if (this.current_band()) {
      return this.band_members.filterByKey('band_id', this.current_band().id());
    } else {
      return [];
    }
  }.bind(this));

  this.current_band_songs = ko.computed(function() {
    if (this.current_band()) {
      return this.band_songs.filterByKey('band_id', this.current_band().id());
    } else {
      return [];
    }
  }.bind(this));

  this.showBandForm = function() {};
  this.showJoinBandForm = function() {};
  this.showBandMemberForm = function() {};
  this.showArtistForm = function() {};
  this.showSongForm = function() {};
  this.showBandSongForm = function() {};
}

function app_start() {
  ko.applyBindings(new Manager());
}
