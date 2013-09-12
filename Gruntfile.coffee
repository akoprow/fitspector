'use strict';

path = require('path');

module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  require('time-grunt')(grunt)

  grunt.loadNpmTasks 'grunt-env'
  grunt.loadNpmTasks 'grunt-express-server'
  grunt.loadNpmTasks 'grunt-preprocess'

  grunt.option 'env', (grunt.option 'env' || 'dev')

  yeomanConfig =
    app: 'app',
    dist: 'dist'

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
          script: path.resolve __dirname, 'server.js'

    watch:
      options:
        livereload: true
      coffee:
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee']
        tasks: ['coffee:develop']
      express:
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js']
        tasks: ['express:fitspector']
        options:
          nospawn: true
      server:
        files: ['routes/{,*/}*.js']
        tasks: ['express:fitspector']
        options:
          nospawn: true

    autoprefixer:
      options: ['last 1 version'],
      dist:
        files: [
          expand: true
          cwd: '.tmp/styles/'
          src: '{,*/}*.css'
          dest: '.tmp/styles/'
        ]

    open:
      server:
        url: 'http://localhost:<%= connect.options.port %>'

    clean:
      develop:
        files: [
          src: [
            '<%= yeoman.app %>/scripts/{,*/}*.js',
            '<%= yeoman.app %>/scripts/{,*/}*.js.map'
          ]
        ]
      dist:
        files: [
          dot: true
          src: [
            '.tmp'
            '<%= yeoman.dist %>/*'
            '!<%= yeoman.dist %>/.git*'
          ]
        ]
      server: '.tmp'

    jshint:
      options:
        jshintrc: '.jshintrc'
      all: [
        'Gruntfile.js'
        'server.js'
        'routes/{,*/}*.js'
      ]

    coffee:
      options:
        sourceMap: true,
        sourceRoot: ''
      develop:
        files: [
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '{,*/}*.coffee',
          dest: '<%= yeoman.app %>/scripts',
          ext: '.js'
        ]
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.app %>/scripts'
          src: '{,*/}*.coffee'
          dest: '.tmp/scripts'
          ext: '.js'
        ]
      test:
        files: [
          expand: true
          cwd: 'test/spec'
          src: '{,*/}*.coffee'
          dest: '.tmp/spec'
          ext: '.js'
        ]

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
        src : '<%= yeoman.app %>/views/topbar.preprocess.html'
        dest : '<%= yeoman.app %>/views/topbar.html'

    copy:
      dist:
        files: [
          expand: true
          dot: true
          cwd: '<%= yeoman.app %>'
          dest: '<%= yeoman.dist %>'
          src: [
            '*.{ico,png,txt}'
            '.htaccess'
            'bower_components/**/*'
            'images/{,*/}*.{gif,webp}'
            'styles/fonts/*'
            '!*.preprocess.*'
          ]
        ,
          expand: true
          cwd: '.tmp/images'
          dest: '<%= yeoman.dist %>/images'
          src: [
            'generated/*'
          ]
        ]
      styles:
        expand: true
        cwd: '<%= yeoman.app %>/styles'
        dest: '.tmp/styles/'
        src: '{,*/}*.css'

    concurrent:
      server: [
        'coffee:dist',
        'copy:styles'
      ]
      test: [
        'coffee',
        'copy:styles'
      ]
      dist: [
        'coffee',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
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
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]

  grunt.registerTask 'server', [
    'env:dev',
    'preprocess:all',
    'coffee:develop',
    'jshint',
    'express:fitspector',
    'watch'
  ];

  grunt.registerTask 'test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ];

  grunt.registerTask 'build', [
    'env:prod',
    'clean:dist',
    'preprocess:all',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ];

  grunt.registerTask 'default', [
    'jshint',
    'test',
    'build'
  ];

