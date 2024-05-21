import request from 'supertest';
import { app } from '../../app';


it('returns a 400 with an invalid email', async() => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'testtestcom',
            password: 'password'
        })
        .expect(400);
});


it('returns a 201 on successful signup', async() => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
});


it('returns a 400 with an invalid password', async() => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'pas'
        })
        .expect(400);
});

it('returns a 400 with missing email and password', async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: '',
            password: 'password'
        })
        .expect(400);

    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: ''
        })
        .expect(400);
});

it('disallows duplicate emails ', async() => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'abc@test.com',
            password: 'password'
        })
        .expect(201);

    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'abc@test.com',
            password: 'password2'
        })
        .expect(400);
});


it('sets a cookie after successful signup', async() => {
    process.env.JWT_KEY = 'abcd'
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'abc@test.com',
            password: 'password'
        })
        .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
});
