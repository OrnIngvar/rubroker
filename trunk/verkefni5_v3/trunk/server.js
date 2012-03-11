var express = require('express');
var _ = require('underscore')._
var fs = require('fs');

var pub = __dirname + '/public';

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
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

app.get("/", function(req, res){
   res.render('index');
});

app.get("/stocks", function(req, res){
    // We want to set the content-type header so that the browser understands
    //  the content of the response.
    res.contentType('application/json');

    // Normally, the would probably come from a database, but we can cheat:
    var stocks = [
        { name: 'CRM', price: '45' },
        { name: 'MSFT', price: '25' },
        { name: 'ORCL', price: '15' }
    ];

    // Since the request is for a JSON representation of the people, we
    //  should JSON serialize them. The built-in JSON.stringify() function
    //  does that.
    var stockJSON = JSON.stringify(stocks);

    // Now, we can use the response object's send method to push that string
    //  of people JSON back to the browser in response to this request:
    res.send(stockJSON);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);