import * as config from 'config';
import { IConfigApp } from './interfaces';

export const configApp = config.get<IConfigApp>('app');
