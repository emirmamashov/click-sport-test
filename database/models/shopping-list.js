const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

let schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: String, required: true }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});
schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);

const Model = mongoose.model('ShoppingList', schema); // Город
module.exports = (registry) => {
    registry['ShoppingList'] = Model;
};
