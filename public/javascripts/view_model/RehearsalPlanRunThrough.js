// The Individual Run Through Objects
function RehearsalPlanRunThrough() {
  this.super.apply(this, arguments);
}
util.inherits(RehearsalPlanRunThrough, RehearsalPlanSong);

RehearsalPlanRunThrough.service_url = './plan/run_through';
RehearsalPlanRunThrough.model_key = 'plan_run_through';
RehearsalPlanRunThrough.list_key = 'plan_run_throughs';

RehearsalPlanRunThrough.confirm_text = function() {
  return 'Delete rehearsal plan song ' + this.id() + '?';
};

// The Run Through List Object
function RehearsalPlanRunThroughList() {
  this.super.call(this, RehearsalPlanRunThrough);
}
