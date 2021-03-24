import {Firebase} from '../Util/Firebase';
import { Model } from './Model';

export class User extends Model {
    constructor(id){
        super();
        if(id) this.getById(id);
    }

    get name(){ return this._data.name; };
    set name(value){ this._data.name = value; };

    get email(){ return this._data.email; };
    set email(value){ this._data.email = value; };

    get photo(){ return this._data.photo; };
    set photo(value){ this._data.photo = value; };

    get chatId(){ return this._data.chatId; };
    set chatId(value){ this._data.chatId = value; };

    static getRef(){
        return Firebase.db().collection('/users');
    }

    static findByEmail(email){
        return User.getRef().doc(email);
    }

    getById(id){
        return new Promise((resolve, reject)=>{
            User.findByEmail(id).onSnapshot(doc=>{
                this.fromJSON(doc.data());
                resolve(doc);
            })
        })
    }

    save(){
        return User.findByEmail(this.email).set(this.toJSON());
    }

    addContact(contact){
        let base64 = btoa(contact.email);
        return User.getContactRef(this.email)
            .doc(base64)
            .set(contact.toJSON());
    }

    static getContactRef(id){
        return User.getRef()
            .doc(id)
            .collection('contacts');
    }

    getContact(){
        return new Promise((resolve, reject)=>{
            User.getContactRef(this.email).onSnapshot(docs=>{
                let contacts = [];
                
                docs.forEach(doc => {
                    let data = doc.data();
                    data.id = doc.id;

                    contacts.push(data);
                });

                this.trigger('contactschange', docs);

                resolve(contacts);
            })
        })
    }
}