import { Firebase } from '../Util/Firebase';
import { Format } from '../Util/Format';
import { Base64 } from '../Util/Base64';
import { CameraController } from './CameraController';
import { MicrophoneController } from './MicrophoneController';
import { DocumentPreviewController } from './DocumentPreviewController';
import { ContactController } from './ContactController';
import { User } from '../model/User';
import { Chat } from '../model/Chat';
import { Message } from '../model/Message';

export class WhatsAppController{
    constructor(){
        this._firebase = new Firebase;
        this.initAuth(); 
        this.elementsPrototype();
        this.loadElements();
        this.initEvents();
        /*this.el.appContent.css({
            display: 'flex'
        });*/
    }

    elementsPrototype(){
        Element.prototype.hide = function(){
            this.style.display = 'none';
            return this;
        }

        Element.prototype.show = function(){
            this.style.display = 'block';
            return this;
        }

        Element.prototype.toggle = function(){
            this.style.display = this.style.display === 'none' ? 'block' : 'none';
            return this;
        }

        Element.prototype.on = function(events, fn){
            events.split(" ").forEach(event=>{
                this.addEventListener(event, fn);
            })
            return this;
        }

        Element.prototype.css = function(styles){

            for(let name in styles){
                this.style[name] = styles[name];
            }
            return this;
        }

        Element.prototype.addClass = function(cl){

            this.classList.add(cl);
            return this;
        }

        Element.prototype.removeClass = function(cl){

            this.classList.remove(cl);
            return this;
        }

        Element.prototype.toggleClass = function (cl) {

            this.classList.toggle(cl);
            return this;

        }

        Element.prototype.hasClass = function(cl){

            return this.classList.contains(cl);
        }

        HTMLFormElement.prototype.getForm = function () {
            return new FormData(this);
        }

        HTMLFormElement.prototype.toJSON = function(){
            let json = {};
            this.getForm().forEach((value, key)=>{
                json[key] = value;
            })

            return json;
        }
    }

    loadElements(){

        this.el = {};

        document.querySelectorAll('[id').forEach(element=>{
            
            this.el[Format.getCamelCase(element.id)] = element;

        })
    }

