((): void => {

    var app = angular.module('MadnessPlatform', ['MadnessPlatform.config', 'ionic', 'ngCordova', 'firebase']);

    app.config(function($stateProvider, $urlRouterProvider){
        $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'html/page/home.html',
            controller: 'MadnessPlatform.homeController'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'html/page/settings.html',
            controller: 'MadnessPlatform.settingsController'
        });

        $urlRouterProvider.otherwise('/home');
    })
    .run(function($ionicPlatform, $cordovaSplashscreen, $ionicSideMenuDelegate) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.cordova){
                $cordovaSplashscreen.hide();
            }
        });
    });

})();