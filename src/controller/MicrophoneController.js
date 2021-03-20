import { ClassEvent } from "../Util/ClassEvent";

export class MicrophoneController extends ClassEvent {

    constructor(){

        super();

        this._available = false;
        this._mimeType = 'audio/webm';

        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream=>{

            this._available = true;

            this._stream = stream;

            /*let audio = new Audio;

            audio.srcObject = stream;

            audio.play();*/

            this.trigger('ready', this._stream);

        }).catch(error=>{
            console.error(error);
        })
    }

    stop(){
        this._stream.getTracks().forEach(track => {
            track.stop();            
        });
    }

    isAvailable(){
        return this._available;
    }

    startRecorder(){
        if(this.isAvailable()){
            this._mediaRecorder = new MediaRecorder(this._stream, {
                mimeType: this._mimeType
            });

            this._recordedChunks = [];

            this._mediaRecorder.addEventListener('dataavailable', event=>{
                if(event.data.size > 0){
                    this._recordedChunks.push(event.data)
                }
            });

            this._mediaRecorder.addEventListener('stop', event=>{
                let blob = new Blob(this._recordedChunks, {
                    type: this._mimeType,
                })
        
                let filename = `rec${Date.now()}.webm`;

                let file = new File([blob], filename, {
                    type: this._mimeType,
                    lastModified: Date.now()
                });

                console.log('file', file);

                let reader = new FileReader;

                reader.onload = event=>{
                    console.log('reader file', file);
                    let audio = new Audio(reader.result);
                    audio.play();

                };

                reader.readAsDataURL(file);

        
            });

            this._mediaRecorder.start();
        }
    }

    stopRecorder(){
        if(this.isAvailable()){
            this._mediaRecorder.stop();
            this.stop();
        }
    }
}