    initEvents(){
        this.el.myPhoto.on('click', event=>{
            this.closeAllLeftPanel();
            this.el.panelEditProfile.show();

            setTimeout(() => {
                this.el.panelEditProfile.addClass('open');
            }, 200);
        })

        this.el.btnClosePanelEditProfile.on('click', event=>{
            this.el.panelEditProfile.removeClass('open');
        })

        this.el.btnNewContact.on('click', event=>{
            this.closeAllLeftPanel();
            this.el.panelAddContact.show();
            setTimeout(() => {
                this.el.panelAddContact.addClass('open');
            }, 200);
        })

        this.el.btnClosePanelAddContact.on('click', event=>{
            this.el.panelAddContact.removeClass('open');
        })

        this.el.photoContainerEditProfile.on('click', event=>{
            this.el.inputProfilePhoto.click();
        })

        this.el.btnSavePanelEditProfile.on('click', event=>{
            this.el.btnSavePanelEditProfile.disabled = true;
            this._user.name = this.el.inputNamePanelEditProfile.innerHTML;
            this._user.save().then(result=>{
                this.el.btnSavePanelEditProfile.disabled = false;
            });
        })

        this.el.inputNamePanelEditProfile.on('keypress', event=>{
            if(event.key == 'Enter'){
                event.preventDefault();
                this.el.btnSavePanelEditProfile.click();
            }
        })

        this.el.formPanelAddContact.on('submit', event=>{
            event.preventDefault();

            let formData = this.el.formPanelAddContact.getForm();

            let contact = new User(formData.get('email'));

            contact.on('datachange', data=>{

                if(data.name){
                    Chat.createIfNotExists(this._user.email, contact.email).then(chat=>{

                        contact.chatId = chat.id;
                        this._user.chatId = chat.id;

                        contact.addContact(this._user);

                        this._user.addContact(contact).then(result=>{
                            this.el.btnClosePanelAddContact.click();
                        });

                    }).catch(error=>{
                        console.error('createIfNotExists', error);
                    });
                    

                } else {
                    console.error('Usuário não encontrado');
                }
            });

        })

        this.el.contactsMessagesList.querySelectorAll('.contact-item').forEach(item=>{
            item.on('click', event=>{
                this.el.main.css({
                    display: 'flex'
                })
                this.el.home.hide();
            })
        })

        this.el.btnAttach.on('click', event=>{
            event.stopPropagation();
            this.el.menuAttach.addClass('open');
            document.addEventListener('click', this.closeMenuAttach.bind(this));
        })

        this.el.btnAttachPhoto.on('click', event=>{
            this.el.inputPhoto.click();
        })

        this.el.inputPhoto.on('change', event=>{
            [...this.el.inputPhoto.files].forEach((file)=>{
                Message.sendImage(this._contactActive.chatId, this._user.email, file);
            })
        })

        this.el.btnAttachCamera.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelCamera.css({
                height: '100%'
            });
            this.el.panelCamera.addClass('open');

            this._camera = new CameraController(this.el.videoCamera);
        })

        this.el.btnClosePanelCamera.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
            this._camera.stop();
        })

        this.el.btnTakePicture.on('click', event=>{
            let dataUrl = this._camera.takePicture();
            this.el.pictureCamera.src = dataUrl;
            this.el.pictureCamera.show();
            this.el.videoCamera.hide();
            this.el.btnReshootPanelCamera.show();
            this.el.containerTakePicture.hide();
            this.el.containerSendPicture.show();
        })

        this.el.btnReshootPanelCamera.on('click', event=>{
            this.el.pictureCamera.hide();
            this.el.videoCamera.show();
            this.el.btnReshootPanelCamera.hide();
            this.el.containerTakePicture.show();
            this.el.containerSendPicture.hide();
        })

        this.el.btnSendPicture.on('click', event=>{
            this.el.btnSendPicture.disabled = true;
            let regex = /^data:(.+);base64.(.*)$/;
            let result = this.el.pictureCamera.src.match(regex);           
            let mimeType = result[1];

            let ext = mimeType.split('/')[1];
            let filename = `camera${Date.now()}.${ext}`;

            let picture = new Image();
            picture.src = this.el.pictureCamera.src;

            picture.onload = event=>{

                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');

                canvas.width = picture.width;
                canvas.height = picture.height;

                context.translate(picture.width, 0);
                context.scale(-1, 1);

                context.drawImage(picture, 0, 0, canvas.width, canvas.height);

                fetch(canvas.toDataURL(mimeType))
                    .then(res=>{
                        return res.arrayBuffer();
                    }).then(buffer=>{
                        return new File([buffer], filename, {type: mimeType})
                    }).then(file=>{
                        Message.sendImage(this._contactActive.chatId, this._user.email, file);
                        this.el.btnSendPicture.disabled = false;

                        this.closeAllMainPanel();
                        this._camera.stop();
                        this.el.btnReshootPanelCamera.hide();
                        this.el.pictureCamera.hide();
                        this.el.videoCamera.show();
                        this.el.containerSendPicture.hide();
                        this.el.containerTakePicture.show();
                        this.el.panelMessagesContainer.show();
                    });
            }           
        })

        this.el.btnAttachDocument.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelDocumentPreview.css({
                height: '100%'
            });
            this.el.panelDocumentPreview.addClass('open');
            this.el.inputDocument.click();
        })

        this.el.inputDocument.on('change', event=>{
            if(this.el.inputDocument.files.length){
                this.el.panelDocumentPreview.css({
                    height: '1%'
                });

                let file = this.el.inputDocument.files[0];

                this._documentPreviewController = new DocumentPreviewController(file);

                this._documentPreviewController.getPreviewData().then(data=>{
                    
                    this.el.imgPanelDocumentPreview.src = data.src;
                    this.el.infoPanelDocumentPreview.innerHTML = data.info;
                    this.el.imagePanelDocumentPreview.show();
                    this.el.filePanelDocumentPreview.hide();
                    this.el.panelDocumentPreview.css({
                        height: '100%'
                    });
                }).catch(error=>{
                    this.el.panelDocumentPreview.css({
                        height: '100%'
                    });
                    switch (file.type) {
                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        case 'application/msword':
                            this.el.iconPanelDocumentPreview.classList.value = 'jcxhw icon-doc-doc';
                            break;

                        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        case 'application/vnd.ms-excel':
                            this.el.iconPanelDocumentPreview.classList.value = 'jcxhw icon-doc-xls';
                            break;

                        case 'application/vnd.ms-powerpoint':
                        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                            this.el.iconPanelDocumentPreview.classList.value = 'jcxhw icon-doc-ppt';
                            break;

                        default:
                            this.el.iconPanelDocumentPreview.classList.value = 'jcxhw icon-doc-generic';
                    }

                    this.el.filenamePanelDocumentPreview.innerHTML = file.name;
                    this.el.imagePanelDocumentPreview.hide();
                    this.el.filePanelDocumentPreview.show();


                })
            }
        })

        this.el.btnClosePanelDocumentPreview.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
        })

        this.el.btnSendDocument.on('click', event=>{
            let file = this.el.inputDocument.files[0];
            let base64 = this.el.imgPanelDocumentPreview.src;

            if(file.type === 'application/pdf'){

                Base64.toFile(base64).then(filePreview=>{                    
                    
                    Message.sendDocument(this._contactActive.chatId, this._user.email, file, filePreview, this.el.infoPanelDocumentPreview.innerHTML);
    
                }).catch(error=>{
                    reject(['Base64.toFile', error]);
                })

            } else {
                Message.sendDocument(this._contactActive.chatId, this._user.email, file, false, false);
            }

            this.el.btnClosePanelDocumentPreview.click();            
        })

        this.el.btnAttachContact.on('click', event=>{
            this._contactController = new ContactController(this.el.modalContacts, this._user);

            this._contactController.on('select', contact=>{
                Message.sendContact(this._contactActive.chatId, this._user.email, contact);
            });

            this._contactController.open();
        })

        this.el.btnCloseModalContacts.on('click', event=>{
            this._contactController.close();
        })

        this.el.btnSendMicrophone.on('click', event=>{
            this.el.recordMicrophone.show();
            this.el.btnSendMicrophone.hide();
            this._microphoneController = new MicrophoneController();
            
            this._microphoneController.on('ready', stream=>{
                this._microphoneController.startRecorder();
            });

            this._microphoneController.on('recordTimer', timer=>{
                this.el.recordMicrophoneTimer.innerHTML = Format.toTime(timer);
            });
        })

        this.el.btnCancelMicrophone.on('click', event=>{
            this._microphoneController.stopRecorder();
            this.closeRecordMicrophone();
        })

        this.el.btnFinishMicrophone.on('click', event=>{
            this._microphoneController.stopRecorder();
            this.closeRecordMicrophone();
        })

        this.el.inputText.on('keypress', event=>{
            if(event.key === 'Enter' && !event.ctrlKey){
                event.preventDefault();
                this.el.btnSend.click();
            }
        })

        this.el.inputText.on('keyup', event=>{
            if(this.el.inputText.innerHTML.length){
                this.el.inputPlaceholder.hide();
                this.el.btnSendMicrophone.hide();
                this.el.btnSend.show();
            } else {
                this.el.inputPlaceholder.show();
                this.el.btnSendMicrophone.show();
                this.el.btnSend.hide();
            }
        })
        
        this.el.btnSend.on('click', event=>{
            Message.send(this._contactActive.chatId, this._user.email, 'text', this.el.inputText.innerHTML);

            this.el.inputText.innerHTML = '';
            this.el.panelEmojis.removeClass('open');
        })

        this.el.btnEmojis.on('click', event=>{
            this.el.panelEmojis.toggleClass('open');
        })

        this.el.panelEmojis.querySelectorAll('.emojik').forEach(emoji=>{
            emoji.on('click', event=>{
                let img = this.el.imgEmojiDefault.cloneNode();

                img.style.cssText = emoji.style.cssText;
                img.dataset.unicode = emoji.dataset.unicode;
                img.alt = emoji.dataset.unicode;

                emoji.classList.forEach(name=>{
                    img.classList.add(name);
                })

                //Onde o cursor está
                let cursor = window.getSelection();
                
                if (!cursor.focusNode || !cursor.focusNode.id == 'input-text'){
                    this.el.inputText.focus();
                    cursor = window.getSelection();
                }

                let range = document.createRange();

                range = cursor.getRangeAt(0);
                range.deleteContents();

                let frag = document.createDocumentFragment();

                frag.appendChild(img);

                range.insertNode(frag);

                range.setStartAfter(img);
                
                this.el.inputText.dispatchEvent(new Event('keyup'));
            })
        })

        this.el.inputSearchContacts.on('keyup', event=>{
            if(this.el.inputSearchContacts.value.length > 0){
                this.el.inputSearchContactsPlaceholder.hide();
                this._user.getContacts(this.el.inputSearchContacts.value);
            } else {
                this.el.inputSearchContactsPlaceholder.show();
                this._user.getContacts();
            }
        })
    }

    closeAllLeftPanel(){
        this.el.panelEditProfile.hide();
        this.el.panelAddContact.hide();
    }

    closeMenuAttach(event){
        this.el.menuAttach.removeClass('open');
        document.removeEventListener('click', this.closeMenuAttach);
    }

    closeAllMainPanel(){
        this.el.panelMessagesContainer.hide();  
        this.el.panelDocumentPreview.removeClass('open');
        this.el.panelCamera.removeClass('open');
    }

    closeRecordMicrophone(){
        this.el.recordMicrophone.hide();
        this.el.btnSendMicrophone.show();
        this.el.recordMicrophoneTimer.innerHTML = '0:00';
    }

    initAuth(){
        this._firebase.initAuth()
            .then(response=>{
                this._user = new User(response.user.email);
                /* TESTES

                this._user = new User('lukkasoliveiralima@gmail.com');
                this._user.name = 'Lucas Lima';
                this._user.email = 'lukkasoliveiralima@gmail.com';
                this._user.photo = 'https://lh4.googleusercontent.com/-6_0tWw8akKM/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmO5-GuRQ5d2PcYGqEWwexyV_A15g/s96-c/photo.jpg';

                */

                this._user.on('datachange', data=>{
                    document.querySelector('title').innerHTML  = `${data.name} | WhatsApp Clone`;

                    this.el.inputNamePanelEditProfile.innerHTML = data.name;

                    if(data.photo){
                        let photo = this.el.imgPanelEditProfile;
                        photo.src = data.photo;
                        this.el.imgDefaultPanelEditProfile.hide();
                        photo.show();

                        let photo2 = this.el.myPhoto.querySelector('img');
                        photo2.src = data.photo;
                        photo2.show();
                    }

                    this.initContacts();
                })
                

                this._user.name = response.user.displayName;
                this._user.email = response.user.email;
                this._user.photo = response.user.photoURL

                this._user.save()
                    .then(result=>{
                        this.el.appContent.css({
                            display: 'flex'
                        });
                    }).catch(error=>{
                        console.error('save', error);
                    });              
            }).catch(error=>{
                console.error('initAuth',error);
            })
    }

    initContacts(){        
        this._user.on('contactschange', docs=>{
            this.el.contactsMessagesList.innerHTML = '';
            docs.forEach(doc=>{
                let contact = doc.data();
                let div = document.createElement('div');

                div.classList = 'contact-item';
        
                div.innerHTML = `
                    <div class="dIyEr">
                        <div class="_1WliW" style="height: 49px; width: 49px;">
                            <img src="#" class="Qgzj8 gqwaM photo" style="display:none;">
                            <div class="_3ZW2E">
                                <span data-icon="default-user" class="">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212" width="212" height="212">
                                        <path fill="#DFE5E7" d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"></path>
                                        <g fill="#FFF">
                                            <path d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z"></path>
                                        </g>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="_3j7s9">
                        <div class="_2FBdJ">
                            <div class="_25Ooe">
                                <span dir="auto" title="${contact.name}" class="_1wjpf">${contact.name}</span>
                            </div>
                            <div class="_3Bxar">
                                <span class="_3T2VG">${contact.lastMessageTime}</span>
                            </div>
                        </div>
                        <div class="_1AwDx">
                            <div class="_itDl">
                                <span title="digitando…" class="vdXUe _1wjpf typing" style="display:none">digitando…</span>
        
                                <span class="_2_LEW last-message">
                                    <div class="_1VfKB">
                                        <span data-icon="status-dblcheck" class="">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
                                                <path fill="#263238" fill-opacity=".4" d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-.427-.388a.381.381 0 0 0-.578.038l-.451.576a.497.497 0 0 0 .043.645l1.575 1.51a.38.38 0 0 0 .577-.039l7.483-9.602a.436.436 0 0 0-.076-.609zm-4.892 0l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-2.614-2.556a.435.435 0 0 0-.614.007l-.505.516a.435.435 0 0 0 .007.614l3.887 3.8a.38.38 0 0 0 .577-.039l7.483-9.602a.435.435 0 0 0-.075-.609z"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <span dir="ltr" class="_1wjpf _3NFp9">${contact.lastMessage}</span>
                                    <div class="_3Bxar">
                                        <span>
                                            <div class="_15G96">
                                                <span class="OUeyt messages-count-new" style="display:none;">1</span>
                                            </div>
                                    </span></div>
                                    </span>
                            </div>
                        </div>
                    </div>
                `;

                div.on('click', event=>{
                    this.setActiveChat(contact);
                });

                if(contact.photo){
                    let img = div.querySelector('.photo');
                    img.src = contact.photo;
                    img.show();
                }
                this.el.contactsMessagesList.appendChild(div);
            });

        });

        this._user.getContacts();
    }

    setActiveChat(contact){

        if(this._contactActive){
            Message.getRef(this._contactActive.chatId).onSnapshot(()=>{});
        }

        this.el.activeName.innerHTML = contact.name;
        this.el.activeStatus.innerHTML = contact.status;


        if(contact.photo){
            let img = this.el.activePhoto;
            img.src = contact.photo;
            img.show();
        }

        this._contactActive = contact;        
                    
        
        Message.getRef(this._contactActive.chatId).orderBy('timeStamp').onSnapshot(docs=>{
            
            let scrollTop = this.el.panelMessagesContainer.scrollTop;
            let scrollTopMax = this.el.panelMessagesContainer.scrollHeight - this.el.panelMessagesContainer.offsetHeight;

            let autoScroll = scrollTop >= scrollTopMax;

            this.el.panelMessagesContainer.innerHTML = '';

            docs.forEach(doc=>{

                let data = doc.data();
                
                data.id = doc.id;
                
                let message = new Message;
                
                message.fromJSON(data);

                let me = (data.from === this._user.email);

                let view = message.getViewElement(me);

                if(!this.el.panelMessagesContainer.querySelector(`#_${data.id}`)){

                    if(!me){
                        doc.ref.set({
                            status: 'read'
                        }, {
                            merge: true
                        })
                    }
                
                    this.el.panelMessagesContainer.appendChild(view);

                    
                } else{
                    this.el.panelMessagesContainer.querySelector(`#_${data.id}`).innerHTML = view.innerHTML;
                }
                
                if(this.el.panelMessagesContainer.querySelector(`#_${data.id}`) && me) {
                    let msgEl = this.el.panelMessagesContainer.querySelector(`#_${data.id}`);

                    msgEl.querySelector('.message-status').innerHTML = message.getStatusViewElement().outerHTML;
                }

                if(message.type === 'contact'){                   

                    view.querySelector('.btn-message-send').on('click', event=>{
                        Chat.createIfNotExists(this._user.email, message.content.email).then(chat=>{

                            let contact = new User(message.content.email)

                            contact.on('datachange', data=>{
                                contact.chatId = chat.id;
                                
                                this._user.addContact(contact);

                                this._user.chatId = chat.id;
        
                                contact.addContact(this._user);

                                this.setActiveChat(contact);
                            });                            
    
                        }).catch(error=>{
                            console.error('createIfNotExists', error);
                        });
                        console.log('Enviar mensagem para', message.content);
                    })
                }
                
            });

            if(autoScroll){
                this.el.panelMessagesContainer.scrollTop = this.el.panelMessagesContainer.scrollHeight - this.el.panelMessagesContainer.offsetHeight
            } else {
                this.el.panelMessagesContainer.scrollTop = scrollTop;
            }
        })

        this.el.home.hide();
        this.el.main.css({
            display: 'flex'
        })
        
    }
}