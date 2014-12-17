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
      public: {
        dest: './public/javascripts/lib/bower.js',
        cssDest: './public/stylesheets/bower.css',
        include: [
          'knockout',
          'pidcrypt'
        ]
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
    }
  });

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-bower-install-simple');


  grunt.registerTask('prodlib', ['bower-install-simple:prod']);
  grunt.registerTask('devlib', ['bower-install-simple:dev']);

  // Default task(s).
  grunt.registerTask('default', ['bower']);

};
