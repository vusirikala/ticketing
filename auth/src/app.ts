import express from 'express';
require('express-async-errors');
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import { validateRequest, errorHandler, NotFoundError, BadRequestError } from '@vusirikala/common';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signUpRouter } from './routes/signup';
import { signOutRoter } from './routes/signout';


const app = express();

app.set('trust proxy', true);   //This is so that express is aware that it is behind a proxy ('ingress-nginx'), and still trusts the https messages. 
app.use(json());
app.use(
    cookieSession({
        signed: false,      //Disabling encryption 
        secure: true        //Cookies are only used with https connections in production environment. 
    })
)
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRoter);

app.all('*', () => {
    throw new NotFoundError();
})
app.use(errorHandler);

export { app };
