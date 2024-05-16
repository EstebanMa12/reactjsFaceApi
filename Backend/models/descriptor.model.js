const mongoose = require('mongoose');

const ValueSchema = new mongoose.Schema({
    descriptors: {
        type: Array,
        required: true
    },
    name: {
        type: String,
        required: true
    }
},{
    collection: 'descriptors'
})

const Descriptor = mongoose.model('Descriptor', ValueSchema);

module.exports = Descriptor;
