import {Firebase} from '../Util/Firebase';
import { ClassEvent } from "../Util/ClassEvent";

export class User extends ClassEvent {
    constructor(){
        
    }

    static getRef(){
        return Firebase.db().collection('/users');
    }

    static findByEmail(email){
        return User.getRef().doc(email);
    }
}