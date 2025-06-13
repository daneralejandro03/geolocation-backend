import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'follow_ups' })
export class FollowUp {
    @PrimaryGeneratedColumn()
    idFollowUp: number;

    // El usuario que realiza la acción de seguir
    @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId' })
    follower: User;

    // El usuario que está siendo seguido
    @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followedId' })
    followed: User;
}
