(function () {
    function Stock(data) {
        this.name = ko.observable(data.name);
        this.price = ko.observable(data.price);
        this.numowned = ko.observable(data.numowned);
        this.isOwned = ko.observable(data.isOwned);
    }

    function StockListViewModel() {
        // Data
        var self = this;
        self.stocks = ko.observableArray([]);
        self.stocksOwned = ko.observableArray([]);
        self.credit = 1000;
        self.numBought = ko.observable();

        // Operations
        self.buyStock = function (stock) {
            //console.log('num ' + self.numowned());

            var result = self.stocksOwned.indexOf(stock);
            if (result > -1){
                var prevStock = self.stocksOwned()[result];
                //prevStock.numowned(self.numBought + prevStock.numBought)
                //stock.numowned(stock + self.numowned);
            } else {
                //stock.numowned(self.numowned());
                self.stocksOwned.push(stock);
            }
            self.numBought("");
        };
        self.sellStock = function (stock) {
            self.stocksOwned.remove(stock)
        };

        // Load initial state from server, convert it to Stock instances, then populate self.stocks
        $.getJSON("/stocks", function (allData) {
            console.log('allData ', allData);
            var mappedStocks = $.map(allData, function (item) {
                return new Stock(item)
            });
            self.stocks(mappedStocks);
        });

        self.save = function() {
            amplify.store("stocks", self.stocks);
            /*
             $.ajax("/stocks", {
             data: ko.toJSON({ stocks: self.stocks }),
             type: "post", contentType: "application/json",
             success: function(result) { alert(result) }
             });
             */
        };
    }
    var stockApp = new StockListViewModel();
    ko.applyBindings(stockApp);
//    stockApp.stocks.push(new Stock())

    now.name = prompt("What's your name?", "");


    now.receiveMessage = function (name, message) {
        $("#messages").append("<br>" + name + ": " + message);
    }

    $("#buy-button").click(function () {
        now.distributeMessage($("#text-input").val());
        $("#text-input").val("");
    });

})();