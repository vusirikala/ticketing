import mongoose from "mongoose";
import { Password } from '../services/password';


const userSchema  = new mongoose.Schema({
    email: {
        type: String,       //In mongoose, we need to use String instead of string as we are referring to an actual constructor
        required: true
    }, 
    password: {
        type: String,
        required: true
    }, 
}, {
    toJSON: {
        //This transform function is used to transform how User object is returned in the API response calls. 
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;  //delete keyword removes a property out of an object. 
            delete ret.password;
        }
    }
})

//An inteface that describe the properties that a User Model has
//We are creating this to let typescript know that build is a function in UserModel. 
//Simply adding userSchema.statics.build doesn't enable typescript typechecking. 
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc; 
}

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done(); //This is synatactic sugar mongodb. This is how mongodb handles async functions. 
})

//This adds a new method called build to userModel. 
//We can then call User.build(.) function to create a new user. 
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

//mongoose.model(.) return type is UserModel. 
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

//An interface that describes a User Document has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

//An interface that describes the properties that are required to create a new user
interface UserAttrs {
    email: string;
    password: string;
}
//We are not going to "new User" anywhere else in the code. 
//In order to for typesecript to verify the type of input given to User(.), we are writing the buildUser method.
//To create a new user record, we can use buildUser method. 
function buildUser(attrs: UserAttrs) {
    return new User(attrs);
}


export { User, buildUser, UserModel };