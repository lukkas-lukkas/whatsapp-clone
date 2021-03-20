//const firebaseApp = require('firebase/app');
//require('firebase/firestore')

export class Firebase {
    constructor(){
        this._config = {
            apiKey: "AIzaSyDI9-Oam095FwckUOJI6meJ2S_mHYEHLS0",
            authDomain: "whatsapp-clone-c1bca.firebaseapp.com",
            projectId: "whatsapp-clone-c1bca",
            storageBucket: "whatsapp-clone-c1bca.appspot.com",
            messagingSenderId: "946820424225",
            appId: "1:946820424225:web:a0cfad37694a50ce6d7960"
          };
        this.init();
    }

    init(){
        if(!this._initialized){
            firebase.initializeApp(this._config);
            //Conexão continua
            firebase.firestore().settings({
                timestampsInSnapshots: true
            })
            this._initialized = true;
        }
    }

    static db(){
        return firebase.firestore();
    }

    static hd(){
        return firebase.storage();
    }

    initAuth(){

        return new Promise((resolve, reject)=>{

            let provider = new firebase.auth.GoogleAuthProvider();

            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    let token = result.credential.accessToken;
                    let user = result.user;

                    resolve({
                        user,
                        token
                    });
                }).catch((error) => {
                    reject(error);
                });
                
        })
        
    }
}