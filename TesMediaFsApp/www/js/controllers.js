angular.module('virtoshopApp')

// Home controller
.controller('HomeCtrl', ['$scope', 'searchAPI', 'cartAPI', 'workContext', 'virtoshopApp.apiConfig', function ($scope, searchAPI, cartAPI, workContext, apiConfig) {
    // slider images
    $scope.slides = [
      { url: 'img/slide_1.jpg' },
      { url: 'img/slide_2.jpg' },
      { url: 'img/slide_3.jpg' }
    ];

    cartAPI.getCart(function (result) {
        $scope.cart = workContext.current.cart = result;
    });

    // list categories
    searchAPI.categoriesSearch({
        catalogId: apiConfig.catalogId,
        sortBy: "Priority",
        categoryId: "",
        searchInChildren: false
    }, function (data) {
        $scope.entries = data.categories;
        $scope.categoryId = data.categories[0].id;
        // workContext.update(data);

        //list subcategories
        searchAPI.categoriesSearch({
            catalogId: apiConfig.catalogId,
            categoryId: $scope.categoryId,
            sortBy: "Priority",
            searchInChildren: true
        }, function (subCategory) {
            $scope.subcategories = subCategory.categories[0].name;
        },
        function (error) { console.log(error); });
    },
        function (error) { console.log(error); });

    $scope.search = { keyword: undefined };
    $scope.searchByKeyword = function () {
        searchAPI.searchProducts({ q: $scope.search.keyword }, function (data) {
            // $scope.entries = data.products;
        },
            function (error) { console.log(error); });
    };
}])

