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
const axios_1 = __importDefault(require("axios"));
const product_1 = require("./entity/product");
const port = process.env.PORT || 2200;
const dataBase = String(process.env.MONGO_URI);
const amqpConnect = String(process.env.AMQP);
connect_1.MainDataSource.initialize().then((db) => {
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
            channel.assertQueue('Product_created', { durable: false });
            channel.assertQueue('Product_updated', { durable: false });
            channel.assertQueue('Product_deleted', { durable: false });
            const app = (0, express_1.default)();
            app.use(express_1.default.json());
            // channel for created product
            channel.consume('Product_created', (msg) => __awaiter(void 0, void 0, void 0, function* () {
                if (!msg) {
                    throw new Error('No such message');
                }
                const eventProduct = JSON.parse(msg.content.toString());
                const product = new product_1.Product();
                product.admin_id = Number(eventProduct.id);
                product.title = eventProduct.title;
                product.image = eventProduct.image;
                product.likes = eventProduct.likes;
                yield productRepo.save(product);
                console.log('Product succesfully created');
            }), { noAck: true });
            // channel for updated product
            channel.consume('Product_updated', (msg) => __awaiter(void 0, void 0, void 0, function* () {
                if (!msg) {
                    throw new Error('No such error');
                }
                const eventProduct = JSON.parse(msg.content.toString());
                // const prod = await productRepo.findOne({createdBy:parseInt(eventProduct.id)})
                const prod = yield productRepo.findOne({ where: { admin_id: Number(eventProduct.id) } });
                if (!prod) {
                    throw new Error('No such id');
                }
                productRepo.merge(prod, {
                    title: eventProduct.title,
                    image: eventProduct.image,
                    likes: eventProduct.likes
                });
                yield productRepo.save(prod);
                console.log('Product updated successfully');
            }), { noAck: true });
            // channel for deleted product
            channel.consume('Product_deleted', (msg) => __awaiter(void 0, void 0, void 0, function* () {
                if (!msg) {
                    throw new Error('No such id');
                }
                const createdBy = parseInt(msg.content.toString());
                yield productRepo.delete(createdBy);
                console.log('Deleted successfully');
            }));
            // internal api call to update likes of products
            app.post('/api/products/:id/likes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const prod = yield productRepo.findOne({ where: { id: Number(req.params.id) } });
                yield axios_1.default.post(`http://localohost/api/products/${prod === null || prod === void 0 ? void 0 : prod.admin_id}/likes`, {});
                if (!prod) {
                    throw new Error('No such id');
                }
                prod.likes++;
                productRepo.save(prod);
                return res.send(prod);
            }));
            app.listen(port, () => {
                console.log(`Server is listening on port ${port}`);
            });
            process.on('beforeExit', () => {
                console.log('Closing rabbitMQ connection...');
                connection.close();
            });
        });
    });
}).catch((err) => {
    console.log(err);
});
