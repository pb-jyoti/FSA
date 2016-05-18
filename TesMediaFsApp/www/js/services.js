angular.module('virtoshopApp')
.factory('authAPI', ['$resource', 'virtoshopApp.apiConfig', function ($resource, apiConfig) {
    return $resource(apiConfig.baseUrl + 'account/login', { id: '@id' }, {
        login: { method: 'POST' },
        logout: { url: apiConfig.baseUrl + 'logout', method: 'POST' },
        register: { method: 'POST' }
    });
}])

.factory('searchAPI', ['$resource', 'virtoshopApp.apiConfig', function ($resource, apiConfig) {
    return $resource(null, { id: '@id' }, {
        categoriesSearch: { url: apiConfig.baseUrl + 'categories/search', method: 'POST' },
        search: { url: apiConfig.baseUrl + 'catalog/search', method: 'POST' },
        getActualProductPrices: { url: apiConfig.baseUrl + 'pricing/actualprices', method: 'POST', isArray: true },
        searchProducts: { url: apiConfig.baseUrl + 'search' },
        getProducts: { url: apiConfig.baseUrl + 'products', isArray: true }
    });
}])

.factory('cartAPI', ['$resource', 'virtoshopApp.apiConfig', function ($resource, apiConfig) {
    return $resource(apiConfig.baseUrl + 'cart', null, {
        getCart: {},
        addLineItem: { url: apiConfig.baseUrl + 'cart/items', method: 'POST' },
        changeLineItem: { url: apiConfig.baseUrl + 'cart/items', method: 'PUT' },
        removeLineItem: { url: apiConfig.baseUrl + 'cart/items', method: 'DELETE' },
        // query: { isArray: true },
        // update: { method: 'PUT' },
        getCountries: { url: apiConfig.baseUrl + 'countries', isArray: true },
        getCountryRegions: { url: apiConfig.baseUrl + 'countries/:countryCode/regions', isArray: true },
        getAvailableShippingMethods: { url: apiConfig.baseUrl + 'cart/shipments/:shipmentId/shippingmethods', isArray: true },
        addOrUpdateShipment: { url: apiConfig.baseUrl + 'cart/shipments', method: 'POST' },
        getAvailablePaymentMethods: { url: apiConfig.baseUrl + 'cart/paymentmethods', isArray: true },
        setPaymentMethod: { url: apiConfig.baseUrl + 'cart/payments', method: 'POST' },
        createOrder: { url: apiConfig.baseUrl + 'cart/createorder', method: 'POST' }
    });
}])
;
