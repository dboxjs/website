let path = require('path');
let gulp = require('gulp');
let pug  = require('gulp-pug');

let pugFiles = './src/**/*.pug';

gulp.task('pug', () => {
  gulp.src( pugFiles )
    .pipe( pug().on('error', () => console.log('JADE ERROR')) )
    .pipe( gulp.dest('./src') );
});

gulp.task('default', ['pug'], () => {
  gulp.watch(pugFiles, ['pug']);
});
