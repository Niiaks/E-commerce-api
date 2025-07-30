import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class DbEntity {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
