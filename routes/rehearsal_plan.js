/*
 * Route handlers for rehearsal plans
 */
var rehearsal_plan = require('lib/rehearsal_plan');
var flow = require('flow');

exports.getPlanLists = flow.define(
  function(req, res) {
    this.req = req;
    this.res = res;
    this.band_id = req.query.band_id;
    this.rehearsal_date = new Date(req.query.rehearsal_date);
    rehearsal_plan.getRunThroughList(this.band_id, this.rehearsal_date, this);
  },
  function(err, rows) {
    if (err) {
      this.res.send(500, err);
    } else {
      this.run_through_songs = rows;
      rehearsal_plan.getLearningList(this.band_id, this.rehearsal_date, this);
    }
  },
  function(err, rows) {
    if (err) {
      this.res.send(500, err);
    } else {
      this.learning_songs = rows;
      this.res.json(200, {
        rehearsal_date: this.rehearsal_date.toISOString().substr(0, 10),
        run_through_songs: this.run_through_songs,
        learning_songs: this.learning_songs
      });
    }
  }
);

function getPlan_(plan_id, req, res) {
  rehearsal_plan.get(plan_id, function(err, plan) {
    if (err) {
      res.send(500, err);
    } else {
      plan_result = JSON.parse(JSON.stringify(plan));
      plan_result.rehearsal_plan.rehearsal_date = plan_result.rehearsal_plan.rehearsal_date.substr(0, 10);
      res.json(200, plan_result);
    }
  });
}

exports.postPlan = function(req, res) {
  rehearsal_plan.save(
    new Date(req.body.rehearsal_date),
    req.body.run_through_songs,
    req.body.learning_songs,
    function(err, plan_id) {
      if (err) {
        res.response(500, err);
      } else {
        getPlan_(plan_id, req, res);
      }
    }
  );
};

exports.getPlan = function(req, res) {
  getPlan_(req.query.id, req, res);
};
