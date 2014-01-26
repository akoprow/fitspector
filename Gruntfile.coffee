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
        tasks: ['copy:coffee', 'coffee:all', 'preprocess:js']
      html:
        files: '<%= yeoman.client %>/**/*.html'
        tasks: ['copy:html']
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
#            '<%= yeoman.dist %>/<%= yeoman.client %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
          cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>/img'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: '<%= yeoman.dist %>/<%= yeoman.client %>/img'
        ]

    svgmin:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>/img'
          src: '{,*/}*.svg'
          dest: '<%= yeoman.dist %>/<%= yeoman.client %>/img'
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
      options:
        inline: true
      js:
        src: ['<%= yeoman.tmp %>/<%= yeoman.client %>/scripts/services/data-provider-service.js']

    sprite:
      sportIcons:
        src: '<%= yeoman.client %>/img/sport-icons/*'
        destImg: '<%= yeoman.tmp %>/<%= yeoman.client %>/img/sport-icons.png'
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
        cwd: '<%= yeoman.client %>/img'
        src: ['**/*', '!sport-icons/*']
        dest: '<%= yeoman.tmp %>/<%= yeoman.client %>/img'
        expand: true
      server:
        cwd: '<%= yeoman.server %>'
        src: '**/*'
        dest: '<%= yeoman.tmp %>/<%= yeoman.server %>'
        expand: true
      libs:
        cwd: '<%= yeoman.bower_components %>/'
        src: [
          'angular/angular.js'
          'angular-animate/angular-animate.js'
          'angular-cookies/angular-cookies.js'
          'angular-route/angular-route.js'
          'angular-resource/angular-resource.js'
          'angular-bindonce/bindonce.js'
          'bootstrap/js/alert.js'
          'bootstrap/js/dropdown.js'
          'bootstrap/js/tooltip.js'
          'd3/d3.js'
          'hopscotch/js/hopscotch-0.1.2.js'
          'jquery/jquery.js'
          'momentjs/moment.js'
          'ngInfiniteScroll/ng-infinite-scroll.js'
          'underscore/underscore.js'

          'bootstrap/dist/fonts/*'
          'bootstrap/dist/css/bootstrap.css'
          'bootstrap/dist/css/bootstrap-theme.css'
          'hopscotch/css/hopscotch-0.1.2.css'
          'hopscotch/img/sprite-green-0.3.png'
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
          '<%= yeoman.server %>/**/*.js'
          '<%= yeoman.client %>/fonts/*'
        ]
        dest: '<%= yeoman.dist %>'
        expand: true
      # TODO(koper) This is ugly; find a better way to expose client side code for the server.
      dist_js:
        cwd: '<%= yeoman.tmp %>/<%= yeoman.client %>/scripts'
        src: '**/*.js'
        dest: '<%= yeoman.dist %>/<%= yeoman.client %>/scripts'
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

  grunt.registerTask 'server', [
    'env:dev'
    'copy'
    'coffee:all'
    'sprite'
    'less'
    'preprocess'
    'express:fitspector'
    'watch'
  ];

  grunt.registerTask 'build', [
    'env:prod'
    'clean:dist'
    'copy'
    'coffee:all'
    'useminPrepare'
    'copy:dist'
    'sprite'
    'less'
    'preprocess'
    'imagemin'
    'svgmin'
    'htmlmin'
    'ngtemplates'
    'autoprefixer'
    'concat'
    'cdnify'
    'ngmin'
    'cssmin'
    'uglify'
    'rev'
    'usemin'
    'copy:dist_js'
  ];

  grunt.registerTask 'test', [
    'clean:server'
    'concurrent:test'
    'autoprefixer'
    'connect:test'
    'karma'
  ];

  grunt.registerTask 'default', [
    'server'
  ];
