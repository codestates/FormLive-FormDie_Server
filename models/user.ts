import { DataTypes, Model } from 'sequelize';
import { dbType } from '.'; //typing을 순환참조 하는 것은 문제가 되지 않는다.
import { sequelize } from './sequelize'; //실제로 돌아가는 코드를 순환참조 하는 것은 문제가 된다.

class User extends Model {
  public readonly id!: number;
  public email!: string;
  public name!: string;  
  public password!: string;
  public profileIconURL!: string;
  public isAdmin!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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

export const associate = (db: dbType) => {


};

export default User;