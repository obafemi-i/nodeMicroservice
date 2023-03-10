import express from 'express'
import amqp, { Channel, Connection } from 'amqplib/callback_api'

require('dotenv').config();

import "reflect-metadata"
import {AdminDataSource} from "./connectDB/connect"

import { Product } from './entity/product';

const amqpConnect = String(process.env.AMQP)

AdminDataSource.initialize().then((db) => {
    const productRepo = db.getRepository(Product)

    amqp.connect(amqpConnect,(error0, connection:Connection)=>{
        if(error0){
            throw error0
        };
        connection.createChannel((error1, channel:Channel)=>{
            if(error1){
                throw error1
            } 
            const app = express()
            
            app.use(express.json())
            
        
            // endpoint for getting all products
            app.get('/api/products', async (req,res)=>{
                const products = await productRepo.find()
                res.json(products)
            })
        
        
            // endpoint for creating a product
            app.post('/api/products', async (req,res)=>{
                const prods = await productRepo.create(req.body)
                const results = await productRepo.save(prods);
                channel.sendToQueue('Product_created', Buffer.from(JSON.stringify(results)))
                
                return res.send(results);
            });
        
        
            // endpoint for getting a single product
            app.get('/api/products/:id', async (req,res)=>{
                const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})
                return res.json(prod)
            });
        
        
            // endpoint for updating a product
            app.put('/api/products/:id', async (req,res)=>{
                const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})
                // const nums = Number(req.params.id)
                // const prod = await productRepo.findOneBy({id:nums})
                if(!prod){
                    throw new Error('No such product with that id')
                }
                productRepo.merge(prod, req.body)
                const results = await productRepo.save(prod);
                channel.sendToQueue('Product_updated', Buffer.from(JSON.stringify(results)))
                return res.send(results);
            });
        
        
            // endpoint for deleting a product
            app.delete('/api/products/:id', async (req,res)=>{
                const prod = await productRepo.delete(req.params.id)
                channel.sendToQueue('Product_deleted', Buffer.from(req.params.id))
                return res.json(prod)
            });
        
        
            // endpoint for increasing number of likes of a product
            app.post('/api/products/:id/likes', async (req,res)=>{
                const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})
                // const prod = await productRepo.findOne(req.params.id)
                if(!prod){
                    throw new Error("No profuct with that id")
                };
                prod.likes++
                const result = productRepo.save(prod)
                return res.json(result)
            });
            
            const port = process.env.PORT
            app.listen(port, ()=>{console.log(`Server is listening on port ${port}`);
            })
            process.on('beforeExit', ()=>{
                console.log('Closing rabbitMQ connection...');
                connection.close()
            });
        })
        })
            
        })

.catch((err) => {
    console.log(err);
});
