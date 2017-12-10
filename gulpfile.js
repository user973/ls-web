const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const gulpPlugins = gulpLoadPlugins();

const del = require('del');

const browserSync = require('browser-sync').create();

const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const paths = {
    root: './build',
    templates: {
        pages: 'src/templates/pages/*.pug',
        src: 'src/templates/**/*.pug'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'build/assets/styles'
    },
    images: {
        src: 'src/images/**/*.*',
        dest: 'build/assets/images'
    },
    fonts: {
        src: 'src/fonts/**/*.*',
        dest: 'build/assets/fonts'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/assets/scripts'
    }
};

//pug
function templates() {
    return gulp.src(paths.templates.pages)
        .pipe(gulpPlugins.plumber({
            errorHandler: gulpPlugins.notify.onError(function(error) {
                return {
                    title: 'templates',
                    message: error.message
                }
            })
        }))
        .pipe(gulpPlugins.pug({ pretty: true }))
        .pipe(gulp.dest(paths.root));
}

//scss
function styles() {
    return gulp.src('./src/styles/app.scss')
        .pipe(gulpPlugins.plumber({
            errorHandler: gulpPlugins.notify.onError(function(error) {
                return {
                    title: 'styles',
                    message: error.message
                }
            })
        }))
        .pipe(gulpPlugins.sourcemaps.init())
        .pipe(gulpPlugins.sass({ outputStyle: 'compressed' }))
        .pipe(gulpPlugins.sourcemaps.write())
        .pipe(gulpPlugins.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.styles.dest))
}

//TODO images - заглушка
function images() {
    return gulp.src(paths.images.src)
        .pipe(gulpPlugins.plumber({
            errorHandler: gulpPlugins.notify.onError(function(error) {
                return {
                    title: 'images',
                    message: error.message
                }
            })
        }))
        .pipe(gulp.dest(paths.images.dest));
}

//TODO fonts - заглушка
function fonts() {
    return gulp.src(paths.fonts.src)
        .pipe(gulpPlugins.plumber({
            errorHandler: gulpPlugins.notify.onError(function(error) {
                return {
                    title: 'fonts',
                    message: error.message
                }
            })
        }))
        .pipe(gulp.dest(paths.fonts.dest));
}

//scripts
function scripts() {
    /*return gulp.src(paths.scripts.src)
        .pipe(gulpPlugins.plumber({
            errorHandler: gulpPlugins.notify.onError(function(error) {
                return {
                    title: 'scripts',
                    message: error.message
                }
            })
        }))
        .pipe(gulpPlugins.concat('bundle.js'))
        .pipe(gulpPlugins.uglify())
        .pipe(gulpPlugins.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.scripts.dest));*/
    
    return gulp.src('src/scripts/app.js')
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(paths.scripts.dest));
}

//ревизии подключаемых файлов(борьба с кэшированием)
function revision() {
    return gulp.src('./build/**/*.html')
        .pipe(gulpPlugins.revAppend())
        .pipe(gulp.dest('./build/'));
}

//очистка
function clean() {
    return del(paths.root);
}

//следим за исходниками
function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.fonts.src, fonts);
    gulp.watch(paths.scripts.src, scripts);
}

//локальный сервер + lifereload (встроенный)
function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*').on('change', browserSync.reload);
};

exports.templates = templates;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.scripts = scripts;
exports.clean = clean;

gulp.task('default', gulp.series(
        clean,
        gulp.parallel(styles, templates, images, scripts, fonts),
        revision,
        gulp.parallel(watch, server)
    )
);