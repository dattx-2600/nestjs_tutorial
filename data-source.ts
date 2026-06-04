import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import * as dotenv from 'dotenv';

export const AppDataSource = new DataSource({
    type: (process.env.DB_TYPE || 'mysql') as any,
    host: process.env.DB_HOST || 'mysqldb',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'tutorial_db',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: ['dist/src/migrations/*.js'],
    synchronize: false,
});