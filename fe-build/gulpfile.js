const path = require('path');
const {src, dest, task, watch, series, parallel} = require('gulp');
const browserSync = require('browser-sync').create();

// css specific
const sass = require('gulp-dart-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');

function onError(err) {
  notify.onError({
    title: 'Gulp Error(<%= error.plugin %>)',
    message: 'Error: <%= error.message %>',
    sound: 'Bottle',
    timeout: 5
  })(err);
}

task('clean-dist', () => {
  return src(path.resolve('../dist/**/*'), {read: false, allowEmpty: true})
  .pipe(plumber(onError))
  .pipe(clean({force: true}));
});

task('clean-assets', () => {
  return src(
      [path.resolve('../assets/**/*'), path.resolve('!../assets/.gitkeep')],
      {read: false, allowEmpty: true})
  .pipe(plumber(onError))
  .pipe(clean({force: true}));
});

task('copy-html', (cb) => {
  console.log('copy-html')
  return src(path.resolve('../fe/*.html'))
  .pipe(dest(path.resolve('../dist')));
});

task('copy-img', (cb) => {
  return src(path.resolve('../fe/*.jpg'))
  .pipe(dest(path.resolve('../dist')));
});

task('copy-assets', (cb) => {
  console.log('copy-assets')
  return src(path.resolve('../fe/assets/**/*'))
  .pipe(dest(path.resolve('../dist')))
  .pipe(dest(path.resolve('../assets')));
});

task('scss', () => {
  console.log('SCSS')
  return src(path.resolve('../fe/*.scss'))
  .pipe(plumber(onError))
  .pipe(sourcemaps.init())

  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([autoprefixer()]))

  .pipe(dest(path.resolve('../dist')))
  .pipe(dest(path.resolve('../assets')));
});

task('watch', cb => {
  console.log('XXXX', path.resolve('../fe/*.scss'))
  watch('../fe/**/*.scss', parallel('scss'));
  watch('../fe/**/*.html', parallel('copy-html'));
  watch('../fe/assets/**/*', parallel('copy-assets'));

  let bsOptions = {
    watch: true,
    server: "../dist",
    open: false,
  };
  browserSync.init(bsOptions);
});

task('copy-dev', parallel('copy-html', 'copy-img', 'copy-assets'))
task('build-dev', parallel('copy-dev', 'scss'))
task('develop', series('clean-dist', 'build-dev', 'watch'))

// task('clean', parallel('clean-dist'))
task('build', series('clean-assets', parallel('copy-html', 'copy-assets', 'scss')))
