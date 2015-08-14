 /////////////////////////////////////
// REQUIRES
var argv         = require('yargs').argv,
    bower        = require('gulp-bower'),
    browserSync  = require('browser-sync').create(),
    changed      = require('gulp-changed'),
    concat       = require('gulp-concat'),
    es           = require('event-stream'),
    fs           = require('fs'),
    gulp         = require('gulp'),
    intercept    = require('gulp-intercept'),
    jade         = require('gulp-jade'),
    jeditor      = require("gulp-json-editor"),
    jSass        = require('gulp-json-sass'),
    jshint       = require('gulp-jshint'),
    minifycss    = require('gulp-minify-css'),
    ngConfig     = require('gulp-ng-config'),
    path         = require('path'),
    plumber      = require('gulp-plumber'),
    prompt       = require('gulp-prompt'),
    rename       = require('gulp-rename'),
    runSequence  = require('run-sequence'),
    sass         = require('gulp-sass'),
    uglify       = require('gulp-uglify');


 /////////////////////////////////////
// VARIABLES
function setVars(){  
    configFile   = 'config.json',
    configJSON   = JSON.parse(fs.readFileSync(configFile)),
    // APP
    appName      = configJSON.name,
    appDir       = configJSON.dir,
    // CSS
    cssSrcDir    = configJSON.css.srcDir,
    cssSrcFile   = cssSrcDir+configJSON.css.srcFile,
    cssDestDir   = appDir+configJSON.css.dir,
    cssDestFile  = configJSON.css.file,
    cssWatch     = configJSON.css.watch,
    // ERROR
    errorCount   = 0,
    errorTimeout = 10000,
    // FONT
    fontDir      = appDir+configJSON.font.dir,
    fontWatch    = configJSON.font.watch,
    // HTML
    htmlDir      = appDir+configJSON.html.dir,
    htmlFile     = configJSON.html.file,
    htmlSrcDir   = configJSON.html.srcDir,
    htmlSrcFile  = configJSON.html.srcFile,
    htmlWatch    = configJSON.html.watch,
    // JS
    jsSrcDir     = configJSON.js.srcDir,
    jsDestDir    = appDir+configJSON.js.dir,
    jsDestFile   = configJSON.js.file,
    jsWatch      = configJSON.js.watch;
}
setVars();

 /////////////////////////////////////
// TASKS
gulp.task('bower', function(){
    return bower();
});

gulp.task('bs', function(){
    browserSync.init({
        server: {
            baseDir: appDir
        }
    });
});

gulp.task('bs-reload', function(){
    browserSync.reload();
});

gulp.task('build', function(){
    runSequence('config', 'html-build', 'css', 'js-build', 'minify');
});

gulp.task('config', ['js-config', 'css-config']);

gulp.task('css', function(){
    return gulp.src(cssSrcFile)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(rename(cssDestFile))
        .pipe(gulp.dest(cssDestDir))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('css-build', function(){
    return gulp.src(cssSrcFile)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(rename(cssDestFile))
        .pipe(gulp.dest(cssDestDir));
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
        .pipe(rename('variables.scss'))
        .pipe(gulp.dest(cssSrcDir));
});

gulp.task('css-min', function(){
    return gulp.src(cssDestDir+cssDestFile)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(cssDestDir));
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
        .pipe(changed(htmlDir, {extension: '.html'}))
        .pipe(jade({
            locals: configJSON,
            pretty: true
        }))
        .pipe(gulp.dest(htmlDir))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('html-build', function(){
    var ext = htmlSrcFile.split('.').pop();
    var htmlFiles = htmlWatch;
    htmlFiles.pop();
    return gulp.src(htmlFiles)
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

gulp.task('js', function(){
    errorCount = 0;
    return gulp.src(jsSrcDir)
        .pipe(plumber({
            errorHandler: function(error) {
                browserSync.notify(error.message, errorTimeout);
                this.emit('end');
            }
        }))
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(es.map(function (file, cb) {
            if (!file.jshint.success) {
                file.jshint.results.forEach(function(err){
                    if(err){
                        errorCount++;
                        var msg = [
                            '<b>'+path.relative(__dirname, file.path)+'</b>',
                            '<b>Line:</b> ' + err.error.line,
                            '<b>Error:</b> ' + err.error.reason
                        ];
                        return cb(new Error(msg.join('<br />')), file);
                    }
                });
            }else{
                return cb(null, file);
            }
        })).on('end', function(){
            if(errorCount === 0){
                runSequence('js-build', 'bs-reload');
            }
        });
});

gulp.task('js-build', function(){
    return gulp.src(jsWatch)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(concat(jsDestFile))
        .pipe(gulp.dest(jsDestDir));
});

gulp.task('js-config', function(){
    return gulp.src(configFile)
        .pipe(ngConfig(appName+'.config'))
        .pipe(gulp.dest(jsSrcDir));
});

gulp.task('js-min', function(){
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
    runSequence('bower', 'fonts', 'build', 'bs', 'watch');
});

gulp.task('minify', function(){
    runSequence('css-min', 'js-min');
});

gulp.task('set-vars', setVars);

gulp.task('watch', function(){
    gulp.watch(configFile, function(){
        runSequence('set-vars', 'config', 'html-build', 'js-build', 'css-build', 'bs-reload');
    });
    gulp.watch(cssWatch, ['css']);
    gulp.watch(jsWatch, ['js']);
    gulp.watch(htmlWatch, ['html']);
});

gulp.task('default', function(){
    runSequence('html-build', 'js-build', 'css-build', 'bs', 'watch');
});