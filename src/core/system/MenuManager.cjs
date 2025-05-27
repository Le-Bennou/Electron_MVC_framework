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
        //FIXME: il arrive que des soumenu soient en double.
        //parcourir this.#menuItem, si this.#menuItem[x] == this.#menuItem[y] fusionner leur submenu
        const mergedMenuItems = this.#menuItems.reduce((acc, item) => {
            const existingItem = acc.find(i => i.label === item.label)
            if (existingItem) {
                // Fusionner les sous-menus

                existingItem.order = existingItem.order || 1000000
                item.order = item.order || 1000000
                
                //si order n'exitate pas dans l'un d'entre eux mais dans l'autre
                if (existingItem.order !== item.order) {
                    existingItem.order = Math.min(existingItem.order, item.order)
                }


                //éviter les doublons dans submenu
                if (!existingItem.submenu) {
                    existingItem.submenu = []
                }
            item.submenu.forEach(subItem => {
                    // Vérifier si le sous-menu existe déjà
                     if (subItem.type === 'separator') {
                    existingItem.submenu.push(subItem);
                    return;
                }
                    const existingSubItem = existingItem.submenu.find(s => s.label === subItem.label)
                    if (!existingSubItem) {
                        existingItem.submenu.push(subItem)
                    } else {
                        // Fusionner les sous-menus existants
                        existingSubItem.order = Math.min(existingSubItem.order, subItem.order || 1000000)
                        if (subItem.click) {
                            existingSubItem.click = subItem.click
                        }
                    }
                })
              //  existingItem.submenu.push(...item.submenu)
            
            } else {
                acc.push(item)
            }
            return acc
        }, [])

       //tri les menus par ordre croissant
        mergedMenuItems.sort((a, b) => {
            if (a.order === b.order) return 0
            return a.order < b.order ? -1 : 1
        })
        
        //tir les submenu
        mergedMenuItems.forEach(item => {
            if (item.submenu) {
                item.submenu.sort((a, b) => {
                    if (a.order === b.order) return 0
                    return a.order < b.order ? -1 : 1
                })
            }
        })
        //creer le menu à paritr de ce template
        this.#menuInstance = Menu.buildFromTemplate(mergedMenuItems)

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
