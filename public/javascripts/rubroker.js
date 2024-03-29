(function () {
    function Stock(data) {
        this.name = ko.observable(data.name);
        this.price = ko.observable(data.price);
        this.numowned = ko.observable(data.numowned);
        this.priceChange = ko.observable(data.priceChange);
        this.total = ko.observable(data.total);
    }

    function StockListViewModel() {
        // Data
        var self = this;
        self.stocks = ko.observableArray([]);
        self.stocksOwned = ko.observableArray([]);
        self.credit = ko.observable(1000);
        self.numBought = ko.observable();
        self.numSell = ko.observable();
        self.newTotal = ko.computed(function() {
            ko.utils.arrayForEach(self.stocksOwned(), function(item){
                item.total(item.numowned() * item.price());
            });
        });
        self.sumTotal = ko.computed(function() {
            var total = 0;
            ko.utils.arrayForEach(self.stocksOwned(), function(item){
                total += item.total();
            });
            return total;
        });

        // Operations
        self.buyStock = function (stock) {
            console.log('num ' + self.numBought());
            var prevNumowned = parseInt(stock.numowned());
            var numBought = parseInt(self.numBought());
            var oldPrice = parseInt(stock.price());
            var newCredit = self.credit() - (numBought * oldPrice);
            var newPrice = Math.round(oldPrice * ( 1 + (Math.pow(numBought,2)/100)));
            if (newCredit >= 0) {
                //stock.price(newPrice);
                self.credit(newCredit);
                now.updateStockPrice(stock.name(), newPrice);
                stock.numowned(prevNumowned + numBought);
                var result = self.stocksOwned.indexOf(stock);
                if (result == -1){
                    self.stocksOwned.push(stock);
                }
            }
            else {
                alert("You don't have enough credit!");
            }
            self.numBought("");
        };
        self.sellStock = function (stock) {
            console.log('num ' + self.numBought());
            var prevNumowned = parseInt(stock.numowned());
            var numSell = parseInt(self.numSell());
            var oldPrice = parseInt(stock.price());
            var newCredit = self.credit() + (numSell * oldPrice);
            var newPrice = Math.round(oldPrice / ( 1 + (Math.pow(numSell,2)/100)));
            if (prevNumowned >= numSell) {
                //stock.price(newPrice);
                now.updateStockPrice(stock.name(), newPrice);
                self.credit(newCredit);
                stock.numowned(prevNumowned - numSell);
                var result = self.stocksOwned.indexOf(stock);
                if (stock.numowned() <= 0 ){
                    self.stocksOwned.remove(stock);
                }
            }
            else {
                alert("You don't have enough stocks to sell!");
            }
            self.numSell("");
        };

        // Load initial state from server, convert it to Stock instances, then populate self.stocks
        $.getJSON("/stocks", function (allData) {
            console.log('allData ', allData);
            var mappedStocks = $.map(allData, function (item) {
                return new Stock(item)
            });
            self.stocks(mappedStocks);
        });
    }
    var stockApp = new StockListViewModel();
    ko.applyBindings(stockApp);

    now.recieveNewStockPrice = function (name, price) {
        console.log('name ' + name + 'price ' + price);
        ko.utils.arrayForEach(stockApp.stocks(), function(item){
            if (item.name() == name) {
                if (price > item.price()){
                    item.priceChange(1);
                }
                else if (price < item.price()){
                    item.priceChange(-1);
                }
                else if (price == item.price()) {
                    item.priceChange(0);
                }
                item.price(price);
            }
            console.log(item.name());
            console.log(item.price());
        });
    };
    now.recieveFinalScore = function(score) {
        now.getFinalScore(stockApp.sumTotal() + stockApp.credit());
    };

    now.recieveWinner = function(winner){
        $('#winner').html("<br>" + "the winner is : " + winner);
    }

})();