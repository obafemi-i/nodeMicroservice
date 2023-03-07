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
require("reflect-metadata");
const connect_1 = require("../src/connectDB/connect");
const product_1 = require("./entity/product");
connect_1.AdminDataSource.initialize().then((db) => {
    const productRepo = db.getRepository(product_1.Product);
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield productRepo.find();
        res.json(products);
    }));
    app.post('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const prods = yield productRepo.create(req.body);
        const results = yield productRepo.save(prods);
        return res.send(results);
    }));
    app.get('/api/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const prod = yield productRepo.findOne({ where: { id: Number(req.params.id) } });
        return res.json(prod);
    }));
    app.put('/api/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const prod = yield productRepo.findOne({ where: { id: Number(req.params.id) } });
        const nums = Number(req.params.id);
        // const prod = await productRepo.findOneBy({id:nums})
    }));
    app.listen(4500, () => {
        console.log("Server is listening on port 4500");
    });
}).catch((err) => {
    console.log(err);
});
