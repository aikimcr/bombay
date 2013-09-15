
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , sqlite3 = require('sqlite3')
  , db = require('./routes/db')
  , login = require('./routes/login')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash')
  , rack = require('asset-rack');

passport.use(new LocalStrategy(
  function(username, password, done) {
    //console.log(username + ', ' + password);

    db.getPersonByName(username, function(person) {
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

app.get('/', requireLogin, routes.index);

// member_band handlers
app.get('/member_bands.json', requireLogin, db.memberBands);
app.post('/member_bands.json', requireLogin, db.createBand);
app.delete('/member_bands.json', requireLogin, db.removeBand);

// band_member handlers
app.get('/band_members.json', requireLogin, db.bandPersons);
app.post('/band_members.json', requireLogin, db.addMember);
app.post('/persons.json', requireLogin, db.createPerson);

// person_profile handlers
app.get('/person_profile.json', requireLogin, db.personProfile);
app.post('/person_profile.json', requireLogin, db.updatePersonProfile);

// artist handlers
app.get('/artists.json', requireLogin, db.artists);
app.post('/artists.json', requireLogin, db.createArtist);

// song handlers
app.get('/songs.json', requireLogin, db.bandSongs);
app.post('/songs.json', requireLogin, db.addSong);
app.post('/song_master.json', requireLogin, db.createSong);
app.post('/song_rating.json', requireLogin, db.updateSongRating);
app.post('/song_status.json', requireLogin, db.updateSongStatus);

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
