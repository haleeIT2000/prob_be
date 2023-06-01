import { DB } from '../../models';
import Controller from './base';
import * as repository from '../../repo';
import { NextFunction, Request, Response } from 'express';
import { types } from '../../common';
import { OK } from 'http-status';
import { pickForSearch } from '../../utils';
import { FindOptions } from 'sequelize';

export default class classesController extends Controller {
  private readonly classRepo: repository.Classes;
  constructor(db: DB) {
    super(db);

    this.classRepo = new repository.Classes(db);
  }

  public detail = async (req: Request, res: Response, next: NextFunction) => {
    const classs = await this.classRepo.findById(req.params.id);

    res.json(classs);
  }

  public search = async (req: Request, res: Response, next: NextFunction) => {
    const params: types.classes.ClassSearchParam = {
      ...pickForSearch(<types.classes.ClassSearchParam>req.query, ['name', 'code', 'search', 'sort', 'sortColumn', 'parent_id', 'user_id']),
      ...this.getOffsetLimit(req),
    }

    const data = await this.classRepo.search(params);

    this.ok(res, data);
  }
  public create = async (req: Request, res: Response, next: NextFunction) => {
    const params: types.classes.ClassCreateParam = {
      subject_id: req.body.subject_id,
      user_id: req.body.user_id,
      parent_id: req.body.parent_id,
      name: req.body.name,
      code: req.body.code,
      marking: req.body.marking,
      exam_create: req.body.exam_create,
      exam_supervision: req.body.exam_supervision,
      form_teach: req.body.form_teach,
      form_exam: req.body.form_exam,
      num_student: req.body.num_student,
      num_lesson: req.body.num_lesson,
      num_credit: req.body.num_credit,
      classroom: req.body.classroom,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      level_teach: req.body.level_teach,
      time_teach: req.body.time_teach,
      semester: req.body.semester,
      year_id: req.body.year_id,
    }

    const data = await this.classRepo.create(params);

    this.created(res, data.dataValues);
  }
  public update = async (req: Request, res: Response, next: NextFunction) => {

    const params: types.classes.ClassUpdateParam = {
      subject_id: req.body.subject_id,
      user_id: req.body.user_id,
      parent_id: req.body.parent_id,
      name: req.body.name,
      code: req.body.code,
      marking: req.body.marking,
      exam_create: req.body.exam_create,
      exam_supervision: req.body.exam_supervision,
      form_teach: req.body.form_teach,
      form_exam: req.body.form_exam,
      num_student: req.body.num_student,
      num_lesson: req.body.num_lesson,
      num_credit: req.body.num_credit,
      classroom: req.body.classroom,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      level_teach: req.body.level_teach,
      time_teach: req.body.time_teach,
      semester: req.body.semester,
      year_id: req.body.year_id,
    }
    const data = await this.classRepo.update(params, req.params.id);

    this.created(res, data);
  }
  public delete = async (req: Request, res: Response, next: NextFunction) => {
    const classes = await this.classRepo.delete(req.params.id);

    res.status(OK).json(classes)
  }

  public dashboard = async (req: Request, res: Response, next: NextFunction) => {
    type queryDashboard = {
      year_id: string | number,
      user_id?: string,
    }
    const classes = await this.classRepo.dashboard(
      {
        ...pickForSearch(<queryDashboard>req.query, ['year_id', 'user_id'])
      }
    );

    this.ok(res, classes);
  }
}
