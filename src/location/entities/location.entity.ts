import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'locations' })
export class Location {
    @PrimaryGeneratedColumn()
    idLocation: number;

    @Column({ type: 'double' })
    latitude: number;

    @Column({ type: 'double' })
    longitude: number;

    @CreateDateColumn({ type: 'timestamp' })
    timestamp: Date;

    // Muchas localizaciones pertenecen a un solo usuario
    @ManyToOne(() => User, (user) => user.locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' }) // Especifica el nombre de la columna para la clave foránea
    user: User;
}
