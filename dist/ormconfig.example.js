"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var srcConfig = {
    "type": "",
    "host": "",
    "port": 3306,
    "username": "",
    "password": "",
    "database": "",
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
    "type": "",
    "host": "",
    "port": 3306,
    "username": "",
    "password": "",
    "database": "",
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
exports.default = process.env.TS_NODE ? srcConfig : distConfig;
//# sourceMappingURL=ormconfig.example.js.map