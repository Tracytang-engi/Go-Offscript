import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import cvRoutes from './modules/cv/cv.routes';
import socialRoutes from './modules/social/social.routes';
import valuesRoutes from './modules/values/values.routes';
import pathRoutes from './modules/path/path.routes';
import opportunityRoutes from './modules/opportunity/opportunity.routes';
import novaRoutes from './modules/nova/nova.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Go Off Script API' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/values', valuesRoutes);
app.use('/api/path', pathRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/nova', novaRoutes);

app.use(errorHandler);

export default app;
