import { Firebase } from '../Util/Firebase';

export class Upload {
    static send(refFrom, file){

        return new Promise((resolve, reject)=>{
            let fileRef = Firebase.hd().ref(refFrom).child(Date.now() + '_' + file.name)
            let uploadTask = fileRef.put(file);

            uploadTask.on('state_changed', event=>{
                console.info('upload', event);
            }, error => {
                reject(['upload',error]);
            }, ()=>{
                fileRef.getDownloadURL().then(urlFile=>{
                    resolve(urlFile);
                }).catch(error=>{
                    reject(['getDownloadURL',error]);
                });
            });
        })
        
    }
}