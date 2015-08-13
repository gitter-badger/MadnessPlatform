app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: 'html/page/home.html',
        controller: 'homeCtrl'
    })
    .state('settings', {
        url: '/settings',
        templateUrl: 'html/page/settings.html',
        controller: 'settingsCtrl'
    });
    /*.state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "html/template.html"
    })
    .state('tab.search', {
        url: '/search',
        views: {
            'tab-search': {
                templateUrl: 'html/page/search.html',
                controller:  'SearchCtrl'
            }
        }
    })*/

    $urlRouterProvider.otherwise('/home');
});
