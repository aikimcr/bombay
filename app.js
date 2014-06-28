
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var db_orm = require('lib/db_orm');
var util = require('lib/util');
var index = require('routes/index');
var route_db = require('routes/db');
var encryption = require('routes/encryption');
var reports = require('routes/reports');
var login = require('routes/login');
var base64_decode = require('base64').decode;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var node_util = require('util');
var validation = require('routes/validation');

passport.use(new LocalStrategy(
  function(username, password, done) {
    password = decodeURIComponent(password);
    // console.log(username + ', ' + password);

    db_orm.Person.one({name: username}, function(err, person) {
      if (err) {
        console.log('Failed login for ' + username + util.inspect(err));
        return done(null, false, { message: 'Login Incorrect.'});
      } else if (person) {
        var pem = util.get_pem_file('crypto/rsa_private.pem');
        //console.log(pem);
        var decrypt_password = password;
        var decrypt_person = person.password;

        // console.log(decrypt_person + ', ' + decrypt_password);
        try {
          decrypt_password = base64_decode(util.decrypt(pem, password));
          decrypt_person = util.decrypt(pem, person.password);
        } catch(e) {
          console.log(e);
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

passport.serializeUser(function(user, done) {
  //console.log(node_util.inspect(user));
  done(null, JSON.stringify({id: user.id, system_admin: !!user.system_admin}));
});
passport.deserializeUser(function(user, done) {
  //console.log(user);
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
    maxAge: 3600000
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
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
  validation.requireLogin,
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
app.post('/request', validation.requireLogin, route_db.createRequest);
app.put('/request', validation.requireLogin, route_db.updateRequest);
app.delete('/request', validation.requireLogin, route_db.deleteRequest);

// Authentication handlers
app.get('/login', login.login);
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login',
                                                    failureFlash: true })
);

// Reports handlers
app.get('/reports', validation.requireLogin, reports.getReports);
app.get('/reports/:band_id/:report', validation.requireLogin, reports.sendReport);

// Encryption handlers
app.get('/encryption', encryption.encryption);
app.get('/logout', function(req, res) {
  //console.log(req.session);
  req.logout();
  res.redirect('/login');
});

// SessionInfo
app.get('/session_info', validation.requireLogin, route_db.getSessionInfo);

//console.log(app.routes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
