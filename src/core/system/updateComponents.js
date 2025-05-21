/**
 * Mise à jour des composants
 */



// lister le dossier dans Components/

const fs = require('fs')
const path = require('path')


const ComponentsList = []


/**
 * Parcours récursivement les dossiers pour trouver et gérer les composants
 * @param {string} dirPath - Chemin du dossier à analyser
 */
function scanComponentsFolder(dirPath) {
    try {
        // Lire le contenu du dossier
        const items = fs.readdirSync(dirPath)

        // Si le dossier est vide
        if (items.length === 0) {
            createComponent(dirPath,path.basename(dirPath)) 
            ComponentsList.push({
                name: path.basename(dirPath),
                path: dirPath.replace(/src\\Components\\/,''),
                moduleType: moduleType
            })
            return
        }

        let hasFiles = false
        
        // Parcourir tous les éléments du dossier
        items.forEach(item => {
            const fullPath = path.join(dirPath, item)
            const stat = fs.statSync(fullPath)

            if (stat.isFile()) {
                hasFiles = true
            } else if (stat.isDirectory()) {
                // Appel récursif pour les sous-dossiers
                scanComponentsFolder(fullPath)
            }
        })

        // Si le dossier contient des fichiers, l'ajouter à la liste
        if (hasFiles &&  path.basename(dirPath)!="Components") {
            //donner à modulType la valeur en fonction de l'extention du fichier M_Component
            const files = fs.readdirSync(dirPath)
            let mType = "cjs"
            files.forEach(file => {
                if (file.startsWith('M_') && file.endsWith('.mjs')) {
                    mType = "mjs"
                }
            })
            ComponentsList.push({
                name: path.basename(dirPath),
                path: dirPath.replace(/src\\Components\\/,''),
                moduleType: mType
            })
        }
    } catch (error) {
        console.error(`Erreur lors de la lecture du dossier ${dirPath}:`, error)
    }
}


/**
 * Crée le composant
 * copie les fichier templates
 * et crée les fichiers de base
 * @param {string} componentName - Nom du composant
 */
function createComponent(dirPath,ComponantName) {
    //ouvre le fichier controllerTamplate.js
    const controllerTemplate = fs.readFileSync(path.join(__dirname,'base\\', 'controllerTemplate.js'), 'utf8')
    //ouvre le fichier modelTemplate.js
    const modelTemplate = fs.readFileSync(path.join(__dirname,'base\\',  `modelTemplate.${moduleType}`), 'utf8')

    const cssViewcontent = fs.readFileSync(path.join(__dirname,'base\\',  'viewTemplate.css'), 'utf8')
    const htmlViewcontent = fs.readFileSync(path.join(__dirname,'base\\',  'viewTemplate.html'), 'utf8')

    //modifie le nom du composant

    const abstractControllerPath = '../'.repeat(dirPath.split(path.sep).length - 1)
    const controllerContent = controllerTemplate.replace(/\$ComponentName\$/g, ComponantName).replace('$path$', abstractControllerPath) 
    const modelContent = modelTemplate.replace(/\$ComponentName\$/g, ComponantName).replace('$path$', abstractControllerPath)
    const cssViewContent = cssViewcontent.replace('$path$', abstractControllerPath)
    const htmlViewContent = htmlViewcontent.replace(/\$ComponentName\$/g, ComponantName)

    // Crée le fichier C_[composant].js
    fs.writeFileSync(path.join( dirPath, `C_${ComponantName}.js`), controllerContent, 'utf8')
    // Crée le fichier M_[composant].js
    fs.writeFileSync(path.join( dirPath, `M_${ComponantName}.${moduleType}`), modelContent, 'utf8')
    // Crée le fichier V_[composant].html
    fs.writeFileSync(path.join( dirPath, `V_${ComponantName}.html`),htmlViewContent, 'utf8')
    // Crée le fichier V_[composant].css
    fs.writeFileSync(path.join( dirPath, `V_${ComponantName}.css`), cssViewContent, 'utf8')
}

let moduleType ="cjs"
// check si arv contient l'indication d'utiliser les module ES6
const isES6 = process.argv.includes('es6')

if(isES6){
    moduleType = "mjs"
    console.log("Utilisation des modules ES6")
}

scanComponentsFolder('src/Components')

//TODO : comparer l'arbo de coponentsList.js et la vraie pour mettre à jour si besoin

// Crée le fichier componentsList.json
fs.writeFileSync('./src/core/system/componentsList.js', `export const COMPONENTS = ${JSON.stringify(ComponentsList, null, 2)}`, 'utf8')
