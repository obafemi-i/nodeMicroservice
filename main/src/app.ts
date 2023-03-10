import express from "express";
import { Request, Response } from "express";
import amqp, { Channel, Connection, Message } from 'amqplib/callback_api'

require('dotenv').config();
import "reflect-metadata"

import { MainDataSource } from './connectDB/connect';
import axios from "axios";
import { Product } from "./entity/product";



const port = process.env.PORT || 2200
const dataBase = String(process.env.MONGO_URI)
const amqpConnect = String(process.env.AMQP)



MainDataSource.initialize().then((db) => {
    
    const productRepo = db.getRepository(Product)
    amqp.connect(amqpConnect,(error0, connection:Connection)=>{
        if(error0){
            throw error0
        };
        connection.createChannel((error1, channel:Channel)=>{
            if(error1){
                throw error1
            }
            channel.assertQueue('Product_created', {durable:false})
            channel.assertQueue('Product_updated', {durable:false})
            channel.assertQueue('Product_deleted', {durable:false})


            const app = express()

            app.use(express.json())

            // channel for created product
            channel.consume('Product_created', async (msg:Message | null)=>{
                if(!msg){
                    throw new Error('No such message')
                }
                const eventProduct:Product = JSON.parse(msg.content.toString());
                const product = new Product()
                product.admin_id = Number(eventProduct.id)
                product.title = eventProduct.title
                product.image = eventProduct.image
                product.likes = eventProduct.likes

                await productRepo.save(product)
                console.log('Product succesfully created');

            }, {noAck:true})

            // channel for updated product
            channel.consume('Product_updated', async(msg:Message | null)=>{
                if(!msg){
                    throw new Error('No such error')
                }
            const eventProduct:Product = JSON.parse(msg.content.toString());
            // const prod = await productRepo.findOne({createdBy:parseInt(eventProduct.id)})
            const prod = await productRepo.findOne({where:{admin_id:Number(eventProduct.id)}})
            if(!prod){
                throw new Error('No such id')
            }
            productRepo.merge(prod, {
                title:eventProduct.title,
                image:eventProduct.image,
                likes:eventProduct.likes
            });

            await productRepo.save(prod);
            console.log('Product updated successfully');
            },{noAck:true});


            // channel for deleted product
            channel.consume('Product_deleted',async (msg:Message | null) => {
                if(!msg){
                    throw new Error('No such id')
                }
                const createdBy = parseInt(msg.content.toString())
                await productRepo.delete(createdBy)

                console.log('Deleted successfully');
            })


            // internal api call to update likes of products
            app.post('/api/products/:id/likes', async(req:Request,res:Response)=>{
                const prod = await productRepo.findOne({where:{id:Number(req.params.id)}})

                await axios.post(`http://localohost/api/products/${prod?.admin_id}/likes`,{})
                if(!prod){
                    throw new Error('No such id')
                }
                prod.likes++
                productRepo.save(prod)
                return res.send(prod)
            })
            app.listen(port, ()=>{console.log(`Server is listening on port ${port}`);
            })
            process.on('beforeExit', ()=>{
                console.log('Closing rabbitMQ connection...');
                connection.close()
            })
        })
    })
}).catch((err) => {
    console.log(err);
});