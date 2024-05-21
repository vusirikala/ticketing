import express, {Request, Response, NextFunction} from 'express';
import {body, validationResult} from 'express-validator';
import { UserModel, User } from '../models/user';
import { RequestValidationError, BadRequestError, validateRequest, DatabaseConnectionError } from '@vusirikala/common';
import jwt from 'jsonwebtoken';
const router = express.Router();


router.post('/api/users/signup', [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password').trim().isLength({min: 4, max:30}).withMessage("Password must be between 4 to 30 characters")
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const {email, password} = req.body;

        const existingUser = await User.findOne({email});

        if (existingUser) {
            throw new BadRequestError('Email already in use');
        }

        const user = User.build({email, password});
        await user.save();

        //Generate Json Web Token
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!);   

        //Typescript is not sure whether process.env.JWT_KEY is defined. 
        //But since we already made sure that process.env.JWT_KEY is defined insided index.ts, 
        //we added ! mark here to let typescript know that we verified the variable elsewhere. 

        //Store it in session object. 
        req.session = {
            jwt: userJwt
        };


        res.status(201).send({user: user, jwt: userJwt});
    });

export {router as signUpRouter};
