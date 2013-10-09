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
    dist: 'dist'
    tmp: '.tmp'
    client: 'client'
    server: 'server'
    bower_components: '.bower_components'

  try
    yeomanConfig.client = require('./bower.json').clientPath || yeomanConfig.client
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
        files: '<%= yeoman.client %>/styles/*.less'
        tasks: ['copy:less', 'less']
      coffee:
        files: '<%= yeoman.client %>/scripts/{,*/}*.coffee'
        tasks: ['copy:coffee', 'coffee:all']
      html:
        files: '<%= yeoman.client %>/**/*.html'
        tasks: ['copy:html', 'preprocess']
      express:
        files: [
          '<%= yeoman.tmp %>/server.js'
          '<%= yeoman.tmp %>/<%= yeoman.server %>/{,*/}*.js'
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
      all:
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
      client:
        files:
          '<%= yeoman.tmp %>/<%= yeoman.client %>/styles/main.css': '<%= yeoman.tmp %>/<%= yeoman.client %>/styles/main.less'

    rev:
      dist:
        files:
          src: [
            '<%= yeoman.dist %>/<%= yeoman.client %>/scripts/{,*/}*.js'
            '<%= yeoman.dist %>/<%= yeoman.client %>/styles/{,*/}*.css'
# Temporarily we need to give up image revisioning (is it important?) because we cannot easily post-process directives
# that are concatenated by ngtemplates task.  If we decide we want to revision images it may be worth looking into:
# https://github.com/wmluke/grunt-inline-angular-templates.
#            '<%= yeoman.dist %>/<%= yeoman.client %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            '<%= yeoman.dist %>/<%= yeoman.client %>/styles/fonts/*'
          ]

    useminPrepare:
      html: '<%= yeoman.tmp %>/<%= yeoman.client %>/index.html'
      options:
        dest: '<%= yeoman.dist %>/<%= yeoman.client %>'

    usemin:
      html: ['<%= yeoman.dist %>/<%= yeoman.client %>/*.html']
      css: ['<%= yeoman.dist %>/<%= yeoman.client %>/styles/*.css']
      options:
        dirs: ['<%= yeoman.dist %>/<%= yeoman.client %>']

    imagemin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: '<%= yeoman.dist %>/<%= yeoman.client %>/images'
        ]

    svgmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>/images'
          src: '{,*/}*.svg'
          dest: '<%= yeoman.dist %>/<%= yeoman.client %>/images'
        ]

    htmlmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>/'
          src: ['*.html']
          dest: '<%= yeoman.dist %>/<%= yeoman.client %>/'
        ]

    preprocess:
      all:
        src: []
        options:
          inline: true,
          context:
            DEBUG: false

    sprite:
      sportIcons:
        src: '<%= yeoman.client %>/images/sport-icons/*'
        destImg: '<%= yeoman.tmp %>/<%= yeoman.client %>/images/sport-icons.png'
        destCSS: '<%= yeoman.tmp %>/<%= yeoman.client %>/styles/sport-icons.css'
        algorithm: 'binary-tree'
        cssOpts:
          cssClass: (item) -> '.sport-icon.sport-' + item.name

    copy:
      less:
        cwd: '<%= yeoman.client %>/styles'
        src: '*.less'
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/styles'
        expand: true
      fonts:
        cwd: '<%= yeoman.client %>/fonts'
        src: '*'
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/fonts'
        expand: true
      html:
        cwd: '<%= yeoman.client %>'
        src: '**/*.html'
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>'
        expand: true
      coffee:
        cwd: '<%= yeoman.client %>/scripts'
        src: '**/*.coffee'
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/scripts'
        expand: true
      img:
        cwd: '<%= yeoman.client %>/images'
        src: ['**/*', '!sport-icons/*']
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/images'
        expand: true
      server:
        cwd: '<%= yeoman.server %>'
        src: '**'
        dest: '<%= yeoman.tmp %>/<%= yeoman.server %>'
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
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/libs/'
        expand: true
      toplevel:
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
          '<%= yeoman.server %>/*.js'
          '<%= yeoman.client %>/fonts/*'
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

    ngtemplates:
      fitspector:
        cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>'
        src: 'views/**/*.html'
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/scripts/template.js'
        options:
          concat: '<%= yeoman.dist%>/<%= yeoman.client %>/scripts/scripts.js'
          htmlmin:
            collapseBooleanAttributes: true
            collapseWhitespace: true
            removeAttributeQuotes: false  # Was giving me problems in some cases
            removeComments: true
            removeEmptyAttributes: true
            removeRedundantAttributes: true
            removeScriptTypeAttributes: true
            removeStyleLinkTypeAttributes: true

    concurrent:
      dev: [
        'less'
        'preprocess'
        'coffee:all'
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
    'ngtemplates'
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

