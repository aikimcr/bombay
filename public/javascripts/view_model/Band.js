// The Individual Band Objects
function Band(id, name) {
  Table.call(this);
  this.id = ko.observable(id || -1);
  this.name = ko.observable(name || '');

  this.band_members = ko.computed(function() {
    return manager.band_members.filterByKey('band_id', this.id());
  }.bind(this)).extend({throttle: 250});

  this.band_member_count = ko.computed(function() {
    return this.band_members().length;
  }.bind(this)).extend({throttle: 250});

  this.band_songs = ko.computed(function() {
    return manager.band_songs.filterByKey('band_id', this.id());
  }.bind(this)).extend({throttle: 250});

  this.band_song_count = ko.computed(function() {
    return this.band_songs().length;
  }.bind(this)).extend({throttle: 250});

  this.isPopulated = ko.computed(function() {
    return this.band_member_count() || this.band_song_count();
  }.bind(this)).extend({throttle: 250});
}
util.inherits(Band, Table);

Band.service_url = './band';
Band.model_key = 'band';
Band.columns = ['name'];
Band.list_key = 'bands';

Band.prototype.confirm_text = function() {
  return 'Delete band ' + this.name() + '?';
};

Band.prototype.reload_list = function() {
  manager.bands.load();
};

// The Band List Object
function BandList() {
  TableList.call(this, Band);
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
    'name': ko.observable('')
  };

  this.filter_list = {
    'name': function(item) {
      if (this.filter_values['name']() == '') return true;
      return item.name().toLowerCase().match(this.filter_values['name']().toLowerCase());
    }.bind(this)
  };

  this.filter_order = ['name'];
};

BandList.prototype.build_object_ = function(model) {
  return new Band(model.id, model.name);
};
