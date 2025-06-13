import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './enumetations/role.enumeration';
import { Location } from '../../location/entities/location.entity';
import { FollowUp } from '../../follow-up/entities/follow-up.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    idUser: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.LOCATION,
    })
    rol: Role;

    @Column({ type: 'varchar', length: 255, nullable: true })
    recoveryToken?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    recoveryTokenExpiresAt?: Date | null;

    // Un usuario puede tener muchas localizaciones guardadas
    @OneToMany(() => Location, (location) => location.user, { cascade: true })
    locations: Location[];

    // Relación para saber a quiénes sigue este usuario
    @OneToMany(() => FollowUp, (followUp) => followUp.follower, {
        cascade: true,
    })
    following: FollowUp[];

    // Relación para saber quiénes siguen a este usuario
    @OneToMany(() => FollowUp, (followUp) => followUp.followed, {
        cascade: true,
    })
    followers: FollowUp[];

    /**
     * Hook que se ejecuta automáticamente antes de insertar un nuevo usuario
     * en la base de datos para encriptar la contraseña.
     */
    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
}