import { ValidationChain, check } from 'express-validator';
import { types } from '../../common';
import { GenericCheckFn, body, S, V } from './custom';
import { User } from '../../models/user';

const b: GenericCheckFn<types.user.Attr> = body;

const upsert = [body('*', [S.emptyStringAsNull])];

export const create = [
  ...upsert,
  b('name', 'name', [V.required]),
  b('department_id', 'department_id', [V.required]),
  b('code', 'code', [V.required, V.duplicated]),
  b('email', 'email', [V.required, V.duplicated]),
  b('number_salary', 'number_salary', [V.isDigits]),
];
