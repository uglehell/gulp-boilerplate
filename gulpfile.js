'use strict'

import gulp         from 'gulp'
import sass         from 'gulp-sass'
import pug          from 'gulp-pug'
import plumber      from 'gulp-plumber'
import imagemin     from 'gulp-imagemin'
import autoprefixer from 'gulp-autoprefixer'
import rename       from 'gulp-rename'
import browserSync  from 'browser-sync'
import newer        from 'gulp-newer'
import webpack      from 'webpack-stream'


const path = {
  dist: {
    index:   'dist/',
    style:   'dist/css/',
    scripts: 'dist/javascript/',
    medias:  'dist/images/',
    fonts:   'dist/fonts/'
  },
  src: {
    index:   'src/index/index.pug',
    style:   'src/style/main.{scss,css}',
    scripts: 'src/scripts/*.{ts,js}',
    medias:  'src/images/**/*',
    fonts:   'src/fonts/*.{woff,woff2}'
  },
  srcWatch: {
    index:   'src/index/*.pug',
    style:   'src/style/*.{scss,css}',
    scripts: 'src/scripts/*.{ts,js}',
    medias:  'src/images/*',
    fonts:   'src/fonts/*.{woff,woff2}'
  }
}


const buildFunctions = {
  index: done => {
    gulp.src(path.src.index)
      .pipe(plumber())
      .pipe(pug())
      .pipe(gulp.dest(path.dist.index))
  
    done()
  },
  style: done => {
    gulp.src(path.src.style)
      .pipe(plumber())
      .pipe(sass({ outputStyle: 'compressed' }))
      .pipe(autoprefixer({ cascade: true }))
      .pipe(rename('style.min.css'))
      .pipe(gulp.dest(path.dist.style))
  
    done()
  },
  scripts: done => {
    gulp.src(path.src.scripts)
      .pipe(plumber())
      .pipe(webpack({
        output: {
          filename: 'main.js'
        },
        resolve: {
          extensions: ['.ts', '.js']
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: '/node_modules/'
            },
            {
              test: /\.ts$/,
              loader: 'ts-loader',
              exclude: '/node_modules/'
            }
          ]
        },
        mode: 'production'
      }))
      .pipe(rename('main.min.js'))
      .pipe(gulp.dest(path.dist.scripts))

    done()
  },
  images: done => {
    gulp.src(path.src.medias)
      .pipe(newer(path.dist.medias))
      .pipe(imagemin([
        imagemin.mozjpeg({
          quality: 93,
          progressive: true
        }),
        imagemin.optipng({
          optimizationLevel: 4
        }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
          ]
        })
      ]))
      .pipe(gulp.dest(path.dist.medias))
      .pipe(browserSync.reload({ stream: true }))

    done()
  }
}

const devFunctions = {
  index: done => {
    gulp.src(path.src.index)
      .pipe(plumber())
      .pipe(pug({ pretty: true }))
      .pipe(gulp.dest(path.dist.index))
      .pipe(browserSync.reload({ stream: true }))
  
    done()
  },
  style: done => {
    gulp.src(path.src.style)
      .pipe(plumber())
      .pipe(sass({ outputStyle: 'expanded' }))
      .pipe(autoprefixer({ cascade: true }))
      .pipe(rename('style.min.css'))
      .pipe(gulp.dest(path.dist.style))
      .pipe(browserSync.reload({ stream: true }))
  
    done()
  },
  scripts: done => {
    gulp.src(path.src.scripts)
      .pipe(plumber())
      .pipe(webpack({
        output: {
          filename: 'main.js'
        },
        resolve: {
          extensions: ['.ts', '.js']
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: '/node_modules/'
            },
            {
              test: /\.ts$/,
              loader: 'ts-loader',
              exclude: '/node_modules/'
            }
          ]
        },
        mode: 'development'
      }))
      .pipe(rename('main.min.js'))
      .pipe(gulp.dest(path.dist.scripts))
      .pipe(browserSync.reload({ stream: true }))

    done()
  },
  images: done => {
    gulp.src(path.src.medias)
      .pipe(newer(path.dist.medias))
      .pipe(imagemin([
        imagemin.mozjpeg({
          quality: 93,
          progressive: true
        }),
        imagemin.optipng({
          optimizationLevel: 4
        }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
          ]
        })
      ]))
      .pipe(gulp.dest(path.dist.medias))
      .pipe(browserSync.reload({ stream: true }))

    done()
  },
  initialize: () => {
    browserSync.init({
      server: path.dist.index,
      notify: false,
      online: true,
      open: false
    })

    gulp.watch(path.srcWatch.index, devFunctions.index)
    gulp.watch(path.srcWatch.style, devFunctions.style)
    gulp.watch(path.srcWatch.scripts, devFunctions.scripts)
    gulp.watch(path.srcWatch.medias, devFunctions.images)
  }
}


export const index   = buildFunctions.index
export const style   = buildFunctions.style
export const scripts = buildFunctions.scripts

export default devFunctions.initialize
export const build = gulp.series(
  buildFunctions.index,
  buildFunctions.style,
  buildFunctions.scripts,
  buildFunctions.images
)
