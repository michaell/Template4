const gulp = require('gulp');

const del = require('del');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');

// styles 
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-csso');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const concat = require('gulp-concat');


/*--------------------------paths--------------------------*/
const paths = {
    root: './dist',
    styles: {
        entry: 'app/styles/app.scss',   
        src: 'app/styles/**/*.scss',
        dest: 'dist/assets/styles/'
    },
    scripts: {
        src: 'app/scripts/**/*.js',
        dest: 'dist/assets/scripts/'
    },
    templates: {
        pages: 'app/templates/pages/*.pug',
        src: 'app/templates/**/*.pug',
        dest: 'dist/assets/'
    },
    images: {
        src: 'app/images/**/*.*',
        dest: 'dist/assets/images/'
    },
    fonts: {
        src: 'app/fonts/**/*.*',
        dest: 'dist/assets/fonts/'
    }
};

/*------------pathes to JS files------------*/


let moduleJs = [
    'app/scripts/common/blur.js',
    'app/scripts/common/test.js'
];

/*------------pathes to outer plugins and JS libraries------------*/

let vendorJs = [
    'node_modules/jquery/dist/jquery.min.js'
];

//js
function scripts(){
    return gulp.src(moduleJs)
        .pipe(plumber({
            errorHandler: notify.onError(function (err){
                return {title: 'javaScript', message: err.message}
            })
        }))
        // .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(concat('main.min.js'))
        // .pipe(uglify())
        // .pipe(gulpIf(isDevelopment, sourcemaps.write())) //write sourcemaps in dev mode
        .pipe(gulp.dest(paths.scripts.dest));
};

/*-------combining outer plugins and JS libraries in one file--------*/
function vendorJS() {
    return gulp
    .src(vendorJs)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
};


/*------------pathes to outer plugins and style libraries------------*/
let vendorCss = [
    'node_modules/normalize-css/normalize.css'
];

/*--------------------------pug--------------------------*/
function templates() {               
    return gulp.src(paths.templates.pages)
        .pipe(pug({ pretty: true }))
        .on('error', notify.onError(function(error) {
            return {
                title: 'Styles',
                message: error.message
            };
        }))
        // .pipe(plumber({
        //     errorHandler: notify.onError(function(error) {
        //         return {
        //             title: 'Style', 
        //             message: error.message
        //         };
        //     })
        // }))
        .pipe(gulp.dest(paths.root));
}

/*--------------------------styles--------------------------*/
function styles() {
    return gulp.src(paths.styles.entry)
        // .pipe(plumber({
        //     errorHandler: notify.onError(function (error) {
        //         return {
        //             title: 'Style', 
        //             message: error.message
        //         };
        //     })
        // }))
        // .on('error', notify.onError(function(error) {
        //     return {
        //         title: 'Styles',
        //         message: error.message
        //     };
        // }))   
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 4 versions'))        
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());      
}

/*-------combining outer plugins and style libraries--------*/
function vendorCSS(){
    return gulp
        .src(vendorCss)
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest(paths.styles.dest))
}
 

/*------------------------build folder cleaning------------------------*/
function clean() {
    return del(paths.root);
}

/*------------------------images transfer------------------------*/
function images() {
    return gulp.src(paths.images.src)
          .pipe(gulp.dest(paths.images.dest));
}

/*------------------------fonts transfer------------------------*/
function fonts() {
    return gulp.src(paths.fonts.src)
          .pipe(gulp.dest(paths.fonts.dest));
}

/*------------------------watcher------------------------*/
function watch() {
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(vendorCss, vendorCSS);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.fonts.src, fonts);
}

/*------------------------server------------------------*/
function server() {
    browserSync.init({
        server: paths.root   
    });
    browserSync.watch([paths.root, '!**/*.css'], browserSync.reload);
}

/*-------function exports to start them from the console-------*/
exports.clean = clean; 
exports.styles = styles;
exports.scripts = scripts;
exports.templates = templates;
exports.images = images;
exports.fonts = fonts;
exports.watch = watch;
exports.server = server;
exports.vendorCSS = vendorCSS;

/*------------------------build and watch------------------------*/
gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, vendorCSS, scripts, vendorJS, templates, images, fonts),
    gulp.parallel(watch, server)
));
