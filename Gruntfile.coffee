'use strict';

path = require('path');

module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  require('time-grunt')(grunt)

  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-env'
  grunt.loadNpmTasks 'grunt-express-server'
  grunt.loadNpmTasks 'grunt-preprocess'
  grunt.loadNpmTasks 'grunt-spritesmith'

  grunt.option 'env', (grunt.option 'env' || 'dev')

  yeomanConfig =
    app: 'app'
    dist: 'dist'
    tmp: '.tmp'
    routes: 'routes'
    bower_components: '.bower_components'

  try
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app
  catch e

  grunt.initConfig
    env:
      dev:
        NODE_ENV : 'dev'
      prod:
        NODE_ENV : 'prod'

    yeoman: yeomanConfig

    express:
      options:
        port: 8080
      fitspector:
        options:
          script: '<%= yeoman.tmp %>/server.js'

    watch:
      options:
        livereload: true
      less:
        files: '<%= yeoman.app %>/styles/*.less'
        tasks: ['copy:less', 'less']
      coffee:
        files: '<%= yeoman.app %>/scripts/{,*/}*.coffee'
        tasks: ['copy:coffee', 'coffee:app']
      html:
        files: '<%= yeoman.app %>/**/*.html'
        tasks: ['copy:html', 'preprocess']
      express:
        files: [
          '<%= yeoman.tmp %>/server.js'
          '<%= yeoman.tmp %>/routes/{,*/}*.js'
        ]
        tasks: ['express:fitspector']
        options:
          nospawn: true

    autoprefixer:
      options: ['last 1 version']
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/styles/'
          src: '{,*/}*.css'
          dest: '<%= yeoman.tmp %>/styles/'
        ]

    open:
      server:
        url: 'http://localhost:<%= connect.options.port %>'

    clean:
      develop:
        files: [
          src: [
            '<%= yeoman.tmp %>'
          ]
        ]
      dist:
        files: [
          dot: true
          src: [
            '<%= yeoman.tmp %>'
            '<%= yeoman.dist %>'
            '!<%= yeoman.dist %>/.git*'
          ]
        ]

    coffee:
      app:
        files: [
          expand: true,
          cwd: '<%= yeoman.tmp %>',
          src: '**/*.coffee',
          dest: '<%= yeoman.tmp %>',
          ext: '.js'
          options:
            sourceMap: true
        ]
      test:
        files: [
          expand: true
          cwd: 'test/spec'
          src: '{,*/}*.coffee'
          dest: '<%= yeoman.tmp %>/spec'
          ext: '.js'
        ]

    less:
      app:
        files:
          '<%= yeoman.tmp %>/<%= yeoman.app %>/styles/main.css': '<%= yeoman.tmp %>/<%= yeoman.app %>/styles/main.less'

    rev:
      dist:
        files:
          src: [
            '<%= yeoman.dist %>/<%= yeoman.app %>/scripts/{,*/}*.js'
            '<%= yeoman.dist %>/<%= yeoman.app %>/styles/{,*/}*.css'
            '<%= yeoman.dist %>/<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            '<%= yeoman.dist %>/<%= yeoman.app %>/styles/fonts/*'
          ]

    useminPrepare:
      html: '<%= yeoman.tmp %>/<%= yeoman.app %>/index.html'
      options:
        dest: '<%= yeoman.dist %>/<%= yeoman.app %>'

    usemin:
      html: ['<%= yeoman.dist %>/<%= yeoman.app %>/{,views,views/directives}/*.html']
      css: ['<%= yeoman.dist %>/<%= yeoman.app %>/styles/*.css']
      options:
        dirs: ['<%= yeoman.dist %>/<%= yeoman.app %>']

    imagemin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.app %>/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: '<%= yeoman.dist %>/<%= yeoman.app %>/images'
        ]

    svgmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.app %>/images'
          src: '{,*/}*.svg'
          dest: '<%= yeoman.dist %>/<%= yeoman.app %>/images'
        ]

    htmlmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.app %>/'
          src: ['**/*.html']
          dest: '<%= yeoman.dist %>/<%= yeoman.app %>/'
        ]

    preprocess:
      all:
        src : [ '<%= yeoman.tmp %>/<%= yeoman.app %>/views/topbar.html' ]
        options:
          inline: true,
          context:
            DEBUG: false

    sprite:
      sportIcons:
        src: '<%= yeoman.app %>/images/sport-icons/*'
        destImg: '<%= yeoman.tmp %>/<%= yeoman.app %>/images/sport-icons.png'
        destCSS: '<%= yeoman.tmp %>/<%= yeoman.app %>/styles/sport-icons.css'
        algorithm: 'binary-tree'
        cssOpts:
          cssClass: (item) -> '.sport-icon.sport-' + item.name

    copy:
      less:
        cwd: '<%= yeoman.app %>/styles'
        src: '*.less'
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>/styles'
        expand: true
      fonts:
        cwd: '<%= yeoman.app %>/fonts'
        src: '*'
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>/fonts'
        expand: true
      html:
        cwd: '<%= yeoman.app %>'
        src: '**/*.html'
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>'
        expand: true
      coffee:
        cwd: '<%= yeoman.app %>/scripts'
        src: '**/*.coffee'
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>/scripts'
        expand: true
      img:
        cwd: '<%= yeoman.app %>/images'
        src: ['**/*', '!sport-icons/*']
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>/images'
        expand: true
      routes:
        cwd: '<%= yeoman.routes %>'
        src: '**'
        dest: '<%= yeoman.tmp %>/<%= yeoman.routes %>'
        expand: true
      libs:
        cwd: '<%= yeoman.bower_components %>/'
        src: [
          'jquery/jquery.js'
          'angular/angular.js'
          'angular-animate/angular-animate.js'
          'angular-route/angular-route.js'
          'angular-resource/angular-resource.js'
          'bootstrap/js/dropdown.js'
          'bootstrap/js/tooltip.js'
          'd3/d3.js'
          'momentjs/moment.js'
          'underscore/underscore.js'

          'bootstrap/dist/fonts/*'
          'bootstrap/dist/css/bootstrap.css'
          'bootstrap/dist/css/bootstrap-theme.css'
        ]
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>/libs/'
        expand: true
      server:
        src: [
          'server.coffee'
          'Procfile'
          'package.json'
        ]
        dest: '<%= yeoman.tmp %>'
        expand: true
      # TODO(koper) This is ugly; actually I want two configs: all of the above + dist; how do I do that with Grunt?
      # Some distribution resources that are not processed by usemin.
      dist:
        cwd: '<%= yeoman.tmp %>'
        src: [
          'server.js'
          'package.json'
          'Procfile'
          '<%= yeoman.routes %>/*.js'
          '<%= yeoman.app %>/fonts/*'
        ]
        dest: '<%= yeoman.dist %>'
        expand: true

    karma:
      unit:
        configFile: 'karma.conf.js'
        singleRun: true

    cdnify:
      dist:
        html: ['<%= yeoman.dist %>/*.html']

    ngmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.dist %>/scripts'
          src: '*.js'
          dest: '<%= yeoman.dist %>/scripts'
        ]

    concurrent:
      dev: [
        'less'
        'preprocess'
        'coffee:app'
        'sprite'
      ]
      test: [
        'coffee'
      ]
      dist: [
        'imagemin'
        'svgmin'
        'htmlmin'
        'less'
      ]

  grunt.registerTask 'server', [
    'env:dev'
    'copy'
    'concurrent:dev'
    'express:fitspector'
    'watch'
  ];

  grunt.registerTask 'build', [
    'env:prod'
    'clean:dist'
    'copy'
    'concurrent:dev'
    'useminPrepare'
    'copy:dist'
    'concurrent:dist'
    'autoprefixer'
    'concat'
    'cdnify'
    'ngmin'
    'cssmin'
    'uglify'
    'rev'
    'usemin'
  ];

  grunt.registerTask 'test', [
    'clean:server'
    'concurrent:test'
    'autoprefixer'
    'connect:test'
    'karma'
  ];

  grunt.registerTask 'default', [
    'test'
    'build'
  ];

