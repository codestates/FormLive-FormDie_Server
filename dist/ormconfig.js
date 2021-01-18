var srcConfig = {
    "type": "mariadb",
    "host": "lovekey.pe.kr",
    "port": 3307,
    "username": "david419kr",
    "password": "aada1141@k",
    "database": "yangsikdang",
    "synchronize": true,
    "logging": false,
    "entities": [
        "src/entity/**/*.ts"
    ],
    "migrations": [
        "src/migration/**/*.ts"
    ],
    "subscribers": [
        "src/subscriber/**/*.ts"
    ],
    "cli": {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
    }
};
var distConfig = {
    "type": "mariadb",
    "host": "lovekey.pe.kr",
    "port": 3307,
    "username": "david419kr",
    "password": "aada1141@k",
    "database": "yangsikdang",
    "synchronize": true,
    "logging": false,
    "entities": [
        "dist/entity/**/*.js"
    ],
    "migrations": [
        "dist/migration/**/*.js"
    ],
    "subscribers": [
        "dist/subscriber/**/*.js"
    ],
    "cli": {
        "entitiesDir": "dist/entity",
        "migrationsDir": "dist/migration",
        "subscribersDir": "dist/subscriber"
    }
};
module.exports = process.env.TS_NODE ? srcConfig : distConfig;
//# sourceMappingURL=ormconfig.js.map