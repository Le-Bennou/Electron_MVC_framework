import {COMPONENTS} from './componentsList.js';
import { PREFIX } from '../../../config.js';



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
        })
        .catch(error => {
            console.error(`Error loading controller for ${name}:`, error);
        });

}
)