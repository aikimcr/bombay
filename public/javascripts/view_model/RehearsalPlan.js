// The Individual Plan Objects
function RehearsalPlan(id, rehearsal_date) {
  this.super.call(this);
  this.id = ko.observable(id || -1);
  this.rehearsal_date = ko.observable(rehearsal_date);
}
util.inherits(RehearsalPlan, Table);

RehearsalPlan.service_url = './plan';
RehearsalPlan.model_key = 'plan';
RehearsalPlan.columns = ['rehearsal_date'];
RehearsalPlan.list_key = 'plans';

RehearsalPlan.confirm_text = function() {
  return 'Delete rehearsal plan for ' + this.rehearsal_date() + '?';
};

// The Plan List Object
function RehearsalPlanList() {
  this.super.call(this, RehearsalPlan);
}
util.inherits(RehearsalPlanList, TableList);

RehearsalPlanList.prototype.set_sort_compare_list = function() {
  this.sort_type('date_asc');
  this.sort_compare_list = {
    'date_asc': function(a, b) {
      if (a.rehearsal_date() < b.rehearsal_date()) return -1;
      if (a.rehearsal_date() > b.rehearsal_date()) return 1;
      return 0;
    },
    'date_desc': function(a, b) {
      if (a.rehearsal_date() > b.rehearsal_date()) return -1;
      if (a.rehearsal_date() < b.rehearsal_date()) return 1;
      return 0;
    }
  };

  this.sort_compare_labels = [{
    value: 'date_asc', label: 'Rehearsal Date (Low to High)'
  }, {
    value: 'date_desc', label: 'Rehearsal Date (Hight to Low)'
  }];
};

RehearsalPlanList.prototype.set_filter_list = function() {
  this.filter_values = {
  };
  this.filter_list = {
  };
  this.filter_order = [
  ];
};

RehearsalPlanList.prototype.build_object_ = function(model) {
  return new RehearsalPlan(model.id, model.rehearsal_date);
};
