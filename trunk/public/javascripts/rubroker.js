(function () {
    function Stock(data) {
        this.name = ko.observable(data.name);
        this.price = ko.observable(data.price);
        this.isOwned = ko.observable(data.isOwned);
    }

    function StockListViewModel() {
        // Data
        var self = this;
        self.stocks = ko.observableArray([]);
        self.newStockText = ko.observable();
        self.ownedStocks = ko.computed(function () {
            return ko.utils.arrayFilter(self.stocks(), function (stock) {
                return stock.isOwned()
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

    ko.applyBindings(new StockListViewModel());

    now.name = prompt("What's your name?", "");
    now.receiveMessage = function (name, message) {
        $("#messages").append("<br>" + name + ": " + message);
    }

    $("#send-button").click(function () {
        now.distributeMessage($("#text-input").val());
        $("#text-input").val("");
    });

})();