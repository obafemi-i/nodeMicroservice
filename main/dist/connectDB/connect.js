"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainDataSource = void 0;
const typeorm_1 = require("typeorm");
const product_1 = require("../entity/product");
require('dotenv').config();
exports.MainDataSource = new typeorm_1.DataSource({
    url: process.env.MONGO_URI,
    type: "mongodb",
    host: process.env.HOST,
    port: Number(process.env.MONGO_PORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    logging: false,
    entities: [product_1.Product]
});
