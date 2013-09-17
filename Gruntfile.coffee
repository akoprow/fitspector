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
          'server.js'
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

    jshint:
      options:
        jshintrc: '.jshintrc'
      all: [
        'Gruntfile.js'
        'server.js'
        '<%= yeoman.routes %>/{,*/}*.js'
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
            '<%= yeoman.dist %>/scripts/{,*/}*.js'
            '<%= yeoman.dist %>/styles/{,*/}*.css'
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            '<%= yeoman.dist %>/styles/fonts/*'
          ]

    useminPrepare:
      html: '<%= yeoman.app %>/index.html'
      options:
        dest: '<%= yeoman.dist %>'

    usemin:
      html: ['<%= yeoman.dist %>/{,*/}*.html']
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
      options:
        dirs: ['<%= yeoman.dist %>']

    imagemin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.app %>/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: '<%= yeoman.dist %>/images'
        ]

    svgmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.app %>/images'
          src: '{,*/}*.svg'
          dest: '<%= yeoman.dist %>/images'
        ]

    htmlmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.app %>'
          src: ['*.html', 'views/*.html']
          dest: '<%= yeoman.dist %>'
        ]

    preprocess:
      all:
        src : [ '<%= yeoman.tmp %>/views/topbar.html' ]
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
          cssClass: (item) -> '.sport-' + item.name

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
        cwd: '<%= yeoman.app %>'
        src: '**/*.coffee'
        dest: '<%= yeoman.tmp %>/<%= yeoman.app %>'
        expand: true
      app:
        files: [
          cwd: '<%= yeoman.app %>'
          src: [
            '**'
            '!images/sport-icons/**'
          ]
          dest: '<%= yeoman.tmp %>/<%= yeoman.app %>'
          expand: true
        ,
          cwd: '<%= yeoman.routes %>'
          src: '**'
          dest: '<%= yeoman.tmp %>/<%= yeoman.routes %>'
          expand: true
        ,
          cwd: '<%= yeoman.bower_components %>/'
          src: [
            'jquery/jquery.js'
            'angular/angular.js'
            'angular-route/angular-route.js'
            'angular-resource/angular-resource.js'
            'bootstrap/js/dropdown.js'
            'bootstrap/js/tooltip.js'
            'd3/d3.js'
            'momentjs/moment.js'

            'bootstrap/dist/fonts/*'
            'bootstrap/dist/css/bootstrap.css'
            'bootstrap/dist/css/bootstrap-theme.css'
          ]
          dest: '<%= yeoman.tmp %>/libs/'
          expand: true
        ,
          '<%= yeoman.tmp %>/server.js': 'server.js'
        ]

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

    uglify:
      dist:
        files:
          '<%= yeoman.dist %>/scripts/scripts.js': '<%= yeoman.dist %>/scripts/scripts.js'

    concurrent:
      dev: [
        'less'
        'preprocess:all'
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
    'jshint'
    'express:fitspector'
    'watch'
  ];

  grunt.registerTask 'build', [
    'env:prod'
    'clean:dist'
    'copy'
    'preprocess:all'
    'useminPrepare'
    'concurrent'
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
    'jshint'
    'test'
    'build'
  ];

