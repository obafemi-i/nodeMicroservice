import express from 'express'
import * as cors from 'cors'
 
import "reflect-metadata"
import {AdminDataSource} from "../src/connectDB/connect"
import { Product } from './entity/product';


AdminDataSource.initialize().then((db) => {
    const productRepo = db.getRepository(Product)

    const app = express()
    
    app.use(express.json())
    
    app.get('/api/products', async (req,res)=>{
        const products = await productRepo.find()
        res.json(products)
    })

    app.post('/api/products', async (req,res)=>{
        const prods = await productRepo.create(req.body)
        const results = await productRepo.save(prods);
        
        return res.send(results);
    });

    app.get('/api/products/:id', async (req,res)=>{
        const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})
        return res.json(prod)
    });

    app.put('/api/products/:id', async (req,res)=>{
        const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})
        const nums = Number(req.params.id)
        // const prod = await productRepo.findOneBy({id:nums})

    });

    app.delete('/api/products/:id', async (req,res)=>{
        const prod = await productRepo.delete(req.params.id)
        return res.json(prod)
    });


    app.post('/api/products/:id/likes', async (req,res)=>{
        const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})
        // const prod = await productRepo.findOne(req.params.id)

        prod.likes++
        return res.json(prod)
    });





    app.listen(4500, ()=>{console.log("Server is listening on port 4500");
    })
}).catch((err) => {
    console.log(err);
});