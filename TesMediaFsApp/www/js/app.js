// Ionic Starter App 'virtoshopApp'.
angular.module('virtoshopApp', ['ionic', 'ngResource', 'ion-autocomplete'])
.run(['$ionicPlatform', '$http', 'virtoshopApp.apiConfig', function ($ionicPlatform, $http, apiConfig) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });

    // authenticate the app to api
    //$http.post('http://vc.tes.media/AshtonGate/' + 'account/login/', { userName: apiConfig.username, password: apiConfig.password }).then(function (results) { });
}])

.factory('workContext', function () {
    var retVal = {
        current: { cart: {} },
        update: function (newContext) {
            _.extend(this.current, newContext);
        }
    };
    return retVal;
})

.constant('virtoshopApp.apiConfig', {
    catalogId: '624643eb808d4dee8df4b08d304f8de8',
    // :storeId/storefrontapi/
    //baseUrl: 'Clothing/storefrontapi/'
    baseUrl: 'http://vc.tes.media/AshtonGate/storefrontapi/'
})

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // Home screen
    .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html'
        //controller: 'HomeCtrl'
    })

    // View category
    .state('category', {
        url: "/categories/:id/:name",
        templateUrl: 'templates/category.html',
        controller: 'categoryController'
    })

    // Product detail
    //.state('product', {
    //    url: '/product/:id/:name',
    //    templateUrl: 'templates/category.html',
    //    controller: 'categoryController'
    //})

    // Cart detail
    .state('cart', {
        url: '/cart',
        templateUrl: 'templates/cart.html',
        controller: 'cartController'
    })

    // Checkout steps
    // Address
    .state('checkout_address', {
        url: '/checkout/address',
        templateUrl: 'templates/checkout-address.html',
        controller: 'checkoutAddressController'
    })

    // Shipping
    .state('checkout_shipping', {
        url: '/checkout/shipping',
        templateUrl: 'templates/checkout-shipping.html',
        controller: 'checkoutShippingController'
    })

    // Payment
    .state('checkout_payment', {
        url: '/checkout/payment',
        templateUrl: 'templates/checkout-payment.html',
        controller: 'checkoutPaymentController'
    })

    // thanks for ordering
    .state('checkout_thanks', {
        url: '/checkout/thanks',
        templateUrl: 'templates/checkout-thanks.html',
        controller: 'checkoutThanksController'
    })

     //login screen
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'AuthCtrl' 
    })
        // register screen
         .state('register', {
             url: '/register',
             templateUrl: 'templates/register.html',
             controller: 'AuthCtrl'
         })


    
    .state('myDetails', {
        url: '/myDetails',
        templateUrl: 'templates/myDetails.html',
        //controller: 'AuthCtrl'
    })
      .state('myAccount', {
        url: '/myAccount',
        templateUrl: 'templates/myAccount.html',
        //controller: 'AuthCtrl'
      })
       
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

    // Disable views cache globally
    $ionicConfigProvider.views.maxCache(0);
}]);
