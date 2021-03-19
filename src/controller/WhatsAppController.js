class WhatsAppController{
    constructor(){
        this.elementsPrototype();
        this.loadElements();
        this.initEvents();
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
            console.log(this.el.inputNamePanelEditProfile.innerHTML);
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
                console.log('file', file);
            })
        })

        this.el.btnAttachCamera.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelCamera.css({
                height: '100%'
            });
            this.el.panelCamera.addClass('open');
        })

        this.el.btnClosePanelCamera.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
        })

        this.el.btnTakePicture.on('click', event=>{
            console.log('takePicture');
        })

        this.el.btnAttachDocument.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelDocumentPreview.css({
                height: '100%'
            });
            this.el.panelDocumentPreview.addClass('open');
        })

        this.el.btnClosePanelDocumentPreview.on('click', event=>{
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
        })

        this.el.btnSendDocument.on('click', event=>{
            console.log('btnSendDocument');
        })

        this.el.btnAttachContact.on('click', event=>{
            this.el.modalContacts.show();
        })

        this.el.btnCloseModalContacts.on('click', event=>{
            this.el.modalContacts.hide();
        })

        this.el.btnSendMicrophone.on('click', event=>{
            this.el.recordMicrophone.show();
            this.el.btnSendMicrophone.hide();
            this.startRecordMicrophoneTime();
        })

        this.el.btnCancelMicrophone.on('click', event=>{
            this.closeRecordMicrophone();
        })

        this.el.btnFinishMicrophone.on('click', event=>{
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
            console.log(this.el.inputText.innerHTML);
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

                this.el.inputText.appendChild(img);
                this.el.inputText.dispatchEvent(new Event('keyup'));
            })
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
        clearInterval(this._recordMicrophoneInterval);
        this.el.recordMicrophoneTimer.innerHTML = '0:00';
    }

    startRecordMicrophoneTime(){

        let start = Date.now();

        this._recordMicrophoneInterval = setInterval(() => {
            this.el.recordMicrophoneTimer.innerHTML = Format.toTime(Date.now() - start);
        }, 100);

    }

    
}