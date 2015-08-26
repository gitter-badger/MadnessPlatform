 /////////////////////////////////////
// REQUIRES
var addsrc       = require('gulp-add-src'),
    argv         = require('yargs').argv,
    bower        = require('gulp-bower'),
    browserSync  = require('browser-sync').create(),
    cached       = require('gulp-cached'),
    concat       = require('gulp-concat'),
    data         = require('gulp-data'),
    favicons     = require('gulp-favicons'),
    fs           = require('fs'),
    gulp         = require('gulp'),
    gulpif       = require('gulp-if'),
    intercept    = require('gulp-intercept'),
    jade         = require('gulp-jade'),
    jeditor      = require("gulp-json-editor"),
    jSass        = require('gulp-json-sass'),
    minifycss    = require('gulp-minify-css'),
    ngConfig     = require('gulp-ng-config'),
    path         = require('path'),
    plumber      = require('gulp-plumber'),
    prompt       = require('gulp-prompt'),
    rename       = require('gulp-rename'),
    replace      = require('gulp-replace'),
    runSequence  = require('run-sequence'),
    sass         = require('gulp-sass'),
    sassLint     = require('gulp-sass-lint'),
    superstatic  = require('superstatic'),
    ts           = require('gulp-typescript'),
    tslint       = require('gulp-tslint'),
    uglify       = require('gulp-uglify');


 /////////////////////////////////////
// VARIABLES
function setVars(){  
    configFile   = 'config.json';
    configJSON   = JSON.parse(fs.readFileSync(configFile));
    // APP
    appName      = configJSON.name;
    appDesc      = configJSON.description;
    appDir       = configJSON.root;
    appIcon      = configJSON.img.favicon;
    appLocal     = configJSON.local;
    appMobile    = configJSON.mobile;
    appUrl       = configJSON.url;
    appVersion   = configJSON.version;
    appBuild     = 'build/';
    // CSS
    cssSrcDir    = configJSON.css.srcDir;
    cssDestDir   = appDir+configJSON.css.dir;
    cssDestFile  = configJSON.css.file;
    cssBuild     = configJSON.css.build;
    cssBuildDir  = appBuild+"css/";
    cssBuildLib  = 'library.scss';
    cssLib       = configJSON.css.libraries;
    cssWatch     = configJSON.css.watch;
    // ERROR
    errorCount   = 0;
    errorTimeout = 10000;
    // FONT
    fontDir      = appDir+configJSON.font.dir;
    fontWatch    = configJSON.font.watch;
    // HTML
    htmlDir      = appDir+configJSON.html.dir;
    htmlFile     = configJSON.html.file;
    htmlSrcDir   = configJSON.html.srcDir;
    htmlSrcFile  = configJSON.html.srcFile;
    htmlWatch    = configJSON.html.watch;
    // IMG
    iconDir      = 'icon/';
    imgDir       = appDir+configJSON.img.dir;
    imgIconDir   = imgDir+iconDir;
    imgWatch     = configJSON.img.watch;
    // JS
    jsSrcDir     = configJSON.js.srcDir;
    jsDestDir    = appDir+configJSON.js.dir;
    jsDestFile   = configJSON.js.file;
    jsBuild      = configJSON.js.build;
    jsBuildDir   = appBuild+"js/";
    jsBuildLib   = 'library.js';
    jsLib        = configJSON.js.libraries;
    jsWatch      = configJSON.js.watch;
    // TEMPLATES
    tmplDir      = configJSON.templates;
}
setVars();

 /////////////////////////////////////
// TASKS
gulp.task('bower', function(){
    return bower({ cmd: 'install'});
});

gulp.task('bower-update', function(){
    return bower({ cmd: 'update'});
});

gulp.task('build', function(){
    runSequence('config', 'icon-copy', 'html-build', 'css-build', 'js-build', 'minify');
});

gulp.task('config', ['js-config', 'css-config']);

gulp.task('css-build', function(){
    runSequence('css-config', 'css-import', 'css-lib', 'css-compile', 'css-concat');
});

