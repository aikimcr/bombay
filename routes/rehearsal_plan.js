/*
 * Route handlers for rehearsal plans
 */
var rehearsal_plan = require('lib/rehearsal_plan');
var flow = require('flow');
var db_route = require('./db');

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
  var run_through_songs = JSON.parse(req.body.run_through_songs);
  var learning_songs = JSON.parse(req.body.learning_songs);

  rehearsal_plan.save(
    req.body.band_id,
    new Date(req.body.rehearsal_date),
    run_through_songs,
    learning_songs,
    function(err, plan_id) {
      if (err) {
        console.log(err);
        res.send(500, err);
      } else {
        getPlan_(plan_id, req, res);
      }
    }
  );
};

exports.getPlan = function(req, res) {
  var plan_id = req.params.id;
  if (!plan_id) plan_id = req.query.id;
  db_route.getModel(res, 'RehearsalPlan', plan_id, 'rehearsal_date', 'rehearsal_plan', function(row) {
    row.rehearsal_date = row.rehearsal_date.substr(0, 10);
    return row;
  }.bind(this));
};

exports.getRunThroughSongs = function(req, res) {
  db_route.getModel(res, 'RehearsalPlanRunThroughSong', null, ['rehearsal_plan_id', 'sequence'], 'rehearsal_plan_run_through_song');
};

exports.getLearningSongs = function(req, res) {
  db_route.getModel(res, 'RehearsalPlanLearningSong', null, ['rehearsal_plan_id', 'sequence'], 'rehearsal_plan_learning_song');
};
