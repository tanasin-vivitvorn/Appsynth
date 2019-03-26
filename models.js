var shid = require('shortid')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterSchema = Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

var counter = mongoose.model('counter', CounterSchema);

// create a schema for our links
var urlSchema = new Schema({
    _id: { type: Number, index: true },
    short_url: String,
    long_url: String,
    created_at: Date
});

urlSchema.pre('save', function (next) {
    var doc = this;
    counter.findByIdAndUpdate({ _id: 'url_count' }, { $inc: { seq: 1 } }, function (error, counter) {
        if (error)
            return next(error);
        doc.created_at = new Date();
        doc._id = counter.seq;
        doc.short_url = shid.generate();
        next();
    });
});

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;