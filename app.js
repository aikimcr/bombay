
/**
 * Module dependencies.
 */

var base64_decode = require('base64').decode;
var express = require('express');
var flash = require('connect-flash');
var http = require('http');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
var path = require('path');
var util = require('util');

var bombay_util = require('lib/util');
var db_orm = require('lib/db_orm');
var encryption = require('routes/encryption');
var index = require('routes/index');
var login = require('routes/login');
var reports = require('routes/reports');
var route_db = require('routes/db');
var rehearsal_plan = require('routes/rehearsal_plan');
var validation = require('routes/validation');

//var session_expires = 24 * 3600 * 1000;
var session_expires = 20 * 60 * 1000;

passport.use(new LocalStrategy(
  function(username, password, done) {
    password = decodeURIComponent(password);
    //console.log('check_credentials:' + username + ', ' + password);

    db_orm.Person.one({name: username}, function(err, person) {
      if (err) {
        console.log('Failed login for ' + username + bombay_util.inspect(err));
        return done(null, false, { message: 'Login Incorrect.'});
      } else if (person) {
        var pem = bombay_util.get_pem_file('crypto/rsa_private.pem');
        //console.log(pem);
        var decrypt_password = password;
        var decrypt_person = person.password;

        // console.log(decrypt_person + ', ' + decrypt_password);
        try {
          decrypt_password = base64_decode(bombay_util.decrypt(pem, password));
          decrypt_person = bombay_util.decrypt(pem, person.password);
        } catch(e) {
          console.log(e);
          return done(null, false, { message: 'Unable to decrypt passwords' });
        };
        // console.log(decrypt_person + ', ' + decrypt_password);
        if (username == person.name && decrypt_password == decrypt_person) {
          console.log(username + ' logged in');
          return done(null, person);
        } else {
          return done(null, false, { message: 'Login Incorrect'});
        }
      } else {
        return done(null, false, {message: 'Login Incorrect.'});
      }
    });
  }
));

function checkSessionExpiration(session, cb) {
  if (!cb) cb = function() {};
  var default_expiration = 30 * 60 * 1000;// Thirty minutes.
  var session_duration = Date.now().valueOf() - session.session_start.valueOf();
  session.getPerson(function(err, person) {
    if (err) {
      if (session_duration > default_expiration) {
        console.log(util.format(
          'Removing expired (possibly invalid) session %s for user %d',
          session.session_token,
          session.person_id
        ));
        session.remove(function(err) { if (err) { console.log(err); }});
        return cb(true);
      }
    } else if (person) {
      var session_expires = person.session_expires * 60 * 1000;//In minutes
      if (session_duration > session_expires) {
        console.log(util.format(
          'Removing expired session %s for user %s',
          session.session_token,
          session.person.name
        ));
        session.remove(function(err) { if (err) { console.log(err); }});
        return cb(true);
      }
      return cb(false, person);
    } else {
      console.log(util.format(
        'Removing invalid session %s for user %d',
        session.session_token,
        session.person_id
      ));
      session.remove(function(err) { if (err) { console.log(err); }});
      return cb(true);
    }
  });
}

