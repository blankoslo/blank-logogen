var express = require('express');
var cors = require('cors');

var app = express();

app.set('view engine', 'hbs');
app.set('views', './src/views');
app.use('/static', express.static('./src/static'));
app.use(cors());
app.options('*', cors());

var Config = require('./diamondConfig.js');

app.get('/diamant.svg', (req, res) => {
    var config = new Config();

    if (req.query.color)
        config.setColor(req.query.color);
    if (req.query.seed)
        config.setShapeFromString(req.query.seed);

    res.set('Content-Type', 'image/svg+xml');
    res.render('diamant-svg', config);
});

var server = app.listen(process.env.PORT || 3003, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
