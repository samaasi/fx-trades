import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

export enum EntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('ledgers')
export class Ledger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  transactionId: string;

  @Column()
  userId: string;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: EntryType,
  })
  entryType: EntryType;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  balanceAfter: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
