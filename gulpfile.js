var gulp = require('gulp');

var plumber = require('gulp-plumber');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var gutil = require('gulp-util');

gulp.task('css', function () {
    gulp.src(['./assets/css/src/sidebar.css'])
        .pipe(cleanCSS())
        .pipe(concat('sidebar.min.css'))
        .pipe(gulp.dest('./assets/css/dist'));

    gulp.src(['./assets/css/src/canvas.css'])
        .pipe(cleanCSS())
        .pipe(concat('canvas.min.css'))
        .pipe(gulp.dest('./assets/css/dist'));
});

gulp.task('sidebar-js', function () {
    var bundler = browserify('./assets/js/src/sidebar.js').transform(babelify, {});

    bundler.bundle()
        .pipe(plumber())
        .pipe(source('sidebar.js'))
        .pipe(buffer())
        .pipe(rename('sidebar.min.js'))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(gulp.dest('./assets/js/dist'));
});

gulp.task('canvas-js', function () {
    var bundler = browserify('./assets/js/src/canvas.js').transform(babelify, {});

    bundler.bundle()
        .pipe(plumber())
        .pipe(source('canvas.js'))
        .pipe(buffer())
        .pipe(rename('canvas.min.js'))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(gulp.dest('./assets/js/dist'))
});

gulp.task('frontend-js', function () {
    var bundler = browserify('./assets/js/src/frontend.js').transform(babelify, {});

    bundler.bundle()
        .pipe(plumber())
        .pipe(source('frontend.js'))
        .pipe(buffer())
        .pipe(rename('frontend.min.js'))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(gulp.dest('./assets/js/dist'))
});

gulp.task('js', ['canvas-js', 'sidebar-js', 'frontend-js']);

gulp.task('watch', function () {
    gulp.watch('./assets/css/src/**/*.css', ['css']);
    gulp.watch('./assets/js/src/**/*.js', ['js']);
});

gulp.task('default', ['js', 'css']);