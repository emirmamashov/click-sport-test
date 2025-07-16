const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const glob = require('glob');

const env = process.env.NODE_ENV || 'prod';
const config = require('./config.js')[env];
const db = require('../database/index');

const app = express();

app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'dev';

db.Promise = global.Promise;
db.connect(config.DB_URL);

app.set('db', db);
app.set('config', config);
app.set('superSecret', config.secret);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const masterQuery = app.get('masterQuery');

require('./services/masterQuery.js')(app);

let middlewares = glob.sync('./middleware/*.js');
middlewares.forEach((middleware) => {
  require(middleware)(app, db);
});

let preRoutes = {};
let filters = glob.sync('./preroutes/*.js');
filters.forEach((filter) => {
  require(filter)(preRoutes, app, db);
});
app.set('filters', preRoutes);

let routes = glob.sync('./routes/*.js');
routes.forEach((route) => {
  require(route)(app, db);
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
