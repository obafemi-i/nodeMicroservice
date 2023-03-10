import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity()
export class Product {
    @ObjectIdColumn()
    id!: number;

    @Column({unique:true})
    admin_id!:number;

    @Column()
    title!: string;

    @Column()
    image!: string;

    @Column({default:0})
    likes!:number 
}