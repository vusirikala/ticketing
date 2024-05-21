import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError, requireAuth } from '@vusirikala/common';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';

const app = express();

app.set('trust proxy', true);   //This is so that express is aware that it is behind a proxy ('ingress-nginx'), and still trusts the https messages. 
app.use(json());
app.use(
    cookieSession({
        signed: false,      //Disabling encryption 
        secure: process.env.NODE_ENV !== 'test'        //Cookies are only used with https connections in production environment. 
    })
)
app.use(currentUser);
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter)

app.all('*', () => {
    throw new NotFoundError();
})
app.use(errorHandler);

export { app };
