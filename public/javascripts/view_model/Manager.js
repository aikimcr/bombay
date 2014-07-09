var manager;

ko.bindingHandlers.clickRating = {
    init: function(element, valueAccessor) {
      var getTargetValue = function(event) {
        return parseInt(event.target.getAttribute('value'));
      };

      element.classList.add('rating_container');
      for (var i = 1; i <= 5; i++) {
        var clicker = document.createElement('div');
        clicker.setAttribute('value', i);
        clicker.classList.add('rating_clicker');
        element.appendChild(clicker);
      }

      element.addEventListener('mouseover', function(event) {
        var clickers = event.target.parentElement.children;
        var index = getTargetValue(event);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
          if (i < index) clickers[i].classList.add('rating_clicker_hover');
        }
      });
      element.addEventListener('mouseout', function(event) {
        var clickers = event.target.parentElement.children;
        var index = getTargetValue(event);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
        }
      });
      element.addEventListener('click', function(event) {
        var index = getTargetValue(event);
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

  this.key_signature_map = [
    { value: '', value_text: '' },
    { value: 'Ab', value_text: 'Ab' },
    { value: 'Abm', value_text: 'Abm' },
    { value: 'A', value_text: 'A' },
    { value: 'Am', value_text: 'Am' },
    { value: 'A#', value_text: 'A#' },
    { value: 'A#m', value_text: 'A#m' },
    { value: 'Bb', value_text: 'Bb' },
    { value: 'Bbm', value_text: 'Bbm' },
    { value: 'B', value_text: 'B' },
    { value: 'Bm', value_text: 'Bm' },
    { value: 'C', value_text: 'C' },
    { value: 'Cm', value_text: 'Cm' },
    { value: 'C#', value_text: 'C#' },
    { value: 'C#m', value_text: 'C#m' },
    { value: 'Db', value_text: 'Db' },
    { value: 'Dbm', value_text: 'Dbm' },
    { value: 'D', value_text: 'D' },
    { value: 'Dm', value_text: 'Dm' },
    { value: 'D#', value_text: 'D#' },
    { value: 'D#m', value_text: 'D#m' },
    { value: 'Eb', value_text: 'Eb' },
    { value: 'Ebm', value_text: 'Ebm' },
    { value: 'E', value_text: 'E' },
    { value: 'Em', value_text: 'Em' },
    { value: 'F', value_text: 'F' },
    { value: 'Fm', value_text: 'Fm' },
    { value: 'F#', value_text: 'F#' },
    { value: 'F#m', value_text: 'F#m' },
    { value: 'Gb', value_text: 'Gb' },
    { value: 'Gbm', value_text: 'Gbm' },
    { value: 'G', value_text: 'G' },
    { value: 'Gm', value_text: 'Gm' },
    { value: 'G#', value_text: 'G#' },
    { value: 'G#m', value_text: 'G#m' }
  ];

  this.bands = new BandList();
  this.persons = new PersonList();
  this.artists = new ArtistList();
  this.songs = new SongList();
  this.band_members = new BandMemberList();
  this.band_songs = new BandSongList();
  this.song_ratings = new SongRatingList();
  this.requests = new RequestList();
  this.reports = new ReportList();

  this.current_person = ko.observable(new Person(-1, '', '', '', '', false));
  this.current_band = ko.observable(new Band(-1, ''));

  this.tab_list = ko.computed(function() {
    var result = tab_list = [
      { value: 3, value_text: 'My Bands' },
      { value: 4, value_text: 'Band Members' },
      { value: 5, value_text: 'Artists' },
      { value: 6, value_text: 'All Songs' },
      { value: 7, value_text: 'Band Songs' }
    ];

    if (this.current_person().system_admin()) {
      result.unshift({ value: 2, value_text: 'All People' });
      result.unshift({ value: 1, value_text: 'All Bands', });
    }

    result.unshift({ value: 0, value_text: 'Dashboard' });

    return result;
  }.bind(this));

  if (!for_test) {
    var svc = service.getInstance();
    svc.get('./session_info', function(result_code, result) {
      if (result_code != 200 && result_code != 304) {
        throw new Error('Unexpected result ' + result_code);
      }
      
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
    this.requests.load();
    this.reports.load();
  }

  this.current_tab = ko.observable(this.tab_list[0]);

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
  }.bind(this)).extend({ throttle: 250 });

  this.membership_sorts = ko.computed(function() {
    return ko.utils.arrayFilter(this.band_members.sort_compare_labels, function(sort_compare) {
      return sort_compare.value.match('band_name_');
    }.bind(this))
  }.bind(this));

  this.current_memberships = ko.computed(function() {
    return ko.utils.arrayFilter(this.band_members.filtered_list(), function(band_member) {
      return band_member.person_id() == this.current_person().id();
    }.bind(this));
  }.bind(this)).extend({ throttle: 250 });

  this.current_bands = ko.computed(function() {
    return ko.utils.arrayMap(
      this.current_person().memberships(), 
      function(band_member) { return band_member.band() }
    );
  }.bind(this)).extend({ throttle: 250 });

  this.other_bands = ko.computed(function() {
    return ko.utils.arrayFilter(this.bands.list(), function(band) {
      var member = ko.utils.arrayFirst(this.band_members.list(), function(band_member) {
        return band_member.band_id() == band.id() &&
          band_member.person_id() == this.current_person().id();
      }.bind(this));
      return !member;
    }.bind(this));
  }.bind(this)).extend({ throttle: 250 });

  this.band_member_sorts = ko.computed(function() {
    return ko.utils.arrayFilter(this.band_members.sort_compare_labels, function(sort_compare) {
      return sort_compare.value.match('person_') || sort_compare.value.match('band_admin_');
    }.bind(this));
  }.bind(this));

  this.current_members = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFilter(this.band_members.filtered_list(), function(band_member) {
        return band_member.band_id() == this.current_band().id();
      }.bind(this));
    } else {
      return [];
    }
  }.bind(this)).extend({ throttle: 250 });

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
  }.bind(this)).extend({ throttle: 250 });

  this.current_band_songs = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFilter(this.band_songs.filtered_list(), function(band_song) {
        return band_song.band_id() == this.current_band().id();
      }.bind(this));
    } else {
      return [];
    }
  }.bind(this)).extend({ throttle: 250 });

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
  }.bind(this)).extend({ throttle: 250 });

  this.current_requests = ko.computed(function() {
    return this.requests.filtered_list();
  }.bind(this)).extend({ throttle: 250 });

  this.current_reports = ko.computed(function() {
    if (this.current_band() && this.current_band().id() > 0) {
      var band_reports = this.reports.list()[this.current_band().id()] || ko.observableArray();
      return band_reports().sort(function(a, b) {
        if (! a.name().match(/_([0-9]+)\.html$/)) {
          if (a.name() == b.name()) return 0;
          return -1;
        }
        if (! b.name().match(/_([0-9]+)\.html$/)) {
          if (a.name() == b.name()) return 0;
          return 1;
        }
        if (a.name() > b.name()) return -1;
        if (a.name() < b.name()) return 1;
        return 0;
      });
    } else {
      return [];
    }
  }.bind(this)).extend({ throttle: 250 });

  this.forms = {};
  if (!for_test) {
    this.forms.add_band = new AddBand();
    this.forms.edit_band = new EditBand();
    this.forms.join_band = new JoinBand();
    this.forms.add_person = new AddPerson();
    this.forms.edit_profile = new EditProfile();
    this.forms.change_password = new ChangePassword();
    this.forms.add_band_member = new AddBandMember();
    this.forms.add_artist = new AddArtist();
    this.forms.edit_artist = new EditArtist();
    this.forms.add_song = new AddSong();
    this.forms.edit_song = new EditSong();
    this.forms.add_band_song = new AddBandSong();
  }

  this.confirm_dialog = new confirm_dialog();

  this.edit_table_object = function(data, event) {
    window.console.log(event);
    window.console.log(data);
    this.show(data);
  };

  this.update_table_object = function(data, event) {
    var target = event.target;
    var name = target.name;
    var value = target.type == 'checkbox' ? target.checked : target.value;
    var changeset = {};
    changeset[name] = value;
    data.update(changeset, function(result) {
      if (result && !result.err) {
        data.refresh(function(result) {
          if (result.err) {
            window.console.log(result.err);
          }
        });
      }
    });
  };

  this.delete_table_object = function(data, event) {
    data.delete(function(result) {
      if (result && !result.err) {
        data.reload_list();
        data.reload_relatives();
      }
    }, event);
  };

  this.request_msg = ko.observable('');
  this.send_request_action = function(data, event) {
    request_action = event.target.parentElement.querySelector('select').value;
    if (request_action == 'delete') {
      data.delete(function(result_code, result) {
        if (result_code != 200 && result_code != 304) {
          this.request_msg(result);
        } else {
          // XXX Update lists.
          this.request_msg('');
        }
      }.bind(this), event);
    } else {
      data.change_status(request_action, function(result) {
        if (result_code != 200 && result_code != 304) {
          this.request_msg(result);
        } else {
          // XXX Update lists.
          this.request_msg('');
        }
      }.bind(this), event);
    }
  }.bind(this);
}

function app_start() {
  ko.applyBindings(new Manager());
}
