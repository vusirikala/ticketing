import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError, requireAuth } from '@vusirikala/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';

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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter)
app.use(errorHandler);

app.all('*', () => {
    throw new NotFoundError();
})

export { app };
