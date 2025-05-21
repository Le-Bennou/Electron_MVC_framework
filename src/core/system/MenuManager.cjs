const  { Menu,MenuItem, BrowserWindow  } =require ('electron')



/**
 * Description placeholder
 *
 * @export
 * @class MenuManager
 * @typedef {MenuManager}
 */
exports.MenuManager = class MenuManager{
    #menuInstance= null 
    #menuItems = [] // Stockage temporaire des items


    
    /**
     * Ajoute un ou plusieurs items au menu
     * Si l'item principale (dans la barre de menu) n'existe pas, il sera créé
     * sinon, les sous menus seront ajoutés à l'item existant
     * @memberof MenuManager
     * @param {Array} template 
     * @example
     * MenuManager.addMenuItem([{
     *  label: 'File',
     *  submenu: [
     *   {
     *    label: 'New',
     *   click: () => { }
     *   }
     *  ]
     * }])
     */
    addMenuItem(template) {
        if (!this.#menuInstance) this.#createMenuInstance()
        
        // Ajouter les templates au stockage temporaire avec leur ordre
        template.forEach(t => {
            // Si order n'est pas défini, mettre une grande valeur par défaut
            const order = t.order !== undefined ? t.order : 1000
            this.#menuItems.push({ ...t, order })
        })

        // Trier et recréer tout le menu
        this.#rebuildMenu()
    }


    /**
     * Reorganise les menu en fonction de order
     * @private
     * @memberof MenuManager
     */
    #rebuildMenu() {
        // Trier les items par ordre
        const sortedItems = this.#menuItems.sort((a, b) => a.order - b.order)

        // Créer un nouveau menu
        this.#createMenuInstance()

        // Ajouter les items triés
        sortedItems.forEach(item => {
            // Retirer la propriété order avant de créer le MenuItem
            const { order, ...menuItemTemplate } = item
            
            let existing = this.#menuInstance.items.find(mi => mi.label === item.label)
            
            if (existing) {
                if (item.submenu) {
                    item.submenu.forEach(sm => {
                        existing.submenu.append(new MenuItem(sm))
                    })
                }
            } else {
                if (!menuItemTemplate.submenu) menuItemTemplate.submenu = []
                this.#menuInstance.append(new MenuItem(menuItemTemplate))
            }
        })

        Menu.setApplicationMenu(this.#menuInstance)
    }

    /**
     * Supprime tous les items du menu
     * appelé au reload de la page
     * @memberof MenuManager
     * 
     */
    reset(){
        this.#menuItems = [] 
    }

    /**
     * Envois event poru le controlleur
     * @memberof MenuManager
     * appelé automatiquement par le click sur un menu item
     * @param {string} eventName
     */ 
    menuEvent(eventName){
        BrowserWindow.getFocusedWindow().webContents.send('calling-menuEvent', eventName);
    }

    #createMenuInstance(){
        this.#menuInstance = new Menu()
        Menu.setApplicationMenu(this.#menuInstance);
    }

}
