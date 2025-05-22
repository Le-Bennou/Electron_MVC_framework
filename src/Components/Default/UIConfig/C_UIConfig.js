import { abstractController } from '../../../core/system/base/abstractController.js';

export class UIConfig_Controller extends abstractController{
    #configOpen = false
    #demoOpen = false
    #ratio = 1
    #fontSize = 16
    #primaryColorh = 0
    #primaryColors = '0%'
    #primaryColorl = '0%'
    #colorScheme= 'dark'
    


    onReady(){
        
        //alimenter #ratio,#fontisze... avec getProperty de document.doecumentElement
        this.#ratio = getComputedStyle(document.documentElement).getPropertyValue('--ratio')
        this.#fontSize = getComputedStyle(document.documentElement).getPropertyValue('font-size')
        this.#primaryColorh = getComputedStyle(document.documentElement).getPropertyValue('--primary-hue')
        this.#primaryColors = getComputedStyle(document.documentElement).getPropertyValue('--primary-s')
        this.#primaryColorl = getComputedStyle(document.documentElement).getPropertyValue('--primary-l')
        this.#colorScheme = getComputedStyle(document.documentElement).getPropertyValue('color-scheme')

        //metre les valeur dans les difrent input de la vue
        this.view['#sizeScale'].value = this.#ratio
        this.view['#fontSize'].value = this.#fontSize.replace('px','')
        this.view['#primaryColor'].value = this.#HSLToHex(this.#primaryColorh, this.#primaryColors.replace('%',''), this.#primaryColorl.replace('%',''))
        this.view['#light'].classList.add('inactive-button')
        this.view['#dark'].classList.remove('inactive-button')

        if(this.#colorScheme == 'dark'){
            this.view['#dark'].classList.add('inactive-button')
            this.view['#light'].classList.remove('inactive-button')
        }
        else{
            this.view['#light'].classList.add('inactive-button')
            this.view['#dark'].classList.remove('inactive-button')
        }

        //traiter la marge du body et le top de demo
        if(this.#configOpen){
            
            document.body.style.cssText = "padding-top:50px;"
            this.view['#demo'].style.top ="50px"
        }else{
            
            document.body.style.cssText = ""
            this.view['#demo'].style.top ="0"
        }
    }

    setupMenu(){
        this.#configOpen = getComputedStyle(this.view.querySelector('#config')).getPropertyValue('display') != 'flex'  ? false : true
        this.#demoOpen = getComputedStyle(this.view.querySelector('#demo')).getPropertyValue('display') != 'block' ? false : true
 
         this.addMenuEntry({
            label : "UI Maker",
            order:1,
            submenu:[
                {
                    label:"Edit config",
                    order:8,
                    type:"checkbox",
                    checked:this.#configOpen,
                    click: this.showConfig
                },
                 {
                    order:7,
                    label:"Demo Page",
                    type:"checkbox",
                    checked:this.#demoOpen,
                    click: this.showDemo
                }
            ]
        })
    }

    showConfig(){
        if(this.#configOpen){
            document.documentElement.style.setProperty('--uiCongig-edit-display', 'none')
            this.model.setConfigOpen(false)
            document.body.style.cssText = ""
            this.view['#demo'].style.top ="0"
        }else{
            document.documentElement.style.setProperty('--uiCongig-edit-display', 'flex')
            this.model.setConfigOpen(true)
            document.body.style.cssText ="padding-top:50px;"
            this.view['#demo'].style.top ="50px"
        }
        this.#configOpen = getComputedStyle(this.view.querySelector('#config')).getPropertyValue('display') != 'flex' ? false : true
    }

    showDemo(){
        
        if(this.#demoOpen){
            document.documentElement.style.setProperty('--uiCongig-demo-display', 'none')
            this.model.setDemoOpen(false)
        }else{
            this.model.setDemoOpen(true)
            document.documentElement.style.setProperty('--uiCongig-demo-display', 'block')
        }
        this.#demoOpen = getComputedStyle(this.view.querySelector('#demo')).getPropertyValue('display') != 'block' ? false : true
    }


    setupEventListeners(){
        this.view['#light'].onClick = ()=>{
            this.view['#light'].classList.remove('inactive-button')
            this.view['#dark'].classList.add('inactive-button')
            document.documentElement.style.setProperty('color-scheme', `light`)
            this.#colorScheme = 'light'
            this.#save()
        }

        this.view['#dark'].onClick = ()=>{
            this.view['#light'].classList.add('inactive-button')
            this.view['#dark'].classList.remove('inactive-button')
            document.documentElement.style.setProperty('color-scheme', `dark`)
            this.#colorScheme = 'dark'
            this.#save()
        }

        this.view['#fontSize'].onInput = ()=>{
            document.documentElement.style.setProperty('font-size', `${this.view['#fontSize'].value}px`)
            this.#fontSize = this.view['#fontSize'].value
            this.#save()
           
        }

            this.view['#sizeScale'].onInput = ()=>{
            document.documentElement.style.setProperty('--ratio', `${this.view['#sizeScale'].value}`)
            this.#ratio = this.view['#sizeScale'].value
            this.#save()
 
        }

         this.view['#primaryColor'].onInput = ()=>{
            const hsl = this.#hexToHSL(this.view['#primaryColor'].value)
            document.documentElement.style.setProperty('--primary-hue',hsl.h)
            document.documentElement.style.setProperty('--primary-s',hsl.s+'%')
            document.documentElement.style.setProperty('--primary-l',hsl.l+'%')
            this.#primaryColorh = hsl.h
            this.#primaryColors = hsl.s+'%'
            this.#primaryColorl = hsl.l+'%'
            this.#save()

        }
    }

    #save(){
        this.model.saveConfig({
            '--ratio': this.#ratio,
            'font-size': this.#fontSize,
            '--primary-hue': this.#primaryColorh,
            '--primary-s': this.#primaryColors,
            '--primary-l': this.#primaryColorl,
            'color-scheme': this.#colorScheme

        })
    }

    #hexToHSL(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min){
            h = s = 0; 
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }            
            h /= 6;
        }
        h = Math.round(h*360);
        s = Math.round(s*100);
        l = Math.round(l*100);
        return { h, s, l };
    }

    #HSLToHex(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r, g, b;
        if (h < 60) {
            r = c; g = x; b = 0;
        } else if (h < 120) {
            r = x; g = c; b = 0;
        } else if (h < 180) {
            r = 0; g = c; b = x;
        } else if (h < 240) {
            r = 0; g = x; b = c;
        } else if (h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        return `#${Math.round((r + m) * 255).toString(16).padStart(2, '0')}${Math.round((g + m) * 255).toString(16).padStart(2, '0')}${Math.round((b + m) * 255).toString(16).padStart(2, '0')}`;
    }
}
