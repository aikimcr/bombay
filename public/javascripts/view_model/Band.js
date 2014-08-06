// The Individual Band Objects
function Band(id, name) {
  this.super.call(this);
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');

  this.band_members = ko.computed(function() {
    return manager.band_members.filterByKey('band_id', this.id());
  }.bind(this)).extend({throttle: 50});

  this.band_member_count = ko.computed(function() {
    return this.band_members().length;
  }.bind(this)).extend({throttle: 50});

  this.band_songs = ko.computed(function() {
    return manager.band_songs.filterByKey('band_id', this.id());
  }.bind(this)).extend({throttle: 250});

  this.band_song_count = ko.computed(function() {
    return this.band_songs().length;
  }.bind(this)).extend({throttle: 250});

  this.isPopulated = ko.computed(function() {
    return this.band_member_count() || this.band_song_count();
  }.bind(this)).extend({throttle: 50});
}
util.inherits(Band, Table);

Band.service_url = './band';
Band.model_key = 'band';
Band.columns = ['name'];
Band.list_key = 'bands';

Band.prototype.confirm_text = function() {
  return 'Delete band ' + this.name() + '?';
};

// The Band List Object
function BandList() {
  this.super.call(this, Band);
}
util.inherits(BandList, TableList);

BandList.prototype.set_sort_compare_list = function() {
  this.sort_type('name_asc');
  this.sort_compare_list = {
    'name_asc': function(a, b) {
      if (a.name() < b.name()) return -1;
      if (a.name() > b.name()) return 1;
      return 0;
    },
    'name_desc': function(a, b) {
      if (a.name() > b.name()) return -1;
      if (a.name() < b.name()) return 1;
      return 0;
    },
  };

  this.sort_compare_labels = [{
    value: 'name_asc', label: 'Name (A-Z)',
  }, {
    value: 'name_desc', label: 'Name (Z-A)'
  }];
};

BandList.prototype.set_filter_list = function() {
  this.filter_values = {
    'name': ko.observable(''),
    'minimum_member_count': ko.observable(null),
    'maximum_member_count': ko.observable(null),
    'minimum_song_count': ko.observable(null),
    'maximum_song_count': ko.observable(null)
  };

  this.filter_list = {
    'name': function(item) {
      if (this.filter_values['name']() == '') return true;
      return item.name().toLowerCase().match(this.filter_values['name']().toLowerCase());
    }.bind(this),
    'minimum_member_count': function(item) {
      var count = parseInt(this.filter_values.minimum_member_count(), 10);
      if (isNaN(count)) return true;
      return item.band_member_count() >= count;
    }.bind(this),
    'maximum_member_count': function(item) {
      var count = parseInt(this.filter_values.maximum_member_count(), 10);
      if (isNaN(count)) return true;
      return item.band_member_count() <= count;
    }.bind(this),
    'minimum_song_count': function(item) {
      var count = parseInt(this.filter_values.minimum_song_count(), 10);
      if (isNaN(count)) return true;
      return item.band_song_count() >= count;
    }.bind(this),
    'maximum_song_count': function(item) {
      var count = parseInt(this.filter_values.maximum_song_count(), 10);
      if (isNaN(count)) return true;
      return item.band_song_count() <= count;
    }.bind(this)
  };

  this.filter_order = [
    'name', 'minimum_member_count', 'maximum_member_count',
    'minimum_song_count', 'maximum_song_count'
  ];
};

BandList.prototype.build_object_ = function(model) {
  return new Band(model.id, model.name);
};
