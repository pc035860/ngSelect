module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true
      },
      beforeuglify: ['<%= pkg.name %>.js'],
      gruntfile: ['Gruntfile.js']
    },
    uglify: {
      build: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      },
      options: {
        mangle: true,
        compress: true,
        banner: 
          '/*! <%= pkg.name %>\n' + 
          'version: <%= pkg.version %>\n' +
          'build date: <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
          'author: <%= pkg.author %>\n' + 
          '<%= pkg.repository.url %> */\n'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint:gruntfile', 'jshint:beforeuglify', 'uglify']);
};

