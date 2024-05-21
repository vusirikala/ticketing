import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server'
import {app} from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
jest.mock('../nats-wrapper');
// jest.mock('../stripe');

let mongo: any;
process.env.STRIPE_KEY = 'abc';

//This function runs before all our tests get executed. 
beforeAll(async () => {
    console.log('Before testing')
    process.env.JWT_KEY = 'ladsdfs';
    const mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

//Deleting all the collections in mongodb before each test
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

declare global {
    var signin: (userId?: string) => string[];
}

global.signin = (userId?: string) => {
    //Build a JWT payload {id, email}
    const payload = {
        email : 'test@test.com',
        id : userId || new mongoose.Types.ObjectId().toHexString()
    }

    //Create a JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    
    //Build a session object. {jwt: MY_JWT}
    const session = {jwt: token};

    //Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    //Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //Return a string that is the cookie with the encoded data
    return [`session=${base64}`];

}