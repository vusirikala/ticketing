import mongoose from 'mongoose';
import {app} from './app';

async function start () {
    try {

        process.env.MONGO_URI="mongodb://127.0.0.1:27017/neurotalks";
        process.env.JWT_KEY="somekey";

        if (!process.env.JWT_KEY) {
            throw new Error('JWT Key is not defined ');
        }

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO URI is not defined');
        }

        await mongoose.connect(process.env.MONGO_URI)  
        console.log("Connected to mongodb")
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!")
    })    
}
start()
