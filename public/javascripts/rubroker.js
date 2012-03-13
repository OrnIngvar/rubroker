(function () {
    function Stock(data) {
        this.name = ko.observable(data.name);
        this.price = ko.observable(data.price);
        this.owned = ko.observable(data.owned);
    }

    function StockListViewModel() {
        // Data
        var self = this;
        self.stocks = ko.observableArray([]);
        self.newStockText = ko.observable();
        self.ownedStocks = ko.computed(function () {
            return ko.utils.arrayFilter(self.stocks(), function (stock) {
                return stock.owned()
            });
        });

        // Operations
        self.buyStock = function () {
            self.stocks.push(new Stock({ name:this.newStockText() }));
            self.newStockText("");
        };
        self.sellStock = function (stock) {
            self.stocks.remove(stock)
        };

        // Load initial state from server, convert it to Stock instances, then populate self.stocks
        $.getJSON("/stocks", function (allData) {
            var mappedStocks = $.map(allData, function (item) {
                console.log('in getJson');
                console.log(item);
                return new Stock(item)
            });
            self.stocks(mappedStocks);
        });
    }

    ko.applyBindings(new StockListViewModel());
})();