import { DataSource } from "typeorm"
import { Product } from "../entity/product"

require('dotenv').config();

export const AdminDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.DBPORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    logging: false,
    entities: [Product]
})
