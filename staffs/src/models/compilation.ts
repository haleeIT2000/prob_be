import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  DataTypes,
} from 'sequelize';
import { types } from '../common';
import { commonFields } from './_common';
import { User } from './user';
import { RoleUser } from './role_user';
import { Year } from './year';

export class Compilation
  extends Model<InferAttributes<Compilation>, InferCreationAttributes<Compilation>> implements types.compilation.Attr {
  declare readonly id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare num_person: number;
  declare total_time: number;
  declare date_decision: Date;
  declare num_decision: string;
  declare number_credit: number;
  declare form_construction: number;
  declare year_id: CreationOptional<number>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  public static ASSOCIATE() {
    Compilation.belongsToMany(User, {through: RoleUser, foreignKey: 'role_able_id'});
    Compilation.belongsTo(Year, { foreignKey: 'year_id', as: 'year' })
  }
}

export default (sequelize: Sequelize, dt: typeof DataTypes) => {
  Compilation.init(
    {
      id: {
        type: dt.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: dt.STRING,
      },
      code: {
        type: dt.STRING,
      },
      num_decision: {
        type: dt.STRING,
        allowNull: true
      },
      date_decision: {
        type: dt.DATE,
      },
      number_credit: {
        type: dt.INTEGER,
      },
      num_person: {
        type: dt.INTEGER,
      },
      total_time: {
        type: dt.INTEGER,
      },
      form_construction: {
        type: dt.INTEGER,
      },
      year_id: {
        type: dt.INTEGER,
      },
      ...commonFields(),
    },
    {
      sequelize,
      name: { singular: 'compilations', plural: 'compilations' },
      tableName: 'compilations',
      underscored: false,
      paranoid: true,
    }
  );

  return Compilation;
};
