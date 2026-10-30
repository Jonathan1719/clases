
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "integer" })
    age: number;

    @Column({ type: "varchar", nullable: true })
    name: string | null;

    @Column({ type: "varchar", nullable: true })
    email: string | null;

    @Column({ type: "varchar", nullable: true, select: false })
    password: string | null;
}

 

