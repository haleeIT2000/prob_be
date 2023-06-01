import { FindAndCountOptions, Op, WhereOptions, literal } from 'sequelize';
import { types } from '../common';
import { DB } from './../models';
import BaseRepository from './_base';
import { TypeRoleUser } from '../common/factory/_common';
import { FORM_CONSTRUCTION } from '../common/constant';

export default class Education extends BaseRepository {
  private readonly model: DB['Education'];
  private readonly modelRole: DB['Role'];
  private readonly modelUser: DB['User'];
  private readonly modelYear: DB['Year'];
  private readonly modelRoleAble: DB['RoleAble'];
  private readonly modelRoleUser: DB['RoleUser'];
  constructor(db: DB) {
    super(db);

    this.model = db.Education;
    this.modelRole = db.Role;
    this.modelUser = db.User;
    this.modelYear = db.Year;
    this.modelRoleAble = db.RoleAble;
    this.modelRoleUser = db.RoleUser;
  }

  public findOneById = async (id: string | number) => {
    const data = await this.model.findByPk(id);

    return data?.dataValues;
  };

  public detail = async (id: string | number) => {
    const education = await this.model.findOne({
      where: {
        id,
      },
      include: [
        {
          model: this.modelUser,
          through: { attributes: ['time', 'type'], as: 'role_user',
          where: {
            type_role: 6
          } },
          attributes: ['id', 'name'],
        },
        {
          model : this.modelYear,
          as: 'year',
          attributes: ['id', 'name'],
        }
      ],
      order: [
        [literal('`users->role_user`.`type`'), 'ASC']
      ]
    });
    const data = {
      ...education?.dataValues
    }
    return data;
  };

  public search = async (params: types.education.EducationSearchParam) => {
    // const a: = this.makeMultipleAmbiguousCondition(params, 'search', ['name', 'code']);
    const findOption: FindAndCountOptions = {
      include: [],
    };

    if (params !== undefined) {
      const andArray: WhereOptions[] = [];
      if (params.search !== undefined) {
        andArray.push(
          this.makeMultipleAmbiguousCondition(params, 'search', ['code', 'name'])
        );
      }
      findOption.where = {
        [Op.and]: andArray,
      };

      if (params.sort !== undefined) {
        if (`${params.sort}`.toLowerCase() === 'desc') {
          findOption.order = [
            [params.sortColumn ? params.sortColumn : 'createdAt', 'DESC']
          ];
        } else {
          findOption.order = [
            [params.sortColumn ? params.sortColumn : 'createdAt', 'ASC']
          ];
        }
      } else {
        findOption.order = [['createdAt', 'DESC']];
      }
    }
    const educations = this.model.findAndCountAll(findOption);

    return educations;
  };
  public create = async (params: types.education.EducationCreateParam) => {
    const transaction = await this.db.sequelize.transaction();
    try {
      const roleUser = params.role;
      const roleUserArray: string[] = roleUser.split(',');
      var totalTime: number;
      var timeMember: number;
      switch (params.form_construction) {
        case 0:
          totalTime = 3.75 * params.num_credit;
          break;
        case 1:
          totalTime = 11.5 * params.num_credit;
          break;
        case 2:
          totalTime = 1.5 * params.num_credit;
          break;
        case 3:
          totalTime = 3.5 * params.num_credit;
          break;
        default:
          totalTime = 0;
          break;
      }
      timeMember = totalTime / roleUserArray.length;
      const education = await this.model.create(
        {
          name: params.name,
          code: params.code,
          num_credit: params.num_credit,
          num_person: roleUserArray.length,
          total_time: totalTime,
          form_construction: params.form_construction,
          num_decision: params.num_decision,
          date_decision: params.date_decision,
          year_id: params.year_id,
        },
        { transaction }
      );

      const role = await this.modelRole.findOne({
        where: {
          type: params.type
        }
      });
      if (role) {
        await this.modelRoleAble.create({
          role_id: role.id,
          role_able_id: education.dataValues.id,
          type: params.type,
          time: String(totalTime),
        })
        roleUserArray.forEach(async (roleUser, index) => {
          let type = TypeRoleUser.member;
          await this.modelRoleUser.create({
            role_able_id: education.dataValues.id,
            user_id: Number(roleUser),
            type: type,
            type_role: params.type,
            time: timeMember,
          })
        })
      }

      await transaction.commit();

      return education.dataValues;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  public update = async (
    params: types.education.EducationUpdateParam,
    educationId: number | string
  ) => {
    const transaction = await this.db.sequelize.transaction();
    try {
      const roleUser = params.role;
      const roleUserArray: string[] = roleUser.split(',');
      var totalTime: number;
      var timeMember: number;
      switch (params.form_construction) {
        case 0:
          totalTime = 3.75 * params.num_credit;
          break;
        case 1:
          totalTime = 11.5 * params.num_credit;
          break;
        case 2:
          totalTime = 1.5 * params.num_credit;
          break;
        case 3:
          totalTime = 3.5 * params.num_credit;
          break;
        default:
          totalTime = 0;
          break;
      }
      timeMember = totalTime / roleUserArray.length;
      const educationUpdate = await this.findById(educationId);
      if (educationUpdate) {
        const education = await educationUpdate.update(
          {
            name: params.name,
            code: params.code,
            num_credit: params.num_credit,
            num_person: params.num_person,
            total_time: totalTime,
            form_construction: params.form_construction,
            num_decision: params.num_decision,
            date_decision: params.date_decision,
            year_id: params.year_id,
          },
          { transaction }
        );
        const roleAble = await this.modelRoleAble.findOne({
          where: {
            role_able_id: educationUpdate.id,
            type: params.type,
          }
        });
        roleAble?.set({
          time: String(totalTime)
        })
        roleAble?.save();
        if (roleUser !== '') {
          const role = await this.modelRole.findOne({
            where: {
              type: params.type
            }
          });

          // roleUserDelete.
          const object = await this.modelRoleUser.destroy({
            where: {
              role_able_id: educationUpdate.dataValues.id,
              type: TypeRoleUser.member,
              type_role: params.type,
            },
            force: true
          })
          if (role) {
            for (let index = 0; index < roleUserArray.length; index++) {
              await this.modelRoleUser.upsert({
                role_able_id: education.dataValues.id,
                user_id: Number(roleUserArray[index]),
                type: TypeRoleUser.member,
                type_role: params.type,
                time: timeMember,
              })
            }
          }
        }
        await transaction.commit();

        return education.dataValues;
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  public delete = async (educationId: number | string) => {
    const transaction = await this.db.sequelize.transaction();

    try {
      const education = this.model.destroy({
        where: {
          id: educationId,
        },
      });
      await this.modelRoleUser.destroy({
        where: {
          role_able_id: educationId,
        },
        // force: true
      })

      return education;
    } catch (error) {
      throw error;
    }
  };

  public findById = async (educationId: string | number) => {
    return await this.model.findByPk(educationId);
  };
  
  public export = async (userId: string | number) => {
    const educations: any = await this.model.findAll({
      include: [
        {
          model: this.modelUser,
          through: {
            attributes: ['time', 'user_id', 'type', 'type_role'],
            as: 'role_user',
            where: {
              type_role: 6,
              user_id: userId,
            }
          }
        }
      ],
      raw: true,
    })

    const educationFormats = educations.map((education: any) => {
      let type = FORM_CONSTRUCTION.find(form => form.value == education.form_construction)?.label;
      
      return {
        ...education,
        type: type,
      }
    })

    return educationFormats;
  }
}
