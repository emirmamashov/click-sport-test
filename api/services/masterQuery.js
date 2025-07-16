module.exports = (app) => {
    const db = app.get('db');
    const masterQuery = {};

    masterQuery.add = async (modelName, data) => {
        if (!modelName || !data) {
            console.log('/services/masterQuery.js -> error: Parameters not valid');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }
        let newModel = await new model(data).save();
        return newModel;
    };

    masterQuery.edit = async (modelName, data) => {
      if (!modelName || !data || !data._id) {
        console.log('/services/masterQuery.js -> error: Parameters not valid.');
        return;
      }
      const model = db[modelName];
      if (!model) {
        console.log('/services/masterQuery.js -> error: Model not found.');
        return;
      }
      return await model.findOneAndUpdate({_id: data._id, isRemoved: { $ne: true }}, data);
    };

    masterQuery.arhive = async (modelName, data) => {
        if (!modelName || !data || !data._id) {
            console.log('/services/masterQuery.js -> error: Parameters not valid.');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }
        return await model.findOneAndUpdate({_id: data._id, isRemoved: { $ne: true }}, { $set: { isRemoved: true } });
    };

    masterQuery.getAll = async function (modelName, data) {
        data = data || {};
        if (!modelName) {
            console.log('/services/masterQuery.js -> error: Parameters not valid.');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }

        let query = data.query || {};
        const options = {
            page: parseInt(data.page) || 1,
            limit: parseInt(data.limit) || 30,
        };

        if (data.populate) {
            // { path: 'responsibleUser', select: 'first_name last_name' };
            // [{ path: 'city'}, { path: 'interests'}]
            options.populate = data.populate;
        }
        if (data.sort) {
            options.sort = data.sort;
        }

        /*if (textSearch) {
            const regex = new RegExp('^' + textSearch, 'i'); // ищет только начальное совпадение
            const regex2 = new RegExp('\\ ' + textSearch, 'i'); // ищет слова с пробелСлова = \ слова/i
            query = {
                $or: [
                    { name: regex },
                    { name: regex2 }
                ]
            }
        }*/
        if (!query.isRemoved) query.isRemoved = { $ne: true };

        return await model.paginate(query, options);
    };

    masterQuery.groupBy = async function(modelName, data) {
        data = data || {};
        if (!modelName) {
            console.log('/services/masterQuery.js -> error: modelName is null');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: model not found!');
            return;
        }
        if (!data.group) {
            console.log('/services/masterQuery.js -> error: data.group is null');
            return;
        }
        let aggregate = model.aggregate();
        if (data.lookup) {
            aggregate.lookup(data.lookup);
        }
        let match = { isRemoved: { $ne: true } }
        if (data.match) {
            match = {...match, ...data.match};
        }
        aggregate.match(match);
        aggregate.group(data.group); //{_id: '$cityId', date: {$last: "$createdAt"}, count: { $sum: 1 }}
        if (data.sort) {
            aggregate.sort(data.sort);
        }
        const options = {
            page: data.page ? data.page : 1,
            limit: data.limit ? data.limit : 30
        };

        return await model.aggregatePaginate(aggregate, options);
    };

    masterQuery.remove = async function (modelName, data) {
      if (!modelName || !data || !data._id) {
          console.log('/services/masterQuery.js -> error: Parameters not valid.');
          return;
      }
      const model = db[modelName];
      if (!model) {
          console.log('/services/masterQuery.js -> error: Model not found.');
          return;
      }
      return await model.findByIdAndRemove(data._id);
    };

    masterQuery.removeAll = async function (modelName, data) {
        if (!modelName || !data || !data.query) {
            console.log('/services/masterQuery.js -> error: Parameters not valid.');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }
        return await model.remove(data.query);
    };

    masterQuery.getBy = async function (modelName, query) {
        if (!modelName || !query) {
            console.log('/services/masterQuery.js -> error: Parameters not valid.');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }
        query.isRemoved = { $ne: true };
        return await model.find(query);
    };

    masterQuery.getOneBy = async function (modelName, data) {
        if (!modelName || !data || !data.query) {
            console.log('/services/masterQuery.js -> error: Parameters not valid.');
            return;
        }
        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }
        data.query.isRemoved = { $ne: true };
        //data.populate=[{ path: 'cityId', select: 'name _id' }, { path: 'rangeId', select: 'name _id' }];
        if (data.populate) {
            return await model.findOne(data.query).populate(data.populate);
        }
        return await model.findOne(data.query);
    };

    masterQuery.getLast = async function (modelName, data) {
        if (!modelName || !data || !data.sort) {
            console.log('/services/masterQuery.js -> error: Parameters not valid.');
            return;
        }

        const model = db[modelName];
        if (!model) {
            console.log('/services/masterQuery.js -> error: Model not found.');
            return;
        }

        let query = data.query || {};
        query.isRemoved = { $ne: true };
        if (data.populate) {
            return await model.find(query).sort(data.sort).limit(1).populate(data.populate);
        }

        return await model.find(query).sort(data.sort).limit(1);
    };

    app.set('masterQuery', masterQuery);
};
