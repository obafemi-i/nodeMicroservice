"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDataSource = void 0;
const typeorm_1 = require("typeorm");
const product_1 = require("../entity/product");
exports.AdminDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "obafemi",
    password: "",
    database: "nodeadmin",
    synchronize: true,
    logging: false,
    entities: [product_1.Product]
});
// {
//     "type": "postgres",
//     "host": "localhost",
//     "port": 5432,
//     "username": "obafemi",
//     "password": "",
//     "database": "nodeadmin",
//     "synchronize": true,
//     "logging": true,
//     "entities": ["dist/entity/*.js"],
//     "subscribers": [],
//     "migrations": []
// }