// Category controller
.controller('categoryController', ['$scope', '$timeout', '$stateParams', 'workContext', 'searchAPI', 'cartAPI', 'virtoshopApp.apiConfig', function ($scope, $timeout, $stateParams, workContext, searchAPI, cartAPI, apiConfig) {
    $scope.name = $stateParams.name;
    var allVariations = [];
    $scope.selectedVariation = { name: $stateParams.name };
    $scope.allVariationPropsMap = {};

    //pagination settings
    var pageSettings = $scope.pageSettings = {};
    pageSettings.totalItems = 0;
    pageSettings.currentPage = 1;
    pageSettings.itemsPerPageCount = 20;


    $scope.loadNextPage = function () {
        pageSettings.currentPage++;
        loadDataPage();
    };
    $scope.addToCart = function (productId, quantity) {
        var cart = workContext.current.cart;
        //var initialItems = angular.copy(cart.items);
        //$scope.isCartModalVisible = true;
        //$scope.isUpdating = true;
        cartAPI.addLineItem({ id: productId, quantity: quantity }, function (result) {
            cart.itemsCount = result.itemsCount;

        });

    };

    function initialize() {
        searchAPI.getProducts({ productIds: [$stateParams.id] }, function (data) {
            var product = data[0];
            //Current product is also a variation (titular)
            allVariations = [product].concat(product.variations);
            $scope.allVariationPropsMap = getFlatternDistinctPropertiesMap(allVariations);

            //Auto select initial product as default variation  (its possible because all our products is variations)
            var propertyMap = getVariationPropertyMap(product);
            _.each(_.keys(propertyMap), function (x) {
                $scope.checkProperty(propertyMap[x][0])
            });
            $scope.selectedVariation = product;
            $ionicSlideBoxDelegate.update();
        },
          function (error) { console.log(error); });
    }

    //Method called from View when user clicks one property value
    $scope.checkProperty = function (property) {
        //Select appropriate property and unselect previous selection
        _.each($scope.allVariationPropsMap[property.displayName], function (x) {
            x.selected = x === property;
        });

        //try to find the best variation match for selected properties
        $scope.selectedVariation = findVariationBySelectedProps(allVariations, getSelectedPropsMap($scope.allVariationPropsMap));
        $ionicSlideBoxDelegate.update();
    };

    // generate array from number
    $scope.range = function (n) {
        return new Array(n);
    };

    function getFlatternDistinctPropertiesMap(variations) {
        var retVal = {};
        _.each(variations, function (variation) {
            var propertyMap = getVariationPropertyMap(variation);
            //merge
            _.each(_.keys(propertyMap), function (x) {
                retVal[x] = _.uniq(_.union(retVal[x], propertyMap[x]), "value");
            });
        });
        return retVal;
    }

    function findVariationBySelectedProps(variations, selectedPropMap) {
        return _.find(variations, function (x) {
            return comparePropertyMaps(getVariationPropertyMap(x), selectedPropMap);
        });
    }

    function comparePropertyMaps(propMap1, propMap2) {
        return _.every(_.keys(propMap1), function (x) {
            var retVal = propMap2.hasOwnProperty(x);
            if (retVal) {
                retVal = propMap1[x][0].value == propMap2[x][0].value;
            }
            return retVal;
        });
    };

    function getVariationPropertyMap(variation) {
        return _.groupBy(variation.variationProperties, function (x) { return x.displayName });
    }

    function getSelectedPropsMap(variationPropsMap) {
        var retVal = {};
        _.each(_.keys(variationPropsMap), function (x) {
            var property = _.find(variationPropsMap[x], function (y) {
                return y.selected;
            });
            if (property) {
                retVal[x] = [property];
            }
        });
        return retVal;
    }

    initialize();

    function loadDataPage() {
        searchAPI.search({
            catalogId: apiConfig.catalogId,
            categoryId: $stateParams.id,
            page: pageSettings.currentPage
            //skip: (pageSettings.currentPage - 1) * pageSettings.itemsPerPageCount,
            //take: pageSettings.itemsPerPageCount
        }, function (productsResult) {
            pageSettings.totalItems = productsResult.metaData.totalItemCount;
            if (pageSettings.currentPage === 1) {
                $scope.entries = productsResult.products;
            } else {
                $scope.entries = $scope.entries.concat(productsResult.products);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

            // request actual prices
            if (_.any(productsResult.products)) {
                var requestParams = _.map(productsResult.products, function (x) {
                    return {
                        catalogId: x.catalogId,
                        categoryId: x.categoryId,
                        id: x.id,
                    };
                });

                searchAPI.getActualProductPrices(requestParams, function (prices) {
                    _.each(prices, function (x) {
                        var item = _.findWhere(productsResult.products, { id: x.productId });
                        if (item) {
                            item.price = x;
                        }
                    });
                });
            }
        }, function (error) { $scope.entries = undefined; console.log(error); });
    }

    loadDataPage();

    var timer;
    $scope.cart = workContext.current.cart;

    //$scope.$on("$ionicView.enter", function (scopes, states) {
    $scope.$on("$ionicView.enter", function () {
        $scope.isUpdating = true;
        $scope.errorOccured = false;
        refreshCart();
    });

    $scope.changeLineItem = function (lineItem, origQty) {
        $timeout.cancel(timer);
        timer = $timeout(function () {
            $scope.isUpdating = true;
            cartAPI.changeLineItem({ lineItemId: lineItem.id, quantity: lineItem.quantity }, function () {
                refreshCart();
            },
            function (response) {
                lineItem.quantity = origQty;
                showErrorMessage(2000);
            });
        }, 200);
    }

    $scope.generateQuantitiesRange = function (seedQuantity) {
        var retval = [];
        var start = Math.max(seedQuantity - 2, 1);
        for (var index = 0; index < 5; index++) {
            retval.push(start + index);
        }
        return retval;
    };


    $scope.generateQuantitiesRange = function (seedQuantity) {
        var retval = [];
        var start = Math.max(seedQuantity - 2, 1);
        for (var index = 0; index < 5; index++) {
            retval.push(start + index);
        }
        return retval;
    };
    function refreshCart() {
        cartAPI.getCart(function (result) {
            angular.copy(result, workContext.current.cart);
            $scope.cart = workContext.current.cart;

            $scope.isUpdating = false;
            //$scope.errorOccured = false;
        });
    }
}])

// Authentication controller
// Put your login, register functions here
.controller('AuthCtrl', ['$scope','$state', '$ionicHistory', 'authAPI', '$http', function ($scope,$state, $ionicHistory, authAPI, $http) {
    // hide back button in next view
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.ageRangesReg = [
     { "Label": "<20" },
      { "Label": "20-29" },
       { "Label": "29-39" },
      { "Label": "39-49" },
       { "Label": "49-59" },
      { "Label": "59-69" },
       { "Label": "70+" }
    ];
    $scope.genderOptionsReg = [
       //{"Label":"Select Gender"},
    { "Label": "male" },
     { "Label": "female" }
    ];

    $scope.login = function () {
        $scope.loginProgress = true;
        $http.post('http://vc.tes.media/AshtonGate/account/login/', { email: $scope.user.email, password: $scope.user.password, rememberMe: true }).then(
			function (results) {
			    $state.go('home');
			});

        authAPI.login({ login: { Email: $scope.user.email, Password: $scope.user.password, rememberMe: true } }, function (results) {
            // changeAuth(results.data);
            $state.go('home');
        }, function (error) {
            // bladeNavigationService.setError('Error ' + error.status, blade);
            $scope.loginProgress = false;
        });
    };

    $scope.register = function () {
        $scope.registerProgress = true;
        $http.post('http://vc.tes.media/AshtonGate/account/register/', { email: $scope.user.email, password: $scope.user.password, rememberMe: true }).then(
			function (results) {
			    $state.go('home');
			});

        authAPI.register({ register: { Email: $scope.user.email, Password: $scope.user.password, rememberMe: true } }, function (results) {
            // changeAuth(results.data);
            $state.go('home');
        }, function (error) {
            // bladeNavigationService.setError('Error ' + error.status, blade);
            $scope.registerProgress = false;
        });
    };

    $scope.user = {};
}]);

   