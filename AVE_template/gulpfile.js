var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Basic Gulp task syntax
gulp.task('hello', function() {
  console.log('Hello Zell!');
})

// Development Tasks 
// -----------------

const config = {
  src: 'app/',
  dist: './dist/',
  img: {
    src: 'images/**/*.+(png|jpg|jpeg|gif|svg)',
    dist: 'images/'
  },
  fonts: {
    src: 'fonts/**/*',
    dist: 'fonts/'
  },
  css: {
    src: '**/*.css',
    dest: 'css/'
  },
  html: {
    src: '*.html'
  },
  scss: {
    src: 'scss/**/*.scss'
  },
  js: {
    src: 'js/**/*.js'
  }
};


// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
})

gulp.task('sass', function() {
  return gulp.src(config.src + config.scss.src) // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest(config.src + config.css.dest)) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

// Watchers
gulp.task('watch', function() {
  gulp.watch(config.src + config.scss.src, ['sass']);
  gulp.watch(config.src + config.html.src, browserSync.reload);
  gulp.watch(config.src + config.js.src, browserSync.reload);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src(config.src + config.html.src)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(config.dist));
});

// Optimizing Images 
gulp.task('images', function() {
  return gulp.src(config.src + config.img.src)
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest(config.dist + config.img.dist))
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src(config.src + config.fonts.src)
    .pipe(gulp.dest(config.src + config.fonts.dist))
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync(config.dist).then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'images', 'fonts'],
    callback
  )
})
