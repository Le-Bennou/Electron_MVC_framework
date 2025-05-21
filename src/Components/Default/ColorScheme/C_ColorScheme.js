import { abstractController } from '../../../core/system/base/abstractController.js';

export class ColorScheme_Controller extends abstractController{
    noModel = true
    noView = true


    onReady(){
        const colorScheme = localStorage.getItem("colorScheme");
       if(colorScheme){
            this.#setColorSheme(colorScheme)
       }
    }

    setupMenu(){
        this.addMenuEntry({
            label : "ColorScheme",
            order:100,//ordre du menu
            submenu:[
                {
                    label:"Light",
                    click: this.lightColorScheme
                },
                 {
                    label:"Dark",
                    click: this.darkColorScheme
                }
            ]
        })
    }

    lightColorScheme(){
        this.#setColorSheme('light')
    }

    darkColorScheme(){
        this.#setColorSheme('dark')
    }

    #setColorSheme(colorScheme){
        localStorage.setItem("colorScheme", colorScheme);
        document.documentElement.style.setProperty('color-scheme', colorScheme)
    }
}
