import Joi from 'joi';
import { Header } from '../core/utils.js';
import { JoiAuthBearer } from '../helpers/validator.js';

export default {
  apiKey: Joi.object()
    .keys({
      [Header.API_KEY]: Joi.string().required(),
    })
    .unknown(true),
  auth: Joi.object()
    .keys({
      authorization: JoiAuthBearer().required(),
    })
    .unknown(true),
};
