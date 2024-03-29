var express = require('express');
var _ = require('underscore')._
var fs = require('fs');

var pub = __dirname + '/public';

var app = module.exports = express.createServer();

var everyone = require('now').initialize(app);

// Configuration
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(pub));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

//NowJS stuff
everyone.connected(function(){
    console.log("Joined: " + this.now.name);
});

everyone.disconnected(function(){
    console.log("Left: " + this.now.name);
});

everyone.now.distributeMessage = function(message){everyone.now.receiveMessage(this.now.name, message);};

everyone.now.updateStockPrice = function(name, price){
    for(var i=0;i<stocks.length;i++){
        if (stocks[i].name === name){
            if(stocks[i].price < price){
                stocks[i].priceChange = 1;
            }
            else if(stocks[i].price > price){
                stocks[i].priceChange = -1;
            }else{
                stocks[i].priceChange = 0;
            }
            stocks[i].price = price;
        }
    }
    everyone.now.recieveNewStockPrice(name, price);
};
everyone.now.distributeTimer = function(timer){everyone.now.recieveTimer(timer);};

everyone.now.sendEndOfGame = function(score){
    everyone.now.recieveFinalScore(score);
};

var scor = {};
everyone.now.getFinalScore = function(score){
    var name = this.now.name;
    scor[name] = score;
};

everyone.now.sendWinner = function(winner){
    everyone.now.recieveWinner(winner);
};

function find_winner(){
    console.log('scor ', scor);
    var tmpScore = 0;
    var player = '';

        // show the values stored
    for (var k in scor) {
        if(scor[k] > tmpScore){
            player = k;
            tmpScore = scor[k];
        }
    }
    console.log('winner is ' + player);
    everyone.now.sendWinner(player);
    clearInterval(winner);
}
var winner = setInterval(find_winner,360500);

var future = +new Date()/1000 + 3600;
var time;
function time_loop() {
    var sec = 1000,
        minute = sec*60,
        hour = minute*60,
        day = hour*24,
        d = +new Date(),
        remaining = (future - ~~(d/sec))*sec,
        days_left = ~~(remaining/day),
        hours_left, minutes_left, seconds_left;

    remaining -= days_left*day,
        hours_left = ~~(remaining/hour),
        remaining -= hours_left*hour,
        minutes_left = ~~(remaining/minute),
        remaining -= minutes_left*minute,
        seconds_left = ~~(remaining/sec);

    time = hours_left + ':' + minutes_left + ':' + seconds_left;
    if( hours_left === 0 && minutes_left === 0 && seconds_left === 0){
        //Stop the timer when it goes down to zero
        clearInterval(timer);
        //TODO : Gather all player sumTotals and compare
        everyone.now.sendEndOfGame('0');
    }else{
        everyone.now.distributeTimer(time);
    }
}
var timer = setInterval(time_loop, 1000);

function nextRandomNumber(){
    var hi = this.seed / this.Q;
    var lo = this.seed % this.Q;
    var test = this.A * lo - this.R * hi;
    if(test > 0){
        this.seed = test;
    } else {
        this.seed = test + this.M;
    }
    return (this.seed * this.oneOverM);
}

function RandomNumberGenerator(){
    var d = new Date();
    this.seed = 2345678901 + (d.getSeconds() * 0xFFFFFF) + (d.getMinutes() * 0xFFFF);
    this.A = 48271;
    this.M = 2147483647;
    this.Q = this.M / this.A;
    this.R = this.M % this.A;
    this.oneOverM = 1.0 / this.M;
    this.next = nextRandomNumber;
    return this;
}

function createRandomNumber(Min, Max){
    var rand = new RandomNumberGenerator();
    return Math.round((Max-Min) * rand.next() + Min);
}

function stock_bot() {
    console.log('stock bot is in play');
    var oldPrice = 0;
    //Pick the stock to change
    var rand_stock = createRandomNumber(0,2);
    //Set price percentage change
    var rand_price = createRandomNumber(5,50);
    //Up = 1, down = 0
    var rand_dir = createRandomNumber(0,1);
    if (rand_dir===1){
        console.log('price going up for ', stocks[rand_stock].name);
        oldPrice = stocks[rand_stock].price;
        stocks[rand_stock].price = Math.round( oldPrice * ( 1 + ( rand_price/100 ) ) );
        everyone.now.updateStockPrice(stocks[rand_stock].name, stocks[rand_stock].price);
    }else{
        console.log('price going down for ', stocks[rand_stock].name);
        oldPrice = stocks[rand_stock].price;
        stocks[rand_stock].price = Math.round(oldPrice * (1 - (rand_price/100) ));
        everyone.now.updateStockPrice(stocks[rand_stock].name, stocks[rand_stock].price);
    }
}
var bot = setInterval(stock_bot, 120000);

var stocks = [
    { name: 'CRM', price: '45', numowned: 0, priceChange: 0 },
    { name: 'MSFT', price: '25', numowned: 0, priceChange: 0 },
    { name: 'ORCL', price: '15', numowned: 0, priceChange: 0 }
];

// Routes
app.get("/", function(req, res){
    res.render('index', { timer: time });
});

app.get("/stocks", function(req, res){
    res.contentType('application/json');
    var stockJSON = JSON.stringify(stocks);
//    console.log('stockJSON ', stockJSON);
    res.send(stockJSON);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
