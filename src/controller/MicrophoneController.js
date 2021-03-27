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

                let audioContext = new AudioContext;


                let reader = new FileReader;

                reader.onload = event=>{
                    
                    audioContext.decodeAudioData(reader.result).then(decode=>{
                        let file = new File([blob], filename, {
                            type: this._mimeType,
                            lastModified: Date.now()
                        });

                        this.trigger('recorded', file, decode);
                    })
                };
            });

            this._mediaRecorder.start();
            this.startTimer();
        }
    }

    stopRecorder(){
        if(this.isAvailable()){
            this._mediaRecorder.stop();
            this.stop();
            this.stopTimer();
        }
    }

    startTimer(){
        let start = Date.now();

        this._recordMicrophoneInterval = setInterval(() => {
            this.trigger('recordTimer', (Date.now() - start));
        }, 100);
    }

    stopTimer(){
        clearInterval(this._recordMicrophoneInterval);

    }
}