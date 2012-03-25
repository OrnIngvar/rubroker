var express = require('express')
    ,redis_client = require('redis-client').createClient();
var _ = require('underscore')._
var fs = require('fs');

var pub = __dirname + '/public';

var app = module.exports = express.createServer();

var everyone = require('now').initialize(app);

redis_client.on("error", function (err) {
    console.log("error event - " + redis_client.host + ":" + redis_client.port + " - " + err);
});

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
everyone.now.updateStockPrice = function(name, price){everyone.now.recieveNewStockPrice(name, price);};
everyone.now.distributeTimer = function(timer){everyone.now.recieveTimer(timer);};


var future = +new Date()/1000 + 3601;
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
    everyone.now.distributeTimer(time);
}
var timer = setInterval(time_loop, 1000);


// Routes
app.get("/", function(req, res){
    res.render('index', { timer: time });
});

app.get("/stocks", function(req, res){

    // We want to set the content-type header so that the browser understands
    //  the content of the response.
    res.contentType('application/json');

    // Normally, the would probably come from a database, but we can cheat:

    var stocks = [
        { name: 'CRM', price: '45', numowned: 0, isOwned: false },
        { name: 'MSFT', price: '25', numowned: 0, isOwned: false },
        { name: 'ORCL', price: '15', numowned: 0, isOwned: false }
    ];

    // Since the request is for a JSON representation of the people, we
    //  should JSON serialize them. The built-in JSON.stringify() function
    //  does that.
    var stockJSON = JSON.stringify(stocks);

    // Now, we can use the response object's send method to push that string
    //  of people JSON back to the browser in response to this request:
    console.log('stockJSON ', stockJSON);
    res.send(stockJSON);
});

//TODO: Post operation
app.post('/stocks', function(req, res){
    console.log('user ', req.body.user);
    res.redirect('back');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
