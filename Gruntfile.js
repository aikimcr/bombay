module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: './public/javascripts/lib'
        }
      }
    },
    bower_concat: {
      prod: {
        dest: './public/javascripts/lib/bower_lib.js',
        cssDest: './public/stylesheets/bower_lib.css',
        include: [
          'knockout',
          'pidcrypt',
          'q'
        ],
        mainFiles: {
          pidcrypt: [
            'pidcrypt.js',
            'pidcrypt_util.js',
            'asn1.js',
            'jsbn.js',
            'rng.js',
            'prng4.js',
            'rsa.js'
          ]
        }
      },
      dev: {
        dest: './public/test/lib/bower_lib.js',
        cssDest: './public/test/lib/bower_lib.css',
        include: [
          'chai',
          'mocha',
          'sinon',
          'sinon-chai'
        ],
        mainFiles: {
          sinon: 'sinon.js',
          'sinon-chai': 'sinon-chai.js'
        }
      }
    },
    'bower-install-simple': {
      prod: {
        options: {
          production: true
        }
      },
      dev: {
        options: {
          production: false
        }
      }
    },
    mkdir: {
      crypto: {
        mode: 0700,
        create: ['crypto']
      }
    },
    shell: {
      crypto_key: 'openssl genrsa -out ./crypto/rsa_private.pem',
      options: {
        env: {
          PATH: '/bin:/usr/bin:/usr/local/bin'
        }
      }
    },
    database: {
      bombay: {
        db_name: './bombay.db',
        schema: './sql/schema.sql'
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('rsa_files', function() {
    var done = this.async();
    var path = 'crypto';

    var key_file = path + '/rsa_private.pem';
    var pub_file = path + '/rsa_public.pem';

    [key_file, pub_file].forEach(function(pem_file) {
      if (grunt.file.exists(pem_file)) {
        grunt.file.copy(pem_file, pem_file + '.old');
      }
    });

    grunt.util.spawn({
      cmd: 'openssl',
      args: ['genrsa', '-out', key_file]
    }, function(err, result, code) {
      if (err) {
        grunt.fail.fatal('Got ' + err.toString() + ' creating key file');
      } else if (code === 0) {
          // grunt.log.writeln(result.toString());
          grunt.util.spawn({
            cmd: 'openssl',
            args: ['rsa', '-in', key_file, '-pubout', '-out', pub_file],
          }, function(err, result, code) {
            if (err) {
              grunt.fail.fatal('Got ' + err.toString() + ' creating public key');
            } else if (code === 0) {
              //grunt.log.writeln(result.toString());
              done();
            } else {
              grunt.fail.fatal(result.toString());
            }
          });
      } else {
        grunt.fail.fatal(result.toString());
      }
    });
  });

  grunt.registerTask('crypto', function() {
    var path = 'crypto';

    if (!grunt.file.exists(path)) {
      grunt.file.mkdir(path, 0700);

      if (!grunt.file.exists(path)) {
        grunt.fail.fatal('Failed to create "' + path + '"');
      }

      grunt.task.run('crypto_files');
    }

    if (!grunt.file.isDir(path)) {
      grunt.fail.fatal('"' + path + '" is not a directory');
    }

  });

  grunt.registerMultiTask('database', 'Create the database', function() {
    var done = this.async();
    grunt.log.writeln(this.target + ': ' + this.data.db_name + ', ' + this.data.schema);

    if (!grunt.file.exists(this.data.db_name)) {
      grunt.file.write(this.data.db_name, '');
      grunt.util.spawn({
        cmd: '/bin/chmod',
        args: ['0700', this.data.db_name]
      }, function(err, result, code) {
        if (err) {
          grunt.fail.fatal('Got ' + err.toString() + ' setting permissions on ' + this.data.db_name);
        } else if (code === 0) {
          grunt.util.spawn({
            cmd: 'sqlite3',
            args: [this.data.db_name, '.read ' + this.data.schema]
          }, function(err, result, code) {
            if (err) {
              grunt.fail.fatal('Got ' + err.toString() + ' building the database');
            } else if (code === 0) {
              done();
            } else {
              grunt.fail.fatal(result.toString());
            }
          }.bind(this));
        } else {
          grunt.fail.fatal(result.toString());
        }
      }.bind(this));
    }
  });

  grunt.registerTask('updatedb', function() {
    var done = this.async();
    grunt.util.spawn({
      cmd: './bin/update_db.js',
    }, function(err, result, code) {
      if (err) {
        grunt.fail.fatal('Got ' + err.toString() + ' updating the database schema');
      } else if (code === 0) {
        done();
      } else {
        grunt.fail.fatal(result.toString());
      }
    });
  });

  grunt.registerTask('special_dirs', function() {
    var dir_list = ['db_backup', 'reports'];

    dir_list.forEach(function(dir) {
      if (!grunt.file.exists(dir)) {
        grunt.file.mkdir(dir, 0700);
      } else if (!grunt.file.isDir(dir)) {
        grunt.fail.fatal(dir + ' is not directory');
      }
    });
  });

  grunt.registerTask('clean', function() {
    var files = [
      'public/javascripts/lib/bower_lib.js',
      'public/test/lib/bower_lib.js',
      'reports'
    ];

    files.forEach(function(file) {
      if (grunt.file.exists(file)) {
        grunt.file.delete(file);
      }
    });
  });

  grunt.registerTask('clean_bower', function() {
    grunt.task.run('clean');
    grunt.file.delete('bower_components');
  });

  grunt.registerTask('bootstrap', function() {
    grunt.file.delete('bombay.db');
    grunt.task.run('database:bombay');
    grunt.task.run('updatedb');
  });

  // Dangerous, but necessary
  grunt.registerTask('clobber', function() {
    grunt.task.run('clean_bower');

    ['bombay.db', 'db_backup'].forEach(function(path) {
      if (grunt.file.exists(path)) {
        grunt.file.delete(path);
      }
    });
  });

  grunt.registerTask('prodlib', ['bower-install-simple:prod']);
  grunt.registerTask('devlib', ['bower-install-simple:dev']);
  grunt.registerTask('prodjs', ['bower_concat:prod']);
  grunt.registerTask('devjs', ['bower_concat:dev']);

  grunt.registerTask('prod_build', ['prodlib', 'prodjs']);
  grunt.registerTask('dev_build', ['devlib', 'devjs']);

  grunt.registerTask('prod', ['prod_build', 'crypto', 'database:bombay', 'updatedb', 'special_dirs']);
  grunt.registerTask('dev', ['prod', 'dev_build']);

  // Default task(s).
  grunt.registerTask('default', ['prod']);
};
