import { Model } from './Model';
import { Firebase } from '../Util/Firebase';

export class Chat extends Model {
    constructor(){
        super();
    }

    get users(){ return this._data.users }
    set users(value){ this._data.users = value };

    static getRef () {
        return Firebase.db().collection('/chats');
    }

    static createIfNotExists(meEmail, contactEmail){
        return new Promise((resolve, reject)=>{
            Chat.find(meEmail, contactEmail).then(chats=>{

                if(chats.empty){
                    Chat.create(meEmail, contactEmail).then(chat=>{
                        resolve(chat);
                    }).catch(error=>{
                        reject(['create', error])
                    });
                } else {
                    chats.forEach(chat => {
                        resolve(chat);
                    });
                }
            }).catch(error=>{
                reject(['find', error])
            });
        })
    }
    
    static find(meEmail, contactEmail){
        return Chat.getRef()
                .where(btoa(meEmail), '==', true)
                .where(btoa(contactEmail), '==', true)
                .get();
    }
    
    static create(meEmail, contactEmail){
        return new Promise((resolve, reject)=>{

            let users = {};
            users[btoa(meEmail)] = true;
            users[btoa(contactEmail)] = true;

            Chat.getRef().add({
                users,
                timeStamp: new Date
            }).then(doc=>{
                Chat.getRef().doc(doc.id).get().then(chat=>{
                    resolve(chat);
                }).catch(error=>{
                    reject(['get', error]);
                })
            }).catch(error=>{
                reject(['add',error]);
            })
        })
    }
}