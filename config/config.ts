import * as dotenv from 'dotenv';
dotenv.config();

type Config = {
    username: string,
    password: string,
    database: string,
    host: string,
    port: number,
    [key: string]: string | number
};

interface IConfigGroup {
    development: Config;
    test: Config;
    production: Config;
}

const config: IConfigGroup = {
    "development": {
        "username": "david419kr",
        "password": process.env.DB_PASSWORD!,
        "database": "yangsikdang",
        "host": "lovekey.pe.kr",
        "dialect": "mariadb",
        "port": 3307
    },
    "test": {
        "username": "root",
        "password": process.env.DB_PASSWORD!,
        "database": "yangsikdang",
        "host": "127.0.0.1",
        "dialect": "mariadb",
        "port": 3307
    },
    "production": {
        "username": "root",
        "password": process.env.DB_PASSWORD!,
        "database": "yangsikdang",
        "host": "127.0.0.1",
        "dialect": "mariadb",
        "port": 3307
    }
};

export default config;