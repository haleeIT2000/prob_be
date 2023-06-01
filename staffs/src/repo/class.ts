import { FindAndCountOptions, IncludeOptions, Op, Sequelize, WhereOptions } from 'sequelize';
import { types } from '../common';
import { DB } from './../models';
import BaseRepository from './_base';

export default class ClassRepository extends BaseRepository {
  private readonly model: DB['Classes'];
  private readonly modelUser: DB['User'];
  private readonly modelYear: DB['Year'];
  constructor(db: DB) {
    super(db);

    this.model = db.Classes;
    this.modelUser = db.User;
    this.modelYear = db.Year;
  }

  public findOneById = async (id: string | number) => {
    const data = await this.model.findByPk(id);

    return data?.dataValues;
  };

  public search = async (params: types.classes.ClassSearchParam) => {
    const findOption: FindAndCountOptions = {
      include: [],
      attributes: ['id', 'name', 'code', 'form_teach', 'form_exam', 'num_student', 'semester', 'num_credit', 'num_lesson', 'exam_supervision', 'exam_create', 'marking', 'form_exam', 'startDate', 'endDate'],
    };

    if (params !== undefined) {
      const andArray: WhereOptions[] = [];
      if (params.search !== undefined) {
        andArray.push(
          this.makeMultipleAmbiguousCondition(params, 'search', ['code', 'name'])
        );
      }
      if (params.code) {
        andArray.push(
          this.makeAmbiguousCondition(params, 'code')
        )
      }
      if (params.name) {
        andArray.push(
          this.makeAmbiguousCondition(params, 'name')
        )
      }
      if (params.parent_id !== undefined) {
        if (params.parent_id == true) {
          andArray.push({
            parent_id: {
              [Op.not]: null,
            }
          })
        } else {
          andArray.push({
            parent_id: {
              [Op.is]: null,
            }
          })
        }
      }
      findOption.where = {
        [Op.and]: andArray,
      };
      let include: IncludeOptions[] = []
      if (params.user_id) {
        include.push({
          model: this.modelUser,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          where: {
            id: params.user_id,
          }
        })
      }
      findOption.include = include;
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


    const classes = await this.model.findAndCountAll(findOption);
    return classes;
  };

  public create = async (params: types.classes.ClassCreateParam) => {
    const transaction = await this.db.sequelize.transaction();
    try {
      const classes = await this.model.create(
        {
          subject_id: params.subject_id,
          user_id: params.user_id,
          parent_id: params.parent_id,
          name: params.name,
          code: params.code,
          marking: params.marking,
          exam_create: params.exam_create,
          exam_supervision: params.exam_supervision,
          form_teach: params.form_teach,
          form_exam: params.form_exam,
          num_student: params.num_student,
          num_lesson: params.num_lesson,
          num_credit: params.num_credit,
          classroom: params.classroom,
          startDate: params.startDate,
          endDate: params.endDate,
          level_teach: params.level_teach,
          time_teach: params.time_teach,
          semester: params.semester,
          year_id: params.year_id,
        },
        { transaction }
      );
      await transaction.commit();

      return classes;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  public update = async (
    params: types.classes.ClassUpdateParam,
    classId: number | string
  ) => {
    const transaction = await this.db.sequelize.transaction();
    try {
      const subjectUpdate = await this.findById(classId);
      if (subjectUpdate) {
        const subject = await subjectUpdate.update(
          {
            subject_id: params.subject_id,
            user_id: params.user_id,
            parent_id: params.parent_id,
            name: params.name,
            code: params.code,
            marking: params.marking,
            exam_create: params.exam_create,
            exam_supervision: params.exam_supervision,
            form_teach: params.form_teach,
            form_exam: params.form_exam,
            num_student: params.num_student,
            classroom: params.classroom,
            startDate: params.startDate,
            endDate: params.endDate,
            level_teach: params.level_teach,
            time_teach: params.time_teach,
            semester: params.semester,
            year_id: params.year_id,
          },
          { transaction }
        );
        await transaction.commit();

        return subject.dataValues;
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  public delete = async (classId: number | string) => {
    const transaction = await this.db.sequelize.transaction();

    try {
      const subject = this.model.destroy({
        where: {
          id: classId,
        },
      });

      return subject;
    } catch (error) {
      throw error;
    }
  };

  public findById = async (classId: string | number) => {
    return await this.model.findOne({
      where: { id: classId },
      include: [
        {
          model: this.modelUser,
          attributes: ['name'],
          as: 'user',
        },
        {
          model: this.modelYear,
          attributes: ['name'],
          as: 'year',
        },
      ],
      attributes: ['id', 'subject_id', 'user_id', 'year_id', 'form_teach', 'form_exam', 'name', 'code', 'num_student', 'classroom', 'semester', 'num_credit', 'num_lesson', 'exam_supervision', 'exam_create', 'marking', 'form_exam', 'startDate', 'endDate', 'semester'],
    });
  };

  public dashboard = async (params: { year_id: number | string, user_id?: number | string }) => {
    const findOption: FindAndCountOptions = {};
    const andArray: WhereOptions = [];
    if (params.year_id !== undefined) {
      andArray.push(
        this.makeAmbiguousCondition(params, 'year_id')
      )
    }
    if (params.user_id !== undefined) {
      andArray.push(
        this.makeAmbiguousCondition(params, 'user_id')
      )
    }

    findOption.where = {
      [Op.and]: andArray,
    }
    findOption.order = [['createdAt', 'DESC']];
    findOption.limit = 5

    const classes = this.model.findAndCountAll(findOption);

    return classes;
  }
}
