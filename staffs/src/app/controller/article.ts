import { DB } from '../../models';
import Controller from './base';
import * as repository from '../../repo';
import { NextFunction, Request, Response } from 'express';
import { types } from '../../common';
import { OK } from 'http-status';
import { pickForSearch } from '../../utils';

export default class ArticleController extends Controller {
    private readonly articleRepo: repository.Article;
    constructor(db: DB) {
        super(db);

        this.articleRepo = new repository.Article(db);
    }
    
    public detail = async (req: Request, res: Response, next: NextFunction) => {
        const user = await this.articleRepo.detail(req.params.id);

        res.json(user)
    }

    public search = async (req: Request, res: Response, next: NextFunction) => {
        const params: types.article.ArticleSearchParam = {
            ...pickForSearch(<types.article.ArticleSearchParam>req.query, ['name', 'code', 'search', 'sort', 'sortColumn']),
            ...this.getOffsetLimit(req),
        }
        const data = await this.articleRepo.search(params);

        this.ok(res, data);

    }
    public create = async (req: Request, res: Response, next: NextFunction) => {
        const params: types.article.ArticleCreateParam = {
            name: req.body.name,
            code: req.body.code,
            role: req.body.role,
            type: req.body.type,
            open_access: req.body.open_access,
            open_access_scopus: req.body.open_access_scopus,
            type_article: req.body.type_article,
            index_article: req.body.index_article,
            total_time: req.body.total_time,
            num_person: req.body.num_person,
            year_id: req.body.year_id,
        }
        const data = await this.articleRepo.create(params);

        this.created(res, data);
    }
    public update = async (req: Request, res: Response, next: NextFunction) => {

        const params: types.article.ArticleUpdateParam = {
            name: req.body.name,
            code: req.body.code,
            role: req.body.role,
            type: req.body.type,
            open_access: req.body.open_access,
            open_access_scopus: req.body.open_access_scopus,
            type_article: req.body.type_article,
            index_article: req.body.index_article,
            total_time: req.body.total_time,
            num_person: req.body.num_person,
            year_id: req.body.year_id,
        }

        const data = await this.articleRepo.update(params, req.params.id);

        this.created(res, data);
    }
    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const article = await this.articleRepo.delete(req.params.id);

        res.status(OK).json(article)
    }
}
