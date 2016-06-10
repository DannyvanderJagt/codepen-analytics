const Path = require('path');
const Gulp = require('gulp');
const Sass = require('gulp-sass');
const AutoPrefixer = require('gulp-autoprefixer');
const Pug = require('gulp-pug');
const Watch = require('gulp-watch');
const LiveReload = require('gulp-livereload');
const Plumber = require('gulp-plumber');
const Ignore = require('gulp-ignore');

const paths = {
  pug: {
    input: Path.join(__dirname, './content/views/*.pug'),
    output: Path.join(__dirname, './content'),
    partials: Path.join(__dirname, './content/partials/*.pug'),
  },
  scss: {
    input: Path.join(__dirname, './content/styles/scss/*.scss'),
    output: Path.join(__dirname, './content/styles/css'),
  }
};


Gulp.task('pug', () => {
  return Gulp.src(paths.pug.input)
    .pipe(Plumber())
    .pipe(Ignore('pen.pug'))
    .pipe(Pug())
    .pipe(Gulp.dest(paths.pug.output))
    .pipe(LiveReload())
})

Gulp.task('scss', () => {
  return Gulp.src(paths.scss.input)
    .pipe(Plumber())
    .pipe(Sass())
    .pipe(AutoPrefixer())
    .pipe(Gulp.dest(paths.scss.output))
    .pipe(LiveReload())
});

Gulp.task('watch', () => {
  LiveReload.listen()
  Gulp.watch([paths.pug.input, paths.pug.partials], ['pug']);
  Gulp.watch(paths.scss.input, ['scss']);
})



Gulp.task('default', ['pug', 'scss', 'watch'])