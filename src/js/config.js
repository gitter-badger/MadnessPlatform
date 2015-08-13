angular.module('MadnessPlatform.config', [])
.constant('name', "MadnessPlatform")
.constant('dir', "www/")
.constant('db', {"firebase":{"host":"YOUR FIREBASE HERE"}})
.constant('html', {"dir":"html/","file":"index.html","watch":["www/html/**/*.html","www/html/*.html","www/index.html"]})
.constant('css', {"dir":"css/","file":"app.css","srcDir":"src/scss/","srcFile":"app.scss","vars":{"light":"#ffffff !default","stable":"#f8f8f8 !default","positive":"#387ef5 !default","calm":"#11c1f3 !default","balanced":"#0C5510 !default","energized":"#01B600 !default","assertive":"#ef473a !default","royal":"#886aea !default","dark":"#444444 !default","ionicons-font-path":"'../fonts' !default","theme":{"primary":"$positive","secondary":"$calm"},"screen":{"xl":"1500px","lg":"1200px","md":"992px","sm":"768px"}},"watch":["src/scss/**/*.scss"]})
.constant('js', {"dir":"js/","file":"build.js","srcDir":"src/js/","watch":["bower_components/ionic/js/ionic.bundle.js","bower_components/ngCordova/dist/ng-cordova.js","bower_components/firebase/firebase.js","bower_components/angularfire/dist/angularfire.js","src/js/app.js","src/js/config.js","src/js/router.js","src/js/ctrl/**.js","src/js/fctry/**.js","src/js/drctv/**.js","src/js/srv/**.js"]})
.constant('font', {"dir":"fonts/","watch":["bower_components/ionic/fonts/**","bower_components/font-awesome/fonts/**"]});
