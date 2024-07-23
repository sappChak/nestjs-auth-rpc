import { Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  surname: string;

  @Column()
  @Expose()
  email: string;

  @Column({ nullable: true })
  @Expose()
  profile_picture: string;

  @Column()
  @Expose()
  password: string;
}
