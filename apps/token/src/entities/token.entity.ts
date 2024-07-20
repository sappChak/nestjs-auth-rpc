import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ type: 'text' })
  refresh_token: string;

  @Column({ type: 'int' })
  @Expose()
  user_id: number;
}
