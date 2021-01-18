import User from './user';
//내용은 sequelize.ts에서 작성하고 여기서는 import->export만. 순환참조 방지용
export * from './sequelize';
const db = {
    User,
};
