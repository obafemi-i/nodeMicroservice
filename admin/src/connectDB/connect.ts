import { DataSource } from "typeorm"
import { Product } from "../entity/product"

export const AdminDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "obafemi",
    password: "",
    database: "nodeadmin",
    synchronize: true,
    logging: false,
    entities: [Product]
})


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