import {COMPONENTS} from './componentsList.js';
import { PREFIX } from '../../../config.js';

const allHandler = {
	set: (obj, prop, val) => {
		obj.forEach(o => {
			o[prop] = val;
		});
         return true
	},
	get: (obj, prop) => {
       
		let os = [];
		obj.forEach(o => {
            o = new Proxy(o, elementHandler)
            if(o[prop]){
                os.push(o[prop]);
            }
		});
		return new Proxy(os, allHandler);
	}
};

Object.defineProperty(NodeList.prototype, 'all', {
	get: function() {
		return new Proxy(this, allHandler);
	},
});

globalThis.appReady = false
let countComponentReady = COMPONENTS.length
COMPONENTS.forEach(async component => {
    const {name,path} = component;
    const componentPath = path.replace(/\\/g, '/');


    //créer le template
    const template = document.createElement('template');
    const templateContent = await fetch(`./Components/${componentPath}/V_${name}.html`)
    template.id = `${name}_View`
    template.innerHTML = `
        <link rel="stylesheet" href="./Components/${componentPath}/V_${name}.css">
        ${await templateContent.text()}
    `;
    document.body.appendChild(template);

    // Importer le controller
    import(`../../Components/${componentPath}/C_${name}.js`)
        .then(module => {
            const controller = module[`${name}_Controller`]
            //definir le custom element
            customElements.define(`${PREFIX}-${name.toLowerCase()}`, controller);
            countComponentReady--
            if(countComponentReady == 0){
                globalThis.appReady = true
            }
        })
        .catch(error => {
            console.error(`Error loading controller for ${name}:`, error);
        });

}
)