
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , db = require('lib/db')
  , index = require('routes/index')
  , route_db = require('routes/db')
  , login = require('routes/login')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash')
  , rack = require('asset-rack');

passport.use(new LocalStrategy(
  function(username, password, done) {
    var dbh = new db.Handle();
    //console.log(username + ', ' + password);

    dbh.person().getByUsername(username, function(result) {
      var person = result.person;
      if (person) {
        if (username == person.name && password == person.password) {
          console.log(username + ' logged in');
          return done(null, person);
        }
      }
      console.log('Failed login for ' + username);
      return done(null, false, { message: 'Login Incorrect.'});
    });
  }
));

passport.serializeUser(function(user, done) {
  //console.log(user);
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  //console.log(id);
  done(null, {'id': id});
});

function requireLogin(req, res, next) {
  //console.log(req.session);
  if (req.session.passport.user) {
    //console.log('User found');
    next();
  } else {
    //console.log('No User Found - Relogin');
    res.redirect('/login');
  }
}

var jade_asset = new rack.JadeAsset({
  url: '/templates.js',
  dirname: './client_views',
});

db.setDbPath();

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
app.use(jade_asset);
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', requireLogin, index.index);

// Person Table
app.get('/person', requireLogin, route_db.getPerson);
app.post('/person', requireLogin, route_db.createPerson);
app.put('/person', requireLogin, route_db.updatePerson);
app.delete('/person', requireLogin, route_db.removePerson);

// Person Views
app.get('/person_band', requireLogin, route_db.bandInfoForPerson);
app.post('/person_band', requireLogin, route_db.addBandMember);
app.delete('/person_band', requireLogin, route_db.removeBandMember);

// Band Table
app.post('/band', requireLogin, route_db.createBand);
app.delete('/band', requireLogin, route_db.removeBand);

// Band Members
app.get('/band_member', requireLogin, route_db.bandMemberInfo);
app.post('/band_member', requireLogin, route_db.addBandMember);
app.put('/band_member', requireLogin, route_db.updateBandMember);
app.delete('/band_member', requireLogin, route_db.removeBandMember);

// Artist Table
app.get('/artist', requireLogin, route_db.artistInfo);
app.post('/artist', requireLogin, route_db.createArtist);
app.delete('/artist', requireLogin, route_db.removeArtist);

// Song Table
app.post('/song', requireLogin, route_db.createSong);
app.post('/song', requireLogin, route_db.removeSong);

// Band Song Table
app.get('/band_song', requireLogin, route_db.bandSongInfo);
app.post('/band_song', requireLogin, route_db.addBandSong);
app.delete('/band_song', requireLogin, route_db.removeBandSong);
app.put('/band_song', requireLogin, route_db.updateBandSong);

// Song Rating Table
app.put('/song_rating', requireLogin, route_db.updateSongRating)

// Authentication handlers
app.get('/login', login.login);
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login',
                                                    failureFlash: true })
);

app.get('/logout', function(req, res) {
  //console.log(req.session);
  req.logout();
  res.redirect('/login');
});

//console.log(app.routes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
