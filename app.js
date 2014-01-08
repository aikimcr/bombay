
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , db = require('lib/db')
  , util = require('lib/util')
  , index = require('routes/index')
  , route_db = require('routes/db')
  , encryption = require('routes/encryption')
  , login = require('routes/login')
  , base64_decode = require('base64').decode
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash');

passport.use(new LocalStrategy(
  function(username, password, done) {
    var dbh = new db.Handle();
    console.log(username + ', ' + password);

    dbh.person().getAllWithArgs({
      fields: ['id', 'name', 'password'],
      where: {name: username}
    }, function(result) {
      var person = result.all_persons[0];
      if (person) {
        var pem = util.get_pem_file('crypto/rsa_private.pem');
        console.log(pem);
        var decrypt_password = base64_decode(util.decrypt(pem, password));
        var decrypt_person = util.decrypt(pem, person.password);
        console.log(password + ', ' + decrypt_password);
        if (username == person.name && decrypt_password == decrypt_person) {
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
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', requireLogin, index.index);

// Band
app.get('/band', requireLogin, route_db.getBandTable);
app.post('/band', requireLogin, route_db.postBandTable);
app.put('/band', requireLogin, route_db.putBandTable);
app.delete('/band', requireLogin, route_db.deleteBandTable);

// Person
app.get('/person', requireLogin, route_db.getPersonTable);
app.post('/person', requireLogin, route_db.postPersonTable);
app.put('/person', requireLogin, route_db.putPersonTable);
app.delete('/person', requireLogin, route_db.deletePersonTable);

// Artist
app.get('/artist', requireLogin, route_db.getArtistTable);
app.post('/artist', requireLogin, route_db.postArtistTable);
app.put('/artist', requireLogin, route_db.putArtistTable);
app.delete('/artist', requireLogin, route_db.deleteArtistTable);

// Song
app.get('/song', requireLogin, route_db.getSongTable);
app.post('/song', requireLogin, route_db.postSongTable);
app.put('/song', requireLogin, route_db.putSongTable);
app.delete('/song', requireLogin, route_db.deleteSongTable);

// BandMember
app.get('/band_member', requireLogin, route_db.getBandMemberTable);
app.post('/band_member', requireLogin, route_db.postBandMemberTable);
app.put('/band_member', requireLogin, route_db.putBandMemberTable);
app.delete('/band_member', requireLogin, route_db.deleteBandMemberTable);

// BandSong
app.get('/band_song', requireLogin, route_db.getBandSongTable);
app.post('/band_song', requireLogin, route_db.postBandSongTable);
app.put('/band_song', requireLogin, route_db.putBandSongTable);
app.delete('/band_song', requireLogin, route_db.deleteBandSongTable);

// SongRating
app.get('/song_rating', requireLogin, route_db.getSongRatingTable);
app.post('/song_rating', requireLogin, route_db.postSongRatingTable);
app.put('/song_rating', requireLogin, route_db.putSongRatingTable);
app.delete('/song_rating', requireLogin, route_db.deleteSongRatingTable);

// Authentication handlers
app.get('/login', login.login);
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login',
                                                    failureFlash: true })
);

// Encryption handlers
app.get('/encryption', encryption.encryption);
app.get('/logout', function(req, res) {
  //console.log(req.session);
  req.logout();
  res.redirect('/login');
});

// SessionInfo
app.get('/session_info', requireLogin, route_db.getSessionInfo);

//console.log(app.routes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
