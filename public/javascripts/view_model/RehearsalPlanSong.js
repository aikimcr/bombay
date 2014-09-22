// The Individual Song Objects
function RehearsalPlanSong(id, rehearsal_plan_id, band_song_id, sequence) {
  this.super.call(this);
  this.id = ko.observable(id);
  this.rehearsal_plan_id = ko.observable(rehearsal_plan_id);
  this.band_song_id = ko.observable(band_song_id);
  this.sequence = ko.observable(sequence);
}
util.inherits(RehearsalPlanSong, Table);

RehearsalPlanSong.columns = ['rehearsal_plan_id', 'band_song_id', 'sequence'];

// The Plan Song List Object
function RehearsalPlanSongList(song_object) {
  this.super.call(this, song_object);
}
util.inherits(RehearsalPlanList, TableList);

RehearsalPlanList.prototype.set_sort_compare_list = function() {
  this.sort_type('seq_asc');
  this.sort_compare_list = {
    'seq_asc': function(a, b) {
      if (a.sequence() < b.sequence()) return -1;
      if (a.sequence() > b.sequence()) return 1;
      return 0;
    },
    'seq_desc': function(a, b) {
      if (a.sequence() > b.sequence()) return -1;
      if (a.sequence() < b.sequence()) return 1;
      return 0;
    }
  };

  this.sort_compare_labels = [{
    value: 'seq_asc', label: 'Sequence (Low to High)'
  }, {
    value: 'seq_desc', label: 'Sequence (High to Low)'
  }];
};

RehearsalPlanSongList.prototype.set_filter_list = function() {
  this.filter_values = {
  };
  this.filter_list = {
  };
  this.filter_order = [
  ];
};
  
