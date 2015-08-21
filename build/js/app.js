(function () {
    var app = angular.module('MadnessPlatform', ['MadnessPlatform.config', 'ionic', 'ngCordova', 'firebase']);
    app.config(['$routeProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home', {
                url: '/home',
                templateUrl: 'html/page/home.html',
                controller: 'homeController'
            })
                .state('settings', {
                url: '/settings',
                templateUrl: 'html/page/settings.html',
                controller: 'settingsController'
            });
            $urlRouterProvider.otherwise('/home');
        }])
        .run(function ($ionicPlatform, $cordovaSplashscreen, $ionicSideMenuDelegate) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.cordova) {
                $cordovaSplashscreen.hide();
            }
        });
    });
})();

//# sourceMappingURL=app.js.map