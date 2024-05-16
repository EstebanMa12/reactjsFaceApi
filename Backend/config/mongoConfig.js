const mongoose = require('mongoose')

const connect = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("[database]: Connected to the database: ", db.connection.name);
    } catch (error) {
        console.error('[database]: Error connecting to the database', error)
        
    }

}

module.exports = {
    connect
}