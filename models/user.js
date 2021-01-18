import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize'; //실제로 돌아가는 코드를 순환참조 하는 것은 문제가 된다.
class User extends Model {
}
User.init({
    name: {
        type: DataTypes.STRING(100)
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    profileIconURL: {
        type: DataTypes.STRING(255)
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    charset: 'utf8',
    collate: 'utf8_general_ci'
});
export const associate = (db) => {
};
export default User;
