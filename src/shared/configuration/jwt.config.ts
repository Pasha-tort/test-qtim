import * as config from 'config';
import { IConfigJwt } from './interfaces';

export const configJwt = config.get<IConfigJwt>('jwt');
