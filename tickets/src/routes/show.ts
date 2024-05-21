import { DatabaseConnectionError, NotFoundError } from '@vusirikala/common';
import express, {Request, Response} from 'express';
import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';


const router = express.Router(); 

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    console.log("Entered the function"); 
    var ticket;
    try {
        ticket = await Ticket.findById(new mongoose.Types.ObjectId(req.params.id)).exec();
    } catch(err) {
        console.error(err)
        throw new DatabaseConnectionError();
    }
    if (!ticket) {
        throw new NotFoundError();
    }
    res.status(200).send(ticket);
    
    // console.log("Ran Find in the database");
});

export {router as showTicketRouter};