gulp.task('css-compile', function(){
    return gulp.src(cssWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(gulpif(global.isWatching, cached('css-compile')))
        .pipe(sass())
        .pipe(gulp.dest(cssBuildDir));
});

gulp.task('css-concat', function(){
    gulp.src(cssBuild)
        .pipe(concat(cssDestFile))
        .pipe(gulp.dest(cssDestDir))
        .pipe(gulpif(global.isWatching, browserSync.reload({stream:true})));
});

gulp.task('css-config', function(){
    return gulp.src(configFile)
        .pipe(intercept(function(file) {
            var json = JSON.parse(file.contents.toString());
            file.contents = new Buffer(JSON.stringify(json.css.vars));
            return file;
        }))
        .pipe(jSass({
          sass: false
        }))
        .pipe(rename('_variables.scss'))
        .pipe(gulp.dest(cssSrcDir));
});

gulp.task('css-lint', function(){
    var errorCount = 0;
    return gulp.src(cssWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(gulpif(global.isWatching, cached('css-lint')))
        .pipe(sassLint())
        .pipe(plumber.stop())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
        .pipe(intercept(function(file) {
            errorCount = errorCount + file.sassLint.errorCount;
            return file;
        }))
        .on('end', function(){
            if(errorCount === 0){
                runSequence('css-compile', 'css-concat');
            }
        });
});

gulp.task('css-minify', function(){
    return gulp.src(cssDestDir+cssDestFile)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(cssDestDir));
});

gulp.task('css-import', function() {
    var imports = "";
    for(var i=0; i < configJSON.css.libraries.length; i++){
        var cssLib = configJSON.css.libraries[i];
        imports += '@import "../../'+cssLib+'";\n';
    }

    return gulp.src(tmplDir+'scss/libraries.scss')
        .pipe(replace('@@{libraries}', imports))
        .pipe(gulp.dest(cssSrcDir));
});

gulp.task('css-lib', function() {
    return gulp.src(cssSrcDir+'libraries.scss')
        .pipe(sass())
        .pipe(gulp.dest(cssBuildDir));
});

gulp.task('icon', function(){
    runSequence('favicon', 'icon-copy', 'html-template'); 
});

gulp.task('icon-copy', function(){
    return gulp.src(appIcon)
        .pipe(gulp.dest(imgDir));
});

gulp.task('favicon', function(){
    return gulp.src(htmlSrcDir+'favicon.jade')
        .pipe(favicons({
            files: {
                src: appIcon,                
                dest: '../../'+imgIconDir,
                iconsPath: imgIconDir
            },
            settings:{
                appName: appName,
                appDescription: appDesc,
                background: "#{css.vars.theme.primary}",
                url: appUrl,
                version: appVersion,
                logging: true
            }
        }))
        .pipe(gulp.dest(htmlSrcDir));
});

gulp.task('html', function () {
    return gulp.src(htmlWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(gulpif(global.isWatching,  cached('html-compile')))
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))
        .pipe(gulp.dest(htmlDir));
});

gulp.task('html-build', function(){
    var ext = htmlSrcFile.split('.').pop();
    var htmlFiles = htmlWatch;
    htmlFiles.pop();
    return gulp.src(htmlFiles)
        .pipe(plumber({
            errorHandler: function(error) {
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))        
        .pipe(rename(function(file){
            if(file.basename+'.'+ext === htmlSrcFile){
                file.basename = 'index';
                file.dirname = '../';
            }
        }))
        .pipe(gulp.dest(htmlDir));
});

gulp.task('html-template', function(){
    return gulp.src(htmlSrcDir+htmlSrcFile)
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))        
        .pipe(rename('index.html'))
        .pipe(gulp.dest(appDir))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js-build', function(){
    runSequence('js-config', 'js-lint', 'js-compile', 'js-concat');
});

gulp.task('js-compile', function () {              
    var tsResult = gulp.src(jsWatch)
        .pipe(gulpif(global.isWatching, plumber({
            errorHandler: function(error) {
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        })))
        .pipe(gulpif(global.isWatching,  cached('js-compile')))
        .pipe(addsrc('src/tsd/**/*.d.ts'))
        .pipe(ts({
            "compilerOptions": {
                "target": "es5",
                "sourceMap": false
            }
        }));

        tsResult.dts.pipe(gulp.dest('build/js'));
        return tsResult.js.pipe(gulp.dest('build/js'));
});

gulp.task('js-concat', function(){
    var concatArr = jsLib.concat(jsBuild);
    return gulp.src(concatArr)
        .pipe(concat(jsDestFile))
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('js-config', function(){
    return gulp.src(configFile)
        .pipe(ngConfig(appName+'.config'))
        .pipe(gulp.dest(jsBuildDir));
});

gulp.task('js-lint', function(){
    var errorCount = 0;
    return gulp.src(jsWatch)
        .pipe(gulpif(global.isWatching, plumber({
            errorHandler: function(error) {
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        })))
        .pipe(gulpif(global.isWatching,  cached('js-lint')))
        .pipe(tslint())
        .pipe(tslint.report('prose'))
        .pipe(intercept(function(file) {
            errorCount = errorCount + file.tslint.failureCount;
            return file;
        }))
        .on('end', function(){
            if(errorCount === 0){
                runSequence('js-compile', 'js-concat', 'sync-reload');
            }
        });
});

gulp.task('js-minify', function(){
    return gulp.src(jsDestDir+jsDestFile)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('fonts', function(){
    return gulp.src(fontWatch)
        .pipe(gulp.dest(fontDir));
});

gulp.task('install', function(){
    runSequence('bower', 'fonts', 'build', 'sync', 'watch');
});

gulp.task('minify', function(){
    runSequence('css-min', 'js-minify');
});

gulp.task('set-vars', setVars);

gulp.task('sync', function(){
    browserSync.init({
        port: 3000,
        files: ['index.html', '**/*.js'],
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'silent',
        logPrefix: appName,
        notify: true,
        reloadDelay: 0,
        server: {
            baseDir: appDir,
            middleware: superstatic({ debug: false})
        }
    });
});

gulp.task('sync-reload', function(){
    browserSync.reload();
});

gulp.task('watch', function(){
    global.isWatching = true;
    gulp.watch(configFile, function(){
        runSequence('set-vars', 'config', 'html-build', 'js-build', 'css-build');
    });
    gulp.watch(cssWatch, ['css-lint']);
    gulp.watch(jsWatch, ['js-lint']);
    gulp.watch(jsLib, function(){
        runSequence('js-concat', 'sync-reload');
    });
    gulp.watch(htmlWatch, ['html']);
    gulp.watch(imgWatch, ['icon']);
});

gulp.task('default', function(){
    runSequence('sync', 'watch');
});