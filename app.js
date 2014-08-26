
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
var validation = require('routes/validation');

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

passport.use('remember-me', new RememberMeStrategy(
  function(token, done) {
    db_orm.Session.one({session_token: token}, function(err, session) {
      if (err) {
        return done(null, false, { message: 'No Session found' });
      } else if (session == null) {
        return done(null, false, { message: 'No Session found' });
      } else {
        session.save({session_token: null}, function(err) {
          if (err) {
            console.log(err);
            return done(null, false, { message: 'Unable to update session' });
          } else {
            session.getPerson(function(err, person) {
              if (err) {
                console.log(err);
                return done(null, false, { message: 'Unable to get person' });
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
    db_orm.Session.one({person_id: user.id}, function(err, session) {
      if (err) {
        console.log(err);
        return done(null, false, { message: 'Unable to initiate session' });
      } else if (session == null) {
        db_orm.Session.create([{person_id: user.id}], function(err, rows) {
          if (err) {
            console.log(err);
            return done(null, false, { message: 'Unable to initiate session' });
          } else {
            return done(null, rows[0].session_token);
          }
        });
      } else {
        var new_token = session.generateToken();
        session.save({session_token: new_token}, function(err) {
          if (err) {
            console.log(err);
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
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // Set the cookie to thirty days.
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
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
                 { path: '/', httpOnly: true, maxAge: 120000 }
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
    session.remove(function(err) {
      if (err) {
        console.log(util.format(
          'Unable to remove session\n%s\n%s',
          util.inspect(JSON.parse(JSON.stringify(session))),
          util.inspect(err)
        ));
      }
    });
  });
  req.logout();
  res.redirect('/login');
});

// SessionInfo
app.get('/session_info', validation.requireLogin, route_db.getSessionInfo);

//console.log(app.routes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
