import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server'
import { moveSyntheticComments } from 'typescript';
import {app} from '../app';
import request from 'supertest';

let mongo: any;
//This function runs before all our tests get executed. 
beforeAll(async () => {
    console.log('Before testing')
    jest.setTimeout(1000*1000);
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
    var signup: () => Promise<string[]>;
}

global.signup = async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
    return response.get('Set-Cookie');
}