const { contextBridge, ipcRenderer } = require('electron')

ipcRenderer.on('calling-menuEvent', (_, eventName) => {
    document.dispatchEvent(new CustomEvent(eventName))
})

ipcRenderer.on('model-sendMessage', (_, eventName,componentId,message) => {
    document.dispatchEvent(new CustomEvent(eventName,{detail:{
        destinataires:componentId,
        message:message
    }}))
})

ipcRenderer.on('calling-rootFunction', (_, eventName) => {
    if(window[eventName]){
        window[eventName]()
    }
})

contextBridge.exposeInMainWorld('electronAPI', {
  attachModel: (componentName,componentId) => {
    return new Promise((resolve, reject) => {
        ipcRenderer.send('attach-model', componentName,componentId);
        // Écouter spécifiquement les réponses pour cet ID
        const responseHandler = (_, responseId) => {
            if (responseId === componentId) {
                ipcRenderer.removeListener('attach-model-ok', responseHandler);
                ipcRenderer.removeListener('attach-model-error', errorHandler);
                resolve();
            }
        };
        
        const errorHandler = (_, responseId, error) => {
            if (responseId === componentId) {
                ipcRenderer.removeListener('attach-model-ok', responseHandler);
                ipcRenderer.removeListener('attach-model-error', errorHandler);
                reject(error);
            }
        };
        
        ipcRenderer.on('attach-model-ok', responseHandler);
        ipcRenderer.on('attach-model-error', errorHandler);
    })
  },


  callingModel: (componentId,functionName,...args) => {
     return new Promise((resolve, reject) => {
            // Générer un ID unique pour cet appel
           
            const callId= `${componentId}-${functionName}-${Date.now()}`;
            // Envoyer la requête avec l'ID
            ipcRenderer.send('calling-model', componentId, functionName,callId, args);
            
            // Écouter spécifiquement les réponses pour cet ID
            const responseHandler = (_, responseId, result) => {
                if (responseId === callId) {
                    ipcRenderer.removeListener('calling-model-response', responseHandler);
                    ipcRenderer.removeListener('calling-model-error', errorHandler);
                    resolve(result);
                }
            };
            
            const errorHandler = (_, responseId, error) => {
                if (responseId === callId) {
                    ipcRenderer.removeListener('calling-model-response', responseHandler);
                    ipcRenderer.removeListener('calling-model-error', errorHandler);
                    reject(error);
                }
            };
            
            ipcRenderer.on('calling-model-response', responseHandler);
            ipcRenderer.on('calling-model-error', errorHandler);
        });
  },
  menuEntry:(menuTemplate)=>{
    ipcRenderer.send('menu-entry', menuTemplate);
  }
})



window.addEventListener('load',()=>{
    ipcRenderer.send('win-loaded');
})