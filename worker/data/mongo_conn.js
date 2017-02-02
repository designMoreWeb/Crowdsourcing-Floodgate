const configData = require('./configData');
const MongoClient = require("mongodb").MongoClient;
let mongo_con;

// Connection to db
let mongoConnection = () => {
    if (!mongo_con) {
        mongo_con = MongoClient.connect(configData.dbServer)
            .then((db) => {
                return db;
            });
    }

    return mongo_con;
};

module.exports = mongoConnection();