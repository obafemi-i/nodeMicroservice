"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDataSource = void 0;
const typeorm_1 = require("typeorm");
const product_1 = require("../entity/product");
require('dotenv').config();
exports.AdminDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.DBPORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    logging: false,
    entities: [product_1.Product]
});
