var app = angular.module('MadnessPlatform', ['MadnessPlatform.config', 'ionic', 'ngCordova', 'firebase'])

.run(function($ionicPlatform, $cordovaSplashscreen, $ionicSideMenuDelegate) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.navigator && window.navigator.splashscreen) {
            window.plugins.orientationLock.unlock();
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        if (window.cordova){
            $cordovaSplashscreen.hide();
        }
    });
})

.controller('appCtrl', function($scope) {

});