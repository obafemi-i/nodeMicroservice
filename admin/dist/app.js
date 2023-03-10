"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
require('dotenv').config();
require("reflect-metadata");
const connect_1 = require("./connectDB/connect");
const product_1 = require("./entity/product");
const amqpConnect = String(process.env.AMQP);
connect_1.AdminDataSource.initialize().then((db) => {
    const productRepo = db.getRepository(product_1.Product);
    callback_api_1.default.connect(amqpConnect, (error0, connection) => {
        if (error0) {
            throw error0;
        }
        ;
        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }
            const app = (0, express_1.default)();
            app.use(express_1.default.json());
            // endpoint for getting all products
            app.get('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const products = yield productRepo.find();
                res.json(products);
            }));
            // endpoint for creating a product
            app.post('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const prods = yield productRepo.create(req.body);
                const results = yield productRepo.save(prods);
                channel.sendToQueue('Product_created', Buffer.from(JSON.stringify(results)));
                return res.send(results);
            }));
            // endpoint for getting a single product
            app.get('/api/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield productRepo.findOne({ where: { id: Number(req.params.id) } });
                return res.json(prod);
            }));
            // endpoint for updating a product
            app.put('/api/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield productRepo.findOne({ where: { id: Number(req.params.id) } });
                // const nums = Number(req.params.id)
                // const prod = await productRepo.findOneBy({id:nums})
                if (!prod) {
                    throw new Error('No such product with that id');
                }
                productRepo.merge(prod, req.body);
                const results = yield productRepo.save(prod);
                channel.sendToQueue('Product_updated', Buffer.from(JSON.stringify(results)));
                return res.send(results);
            }));
            // endpoint for deleting a product
            app.delete('/api/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield productRepo.delete(req.params.id);
                channel.sendToQueue('Product_deleted', Buffer.from(req.params.id));
                return res.json(prod);
            }));
            // endpoint for increasing number of likes of a product
            app.post('/api/products/:id/likes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield productRepo.findOne({ where: { id: Number(req.params.id) } });
                // const prod = await productRepo.findOne(req.params.id)
                if (!prod) {
                    throw new Error("No profuct with that id");
                }
                ;
                prod.likes++;
                const result = productRepo.save(prod);
                return res.json(result);
            }));
            const port = process.env.PORT;
            app.listen(port, () => {
                console.log(`Server is listening on port ${port}`);
            });
            process.on('beforeExit', () => {
                console.log('Closing rabbitMQ connection...');
                connection.close();
            });
        });
    });
})
    .catch((err) => {
    console.log(err);
});
