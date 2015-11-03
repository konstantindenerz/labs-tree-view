'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var del = require('del'),
  spawn = require('child_process').spawn,
  NwBuilder = require('nw-builder');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')();

gulp.task('nwjs:clean', function() {
  return del([
    path.join(conf.paths.nwjs, 'build'),
    path.join(conf.paths.nwjs, 'www'),
    path.join(conf.paths.nwjs, conf.paths.nodeModules),
    path.join(conf.paths.nwjs, conf.paths.package)
  ]);
});

gulp.task('nwjs:copy-source', function() {
  return gulp.src(path.join(conf.paths.dist, '**/*'))
    .pipe(gulp.dest(path.join(conf.paths.nwjs, 'www/')));
});

gulp.task('nwjs:copy-dependencies', function(){
  var dependencies = require(path.join(process.cwd(), conf.paths.package)).dependencies;

  var modules = Object.keys(dependencies).map(function(dependency){
    return path.join(conf.paths.nodeModules, dependency, '**/*');
  })
  return gulp.src(modules, {base:"."})
  .pipe(gulp.dest(path.join(conf.paths.nwjs, '/')))
});

gulp.task('nwjs:copy-config:debug', function(done) {
  return gulp.src(conf.paths.package)
    .pipe($.rename('package.json'))
    .pipe(gulp.dest(path.join(conf.paths.nwjs, '/')));
});

gulp.task('nwjs:copy-config:release', function(done) {
  return gulp.src(conf.paths.package)
    .pipe($.rename('package.json'))
    .pipe($.jsonTransform(function(data) {
      delete data['node-remote'];
      data.main = 'www/index.html';
      return data;
    }))
    .pipe(gulp.dest(path.join(conf.paths.nwjs, '/')));
});

gulp.task('nwjs:serve', function(done) {
    runSequence('nwjs','serve', 'nwjs:run:debug', done);
});

gulp.task('nwjs:run:debug', function(done){
  spawn('nw', ['nwjs'])
  done();
});


gulp.task('nwjs:package', function() {
  var nw = new NwBuilder({
    version: '0.12.3',
    files: path.join(conf.paths.nwjs, '**', '*.*'),
    buildDir: path.join(conf.paths.nwjs, '/build'),
    //winIco: "./app/resources/icon.png",
    //macIcns: path.join(conf.targets.resourcesFolder, 'icon.icns'),
    platforms: [
      //'win32', 'win64',
      'osx64',
      //'linux32', 'linux64'
    ]
  });

  return nw.build();
});



gulp.task('nwjs', ['nwjs:build']);


gulp.task('nwjs:build', function(callback) {
  runSequence('clean', 'build', 'nwjs:clean', 'nwjs:copy-config:debug', 'nwjs:copy-dependencies', 'nwjs:copy-source', 'nwjs:package', callback);
});


gulp.task('nwjs:build:release', function(callback) {
  runSequence('clean', 'build', 'nwjs:clean', 'nwjs:copy-config:release', 'nwjs:copy-dependencies', 'nwjs:copy-source',  'nwjs:package', callback);
});
