const mongoose = require('mongoose');
const glob = require('glob');

const config = require('./config');
// mongoose.set('debug', true);

db = {
    connect: (databaseUrl) => {
        const mongooseOpts = {
            useNewUrlParser: true,
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
            poolSize: 10,
        };
        return mongoose.connect(databaseUrl, mongooseOpts);
    }
};

let models = glob.sync(config.MODELS_URL);
models.forEach((model) => {
    require(model)(db);
});

module.exports = db;
