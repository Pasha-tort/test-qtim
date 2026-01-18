import { Request } from 'express';

export type TypeCacheKey = string | ((req: Request) => string);
