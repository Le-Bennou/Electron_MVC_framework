const fs = require('fs');
const path = require('path');


//FIXME le path dans componentsList n'est pas bien mis à jour (si dans sous dossier)

/**
 * Cherche récursivement un composant dans l'arborescence
 * @param {string} dirPath - Chemin du dossier à analyser
 * @param {string} componentName - Nom du composant à trouver
 * @returns {string|null} Chemin complet du composant ou null si non trouvé
 */
function findComponent(dirPath, componentName) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (item === componentName) {
                return fullPath;
            }
            const found = findComponent(fullPath, componentName);
            if (found) return found;
        }
    }
    return null;
}

function renameComponent(oldName, newName) {
    const componentsPath = 'src/Components';
    
    // Chercher le composant de manière récursive
    const oldPath = findComponent(componentsPath, oldName);
    if (!oldPath) {
        throw new Error(`Le composant ${oldName} n'existe pas`);
    }

    // Construire le nouveau chemin en préservant l'arborescence
    const parentDir = path.dirname(oldPath);
    const newPath = path.join(parentDir, newName);

    try {
        // Vérifier si le nouveau nom n'existe pas déjà
        if (fs.existsSync(newPath)) {
            throw new Error(`Un composant nommé ${newName} existe déjà`);
        }

        // Renommer les fichiers dans le dossier
        const files = fs.readdirSync(oldPath);
        files.forEach(file => {
            const oldFile = path.join(oldPath, file);
            const newFile = path.join(oldPath, file.replace(oldName, newName));
            fs.renameSync(oldFile, newFile);

            // Mettre à jour le contenu des fichiers
            if (file.endsWith('.js') || file.endsWith('.html')) {
                let content = fs.readFileSync(newFile, 'utf8');
                content = content.replace(new RegExp(oldName, 'g'), newName);
                fs.writeFileSync(newFile, content, 'utf8');
            }
        });

        // Renommer le dossier
        fs.renameSync(oldPath, newPath);

        // Mettre à jour componentsList.js avec le chemin relatif correct
        const componentsListPath = './src/core/system/componentsList.js';
        let componentsList = fs.readFileSync(componentsListPath, 'utf8');
        const oldRelativePath = path.relative(componentsPath, oldPath);
        const newRelativePath = path.relative(componentsPath, newPath);
        
        componentsList = componentsList.replace(
            new RegExp(`"name": "${oldName}"`, 'g'),
            `"name": "${newName}"`
        );
        componentsList = componentsList.replace(
            new RegExp(`"path": "${oldRelativePath}"`, 'g'),
            `"path": "${newRelativePath}"`
        );
        fs.writeFileSync(componentsListPath, componentsList, 'utf8');

        console.log(`Composant ${oldName} renommé en ${newName} avec succès`);

    } catch (error) {
        console.error('Erreur lors du renommage :', error.message);
    }
}
// Récupérer les arguments de la ligne de commande
const [oldName, newName] = process.argv.slice(2);

if (!oldName || !newName) {
    console.error('Usage: node renameComponent.js <ancien_nom> <nouveau_nom>');
    process.exit(1);
}

renameComponent(oldName, newName);