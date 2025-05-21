import { AbstractModel }from  '../../../core/system/base/abstractModel.cjs'
import * as fs from 'fs'


export class UIConfig_Model extends AbstractModel{

    #configOpen =false
    #demoOpen = false

    setConfigOpen(val){
        this.#configOpen = val
        this.saveConfig()
    }

    getConfigOpen(){
        return this.#configOpen
    }

    setDemoOpen(val){
        this.#demoOpen = val
        this.saveConfig()
    }

     getDemoOpen(){
        return this.#demoOpen
    }

    saveConfig(config=null){
        let configcontent = fs.readFileSync('./src/config.css', 'utf8');
        const configDiplays = `/*$UIConfig_displays$*/
                --uiCongig-edit-display:${this.#configOpen ? 'flex' : 'none'};
                --uiCongig-demo-display:${this.#demoOpen ? 'block' : 'none'};
             /*$/UIConfig_displays$*/`

        if(config==null){
            const regex = /\/\*\$UIConfig_displays\$\*\/(.*?)\/\*\$\/UIConfig_displays\$\*\//s;
            configcontent = configcontent.replace(regex, configDiplays);
        }else{
            //remplacer tout ce qui est entre /*$UIConfig$*/ et /*$/UIConfig$*/
            const regex = /\/\*\$UIConfig\$\*\/(.*?)\/\*\$\/UIConfig\$\*\//s;
            configcontent = configcontent.replace(regex, `/*$UIConfig$*/
                :root{
                  color-scheme:${config["color-scheme"]};

                  --ratio:${config["--ratio"]};
                  font-size:${config["font-size"]}px;

                  --primary-hue:${config["--primary-hue"]};
                  --primary-s:${config["--primary-s"]};
                  --primary-l:${config["--primary-l"]};

                  /*spécifique au composant UIConfig*/
                  /*$UIConfig_displays$*/
                    --uiCongig-edit-display:${this.#configOpen ? 'flex' : 'none'};
                    --uiCongig-demo-display:${this.#demoOpen ? 'block' : 'none'};
                  /*$/UIConfig_displays$*/
            }/*$/UIConfig$*/`);
        }

        fs.writeFileSync('./src/config.css', configcontent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File written successfully');
            }
        });
    }
 
}