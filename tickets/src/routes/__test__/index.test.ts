import request from 'supertest';
import { app } from '../../app';

async function createTicket() {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'asdf',
            price: 20
        });
}

it('can fetch a list of tickets', async () => {
    createTicket();
    createTicket();
    createTicket();
    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
})
