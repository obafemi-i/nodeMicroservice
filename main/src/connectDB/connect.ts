import { DataSource } from "typeorm"
import { Product } from "../entity/product"

require('dotenv').config();

export const MainDataSource = new DataSource({
    url:process.env.MONGO_URI,
    type: "mongodb",
    host: process.env.HOST,
    port: Number(process.env.MONGO_PORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    logging: false,
    entities: [Product]
});