passport.use('remember-me', new RememberMeStrategy(
  function(token, done) {
    // Clear out old sessions
    process.nextTick(function() {
      db_orm.Session.find(function(err, session_list) {
        if (err) {
          console.log('Error getting session list:\n' + util.inspect(err));
        } else {
          session_list.forEach(function(session) {
            checkSessionExpiration(session);
          });
        }
      });
    });

    // Validate the session token
    db_orm.Session.one({session_token: token}, function(err, session) {
      if (err) {
        console.log('No session found\n' + util.inspect(err));
        return done(null, false, { message: 'No Session found' });
      } else if (session == null) {
        console.log('No session found');
        return done(null, false, { message: 'No Session found' });
      } else {
        checkSessionExpiration(session, function(expired, person) {
          if (expired) {
            return done(null, false, { message: 'Session Expired' });
          } else {
            session.save({session_token: null}, function(err) {
              if (err) {
                console.log('Unable to update session\n' + util.inspect(err));
                return done(null, false, { message: 'Unable to update session' });
              } else {
                return done(null, person);
              }
            });
          }
        });
      }
    });
  },
  function(user, done) {
    db_orm.Session.one({person_id: user.id, session_token: null}, function(err, session) {
      if (err) {
        console.log('Unable to initiate session\n' + util.inspect(err));
        return done(null, false, { message: 'Unable to initiate session' });
      } else if (session == null) {
        db_orm.Session.create([{person_id: user.id}], function(err, rows) {
          if (err) {
            console.log('Unable to initiate session\n' + util.inspect(err));
            return done(null, false, { message: 'Unable to initiate session' });
          } else {
            return done(null, rows[0].session_token);
          }
        });
      } else {
        var new_token = session.generateToken();
        session.save({session_token: new_token}, function(err) {
          if (err) {
            console.log('Unable to refresh session\n' + util.inspect(err));
            return done(null, false, { message: 'Unable to refresh session' });
          } else {
            return done(null, new_token);
          }
        });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  //console.log('serialize:' + util.inspect(user));
  done(null, JSON.stringify({id: user.id, system_admin: !!user.system_admin}));
});
passport.deserializeUser(function(user, done) {
  //console.log('deserialize:' + util.inspect(user));
  done(null, JSON.parse(user));
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('Plover-Indy-Girlfriend-Dragon'));
app.use(express.session({
  secret: 'Plover-Indy-Girlfriend-Dragon',
  cookie: { maxAge: 10 * 1000 }, // Refresh the session every ten seconds
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me', {failureFlash: true}));
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', validation.requireLogin, index.index);

// Band
app.get('/band', validation.requireLogin, route_db.getBandTable);
app.post('/band', validation.requireLogin, route_db.postBandTable);
app.put(
  '/band',
  validation.requireLogin,
  validation.requireBandAdmin,
  route_db.putBandTable
);
app.delete(
  '/band',
  validation.requireLogin,
  validation.requireBandAdmin,
  route_db.deleteBandTable
);

// Person
app.get('/person', validation.requireLogin, route_db.getPersonTable);
app.post('/person', validation.requireLogin, route_db.postPersonTable);
app.put(
  '/person',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.putPersonTable
);
app.delete(
  '/person',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.deletePersonTable
);

// Artist
app.get('/artist', validation.requireLogin, route_db.getArtistTable);
app.post('/artist', validation.requireLogin, route_db.postArtistTable);
app.put('/artist', validation.requireLogin, route_db.putArtistTable);
app.delete(
  '/artist',
  validation.requireLogin,
  validation.requireSysAdmin,
  route_db.deleteArtistTable
);

// Song
app.get('/song', validation.requireLogin, route_db.getSongTable);
app.post('/song', validation.requireLogin, route_db.postSongTable);
app.put('/song', validation.requireLogin, route_db.putSongTable);
app.delete(
  '/song',
  validation.requireLogin,
  validation.requireSysAdmin,
  route_db.deleteSongTable
);

// BandMember
app.get('/band_member', validation.requireLogin, route_db.getBandMemberTable);
app.post(
  '/band_member',
  validation.requireSysAdmin,
  route_db.postBandMemberTable
);
app.put(
  '/band_member',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.putBandMemberTable
);
app.delete(
  '/band_member',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.deleteBandMemberTable
);

// BandSong
app.get('/band_song', validation.requireLogin, route_db.getBandSongTable);
app.post('/band_song', validation.requireLogin, route_db.postBandSongTable);
app.put(
  '/band_song',
  validation.requireLogin,
  validation.requireBandAdmin,
  route_db.putBandSongTable
);
app.delete(
  '/band_song',
  validation.requireLogin,
  validation.requireBandAdmin,
  route_db.deleteBandSongTable
);

// SongRating
app.get('/song_rating', validation.requireLogin, route_db.getSongRatingTable);
app.post(
  '/song_rating',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.postSongRatingTable
);
app.put(
  '/song_rating',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.putSongRatingTable
);
app.delete(
  '/song_rating',
  validation.requireLogin,
  validation.requireSelfOrAdmin,
  route_db.deleteSongRatingTable
);

app.get('/request', validation.requireLogin, route_db.getRequest);
app.post('/request/:action', validation.requireLogin, route_db.createRequest);
app.put('/request/:action', validation.requireLogin, route_db.updateRequest);
app.delete('/request', validation.requireLogin, route_db.deleteRequest);

app.get('/plan_lists', validation.requireLogin, rehearsal_plan.getPlanLists);
app.get('/plan', validation.requireLogin, rehearsal_plan.getPlan);
app.post('/plan', validation.requireLogin, rehearsal_plan.postPlan);

// Authentication handlers
app.get('/login', login.login);
app.post('/login',
         passport.authenticate('local', { failureRedirect: '/login',
                                          failureFlash: true }),
         function(req, res, next) {
           var user = bombay_util.getUser(req);
           db_orm.Session.create([{person_id: user.id}], function(err, rows) {
             if (err) {
               console.log(err);
               return res.send(500, err);
             } else {
               res.cookie(
                 'remember_me',
                 rows[0].session_token,
                 { path: '/', httpOnly: true, maxAge: 60 * 60 * 1000 }//Keep the session token one hour
               );
               return next();
             }
           });
         },
         function(req, res) {
           res.redirect('/');
         }
);

// Reports handlers
app.get('/reports', validation.requireLogin, reports.getReports);
app.get('/reports/:band_id/:report', validation.requireLogin, reports.sendReport);

// Encryption handlers
app.get('/encryption', encryption.encryption);
app.get('/logout', function(req, res) {
  //console.log(req.session);
  var user = bombay_util.getUser(req);
  db_orm.Session.one({person_id: user.id}, function(err, session) {
    if (err) {
      console.log(err);
    } else {
      session.remove(function(err) {
        if (err) {
          console.log(util.format(
            'Unable to remove session\n%s\n%s',
            util.inspect(JSON.parse(JSON.stringify(session))),
            util.inspect(err)
          ));
        }
      });
    }
  });
  req.logout();
  res.redirect('/login');
});

// SessionInfo
app.get('/session_info', validation.requireLogin, route_db.getSessionInfo);

// Forms
app.get('/forms/:form_type', function(req, res) {
  var form_name = path.join('forms', req.params.form_type.replace(/\.html$/,''));//XXX
  res.render(form_name);
});

// Ajax Testing

function ajax_test_parser(req, res) {
  var info = {
    format: req.params.format,
    params: req.params || [],
    query: req.query || {},
    body: req.body || {},
    route: req.route,
    path: req.path,
    xhr: req.xhr,
    protocel: req.protocol,
    content_type: req.get('Content-Type'),
    referrer: req.get('Referrer')
  };

  if (req.params.format === 'json') {
    res.json(200, info)
  } else if (req.params.format === 'html') {
    var result = [];
    result.push('<style>div { padding-left: 5px; margin: 5px; border-style: solid; }</style>')
    Object.keys(info).forEach(function(key) {
      result.push('<div class="' + key + '">' + key + ': ');
      var value = info[key];

      if (Array.isArray(value)) {
        value.forEach(function(element, index) {
          result.push('<div class="' + index + '">' + index + ': ' + element + '</div>');
        });
      } else if (typeof(value) === 'object') {
        Object.keys(value).forEach(function(subkey) {
          result.push('<div class="' + subkey + '">' + subkey + ': ');
          result.push(value[subkey]);
          result.push('</div>');
        });
      } else {
        result.push(value);
      }

      result.push('</div>');
    });
    res.set('Content-Type', 'text/html');
    res.send(200, result.join('\n'));
  } else {
    res.set('Content-Type', 'text/plain');
    res.send(200, util.inspect(info));
  }
}

app.get('/ajax_testing/:format', ajax_test_parser);
app.get('/ajax_testing/:format/*', ajax_test_parser);
app.put('/ajax_testing/:format', ajax_test_parser);
app.put('/ajax_testing/:format/*', ajax_test_parser);
app.post('/ajax_testing/:format', ajax_test_parser);
app.post('/ajax_testing/:format/*', ajax_test_parser);
app.delete('/ajax_testing/:format', ajax_test_parser);
app.delete('/ajax_testing/:format/*', ajax_test_parser);


//console.log(app.routes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
