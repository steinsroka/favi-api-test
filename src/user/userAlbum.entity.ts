import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserAlbum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  public: boolean;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'dates' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.albums)
  user: User;
}
