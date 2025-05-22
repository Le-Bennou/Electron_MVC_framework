const { app, BrowserWindow,ipcMain } =require('electron')
const path = require('node:path')
const  MenuManager = require('./MenuManager.cjs').MenuManager

const  COMPONENTS = require ('./componentsList.js').COMPONENTS

const  fileURLToPath =require( 'url')
const  dirname = require( 'path');
/*
// Créer l'équivalent de __dirname pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
*/


/**
 * Description placeholder
 *
 * @export
 * @class WindowHandler
 * @typedef {WindowHandler}
 */
exports.WindowHandler = class WindowHandler{

    #menuManager = new MenuManager()
    #mainWindow = null
    #indexHTMLPath = 'src/index.html'
    #windowOptions = null
    #windowOptions2 = null
    #models = {}
    #basePath = ""
    
    /**
     * Créer la fen^tre princiaple de l'application
     * @memberof WindowHandler
     * @constructor
     * @param {JSON} windowOptions 
     *  [https://www.electronjs.org/docs/latest/api/menu#menutemplate](https://www.electronjs.org/docs/latest/api/menu#menutemplate)
     */
    constructor(windowOptions,windowOptions2){
        // Ajouter le chemin de base de l'application
        this.#basePath = path.resolve(__dirname, '../../');
        this.#windowOptions = windowOptions
        this.#windowOptions2 = windowOptions2
       
        // Si l'application est lancée, on crée la fenêtre
        app.whenReady().then(() => {
            this.#createWindow()
            ipcMain.on('win-loaded', this.#handleReloadeRenderer.bind(this))
            ipcMain.on('attach-model', this.#attachModel.bind(this))
            ipcMain.on('calling-model', this.#handleCallingModel.bind(this))
            ipcMain.on('menu-entry', this.#handleMenuEntry.bind(this))
            //Pour MacOs, si l'application est réactivée et qu'il n'y a pas de fenêtre ouverte, on en crée une
            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) this.#createWindow()
            })


        })

       

        // Pour MacOs, s'il n'y a aucune fen^tre ouverte, on quitte l'application
        app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
        })
    }


    #createWindow(){
        this.#windowOptions. webPreferences= {
                preload: path.join(__dirname, 'processLink.js')
            }
        this.#mainWindow  = new BrowserWindow(this.#windowOptions)

        this.#mainWindow.loadFile(this.#indexHTMLPath)

        if(this.#windowOptions2 && this.#windowOptions2.maximize){
            this.#mainWindow.maximize()
        }  
    }

    /**
     * Crée les liens entre le model et le controlleur
     * @memberof WindowHandler
     * @private
     * @param {*} event 
     * @param {string} componentName 
     * @param {string} componentId 
     * @returns 
     */
    #attachModel(event,componentName,componentId){
        
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        const componentPath = COMPONENTS.find(component => component.name === componentName).path
        const moduleType = COMPONENTS.find(component => component.name === componentName).moduleType
         // On vérifie si le composant existe
        if (!componentPath) {
            win.webContents.send('attach-model-error', `Le composant ${componentName} n'existe pas`)
            throw new Error(`Le composant ${componentName} n'existe pas`)
        }
        if(this.#models[componentId]) {
            win.webContents.send('attach-model-ok', componentId);
            return
        }


        try {
            const modulePath = path.join(this.#basePath, 'Components', componentPath, `M_${componentName}.${moduleType}`);
            const module = require(modulePath);
            this.#models[componentId] = {
                module: new module[`${componentName}_Model`](componentId,win),
                path: componentPath,
                name: componentName,
                moduleType: moduleType,
                fullPath: modulePath
            };
            win.webContents.send('attach-model-ok', componentId);
        } catch (error) {
            win.webContents.send('attach-model-error', componentId, error);
        }
    }

    /**
     * fait passer les appels de fonction du controlleur au model
     * @memberof WindowHandler
     * @private
     * @param {*} event 
     * @param {*} componentId 
     * @param {*} functionName 
     * @param {*} callId 
     * @param {*} args 
     */
    #handleCallingModel (event,componentId, functionName,callId, args) {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        const model = this.#models[componentId].module
         try{
            const result = model[functionName](...args)
            if(result && result.then){
                result
                .then(result => {
                    win.webContents.send('calling-model-response', callId, result);
                })
                .catch(error => {
                    win.webContents.send('calling-model-error', callId, error);
                });
            }else{
                win.webContents.send('calling-model-response', callId, result);
            }
        }catch(e){
            console.error(`Erreur dans le modèle ${componentId} : ${e}`)
            win.webContents.send('calling-model-error', callId, e);
        }
    }


/**
 * Fait uivre la demande du controller de créer une menu
 * @private
 * @memberof WindowHandler
 * @param {*} event 
 * @param {Array} menu 
 */
    #handleMenuEntry(event,menu){
         menu = JSON.parse(menu)
        menu.forEach(m=>{
            if(!m.submenu) return
            m.submenu.forEach(sm=>{
                if(sm.click){
                    let funcId = sm.click
                    sm.click = ()=>{
                        this.#menuManager.menuEvent(funcId)
                    }
                }
            })
        })
        this.#menuManager.addMenuItem(menu)
    }
    
    /**
     * Purge les modèles et reset le menu quand la page est rechargée
     * @private
     * @memberof WindowHandler
     */
    #handleReloadeRenderer(){
        for (const componentId in this.#models) {
            if (this.#models[componentId].module && this.#models[componentId].module.destroy) {
                this.#models[componentId].module.destroy();
            }
            
            try {
                const modelPath = this.#models[componentId].fullPath;
                if (require.cache[modelPath]) {
                    const module = require.cache[modelPath];
                    if (module.children) {
                        module.children.forEach(child => {
                            if (!child.path.includes('node_modules')) {
                                delete require.cache[child.id];
                            }
                        });
                    }
                    delete require.cache[modelPath];
                }
            } catch (e) {
                console.error(`Erreur lors du déchargement du module ${componentId}:`, e);
            }
            
            delete this.#models[componentId];
        }
        
        this.#models = {};
        this.#menuManager.reset();
        
        // Force le garbage collector si disponible
        if (global.gc) {
            try {
                global.gc();
            } catch (e) {
                console.warn('Garbage collection failed:', e);
            }
        }
    }
}
