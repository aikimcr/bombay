var manager;

ko.bindingHandlers.clickRating = {
    init: function(element, valueAccessor) {
      element.classList.add('rating_container');
      for (var i = 1; i <= 5; i++) {
        var clicker = document.createElement('div');
        clicker.innerHTML = i;
        clicker.classList.add('rating_clicker');
        element.appendChild(clicker);
      }

      element.addEventListener('mouseover', function(event) {
        var clickers = event.target.parentElement.children;
        var index = parseInt(event.target.innerHTML);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
          if (i < index) clickers[i].classList.add('rating_clicker_hover');
        }
      });
      element.addEventListener('mouseout', function(event) {
        var clickers = event.target.parentElement.children;
        var index = parseInt(event.target.innerHTML);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
        }
      });
      element.addEventListener('click', function(event) {
        var index = parseInt(event.target.innerHTML);
        var observable = valueAccessor();
        observable(index);
      });
    },
    update: function(element, valueAccessor) {
      var observable = valueAccessor();
      var index = observable();
      var clickers = element.children;

      for(var i=0; i < clickers.length; i++) {
        clickers[i].classList.remove('rating_clicker_selected');
        if (i < index) clickers[i].classList.add('rating_clicker_selected');
      }
    }
};

ko.bindingHandlers.showRating = {
    init: function(element, valueAccessor) {
      element.classList.add('rating_container');
      var rating = document.createElement('div');
      rating.classList.add('rating_value');
      element.appendChild(rating);
    },
    update: function(element, valueAccessor) {
      var observable = valueAccessor();
      var value = parseInt((observable() * 10) + .5) / 10;
      var width = parseInt(value * 20) + 'px';
      element.firstChild.style.width = width;
      element.firstChild.innerHTML = value;
    },
};

function Manager(for_test) {
  manager = this;

  this.song_status_map = [
    { value: -2, value_text: 'Retired' },
    { value: -1, value_text: 'Proposed' },
    { value: 0, value_text: 'New' },
    { value: 1, value_text: 'Learning' },
    { value: 2, value_text: 'Run Through' },
    { value: 3, value_text: 'Ready' },
    { value: 4, value_text: 'Standard' }
  ];

  this.bands = new BandList();
  this.persons = new PersonList();
  this.artists = new ArtistList();
  this.songs = new SongList();
  this.band_members = new BandMemberList();
  this.band_songs = new BandSongList();
  this.song_ratings = new SongRatingList();

  this.current_person = ko.observable(new Person(-1, '', '', '', '', false));
  this.current_band = ko.observable(new Band(-1, ''));

  if (!for_test) {
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
  }

  this.current_band_member = ko.computed(function() {
    if (this.current_band()) {
      var result = ko.utils.arrayFirst(this.band_members.list(), function(band_member) {
        return band_member.band_id() == this.current_band().id() &&
          band_member.person_id() == this.current_person().id();
      }.bind(this));
      return result || new BandMember();
    } else {
      return new BandMember();
    }
  }.bind(this));

  this.current_memberships = ko.computed(function() {
    return this.band_members.filterByKey('person_id', this.current_person().id());
  }.bind(this));

  this.current_bands = ko.computed(function() {
    return ko.utils.arrayMap(
      this.current_memberships(),
      function(band_member) { return band_member.band() }
    );
  }.bind(this));

  this.other_bands = ko.computed(function() {
    return ko.utils.arrayFilter(this.bands.list(), function(band) {
      var member = ko.utils.arrayFirst(this.band_members.list(), function(band_member) {
        return band_member.band_id() == band.id() &&
          band_member.person_id() == this.current_person().id();
      }.bind(this));
      return !member;
    }.bind(this));
  }.bind(this));

  this.current_members = ko.computed(function() {
    if (this.current_band()) {
      return this.current_band().band_members();
    } else {
      return [];
    }
  }.bind(this));

  this.non_band_members = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFilter(this.persons.list(), function(person) {
        var member = ko.utils.arrayFirst(this.band_members.list(), function(band_member) {
          return band_member.band_id() == this.current_band().id() &&
            band_member.person_id() == person.id();
        }.bind(this));
        return !member;
      }.bind(this));
    } else {
      return this.persons.list();
    }
  }.bind(this));

  this.current_band_songs = ko.computed(function() {
    if (this.current_band()) {
      return this.band_songs.filterByKey('band_id', this.current_band().id());
    } else {
      return [];
    }
  }.bind(this));

  this.non_band_songs = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFilter(this.songs.list(), function(song) {
        var result = ko.utils.arrayFirst(this.band_songs.list(), function(band_song) {
          return band_song.band_id() == this.current_band().id() &&
            band_song.song_id() == song.id();
        }.bind(this));
        return !result;
      }.bind(this));
    } else {
      return this.songs.list();
    }
  }.bind(this));

  this.forms = {};
  if (!for_test) {
    this.forms.add_band = new AddBand();
    this.forms.join_band = new JoinBand();
    this.forms.add_person = new AddPerson();
    this.forms.add_band_member = new AddBandMember();
    this.forms.add_artist = new AddArtist();
    this.forms.add_song = new AddSong();
    this.forms.add_band_song = new AddBandSong();
  }

  this.confirm_dialog = new confirm_dialog();

  this.update_table_object = function(data, event) {
    var target = event.target;
    var name = target.name;
    var value = target.type == 'checkbox' ? target.checked : target.value;
    var changeset = {};
    changeset[name] = value;
    data.update(changeset, function(result) {
      if (result && !result.err) {
        data.reload_list();
      }
    });
  };

  this.delete_table_object = function(data, event) {
    data.delete(function(result) {
      if (result && !result.err) {
        data.reload_list();
      }
    }, event);
  };
}

function app_start() {
  ko.applyBindings(new Manager());
}
