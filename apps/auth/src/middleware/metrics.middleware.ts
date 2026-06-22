import { NextFunction, Request, Response } from 'express';
import { httpRequestDuration, httpRequestsTotal } from '../utils/metrics';

export const metricsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const route = req.path || req.originalUrl;
        const statusCode = String(res.statusCode);

        httpRequestsTotal.inc({
            method: req.method,
            route,
            status_code: statusCode,
        });

        end({
            method: req.method,
            route,
            status_code: statusCode,
        });
    });

    next();
};
