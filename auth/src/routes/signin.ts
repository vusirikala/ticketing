import express, {Request, Response} from 'express';
import {body, validationResult} from 'express-validator';
import { RequestValidationError, validateRequest, BadRequestError } from '@vusirikala/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin', 
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password').trim().notEmpty().withMessage('You must supply a password')
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
        const {email, password} = req.body;
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await Password.compare(existingUser.password, password);
        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }
        
        //Generate Json Web Token
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!);   
        //Typescript is not sure whether process.env.JWT_KEY is defined. 
        //But since we already made sure that process.env.JWT_KEY is defined insided index.ts, 
        //we added ! mark here to let typescript know that we verified the variable elsewhere. 

        //Store it in session object. 
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
});

export {router as signInRouter};
