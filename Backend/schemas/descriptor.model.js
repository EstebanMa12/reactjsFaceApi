const mongoose = require('mongoose');

const ValueSchema = new mongoose.Schema({
    descriptor: {
        type: Array,
        required: true,
        
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
