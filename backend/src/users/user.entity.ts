import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole   { PLAYER='player', CAPTAIN='captain', FAN='fan', ORGANISER='organiser', ADMIN='admin' }
export enum UserStatus { PENDING='pending', APPROVED='approved', REJECTED='rejected', BANNED='banned' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true })       phone: string;
  @Column({ nullable: true })     email: string;       // gmail for password reset
  @Column({ nullable: true })     password: string;
  @Column()                       name: string;
  @Column({ type: 'varchar', default: UserRole.PLAYER })   role: UserRole;
  @Column({ type: 'varchar', default: UserStatus.PENDING }) status: UserStatus;
  @Column({ nullable: true })     profilePicture: string;
  @Column({ nullable: true })     address: string;
  @Column({ nullable: true })     remarks: string;
  @CreateDateColumn()             createdAt: Date;
  @UpdateDateColumn()             updatedAt: Date;
}
