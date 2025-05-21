# FrameWork MVC pour application electron

## Description

Le framework utilise les **customElement** pour créer des composants MVC.
Chaque composants sera donc une balise &lt;prefix-composant&gt;.

Où **préfix** est configuré dans **config.json**  et **composant** est le nom qu'on a donné au composant.

### Le Model

Le model de chaque compoant est un fichier javascript exécuté par nodeJs, il a donc accès aux système de fichiers, à une base de donnée (tout ce que nodeJs permet)

### Le Controller

Le controller de chaque composant est une fichier javascript exécuté dans la fen^tre navigateur de l'application, il peut communiquer avec son model de manière tranparente, et avec sa vue

### La Vue

La vue de chaque composant est divisée en deux fichier HTML/CSS

## Installation

Modifier les lignes suivante de **package.json**

```json
{
  "name": "Le nom de l'applicationn",
  "productName": "Le nom de l'applicationn sans charctère spéciaux ni espace (je crois)",
  "version": "1.0.0",
  "description": "la Description de l'app",
  ...
  "author": {
    "name": "nom de l'auteur",
    "email": "mail de l'auteur"
  },
 ...
}


```

Ouvrir un shell dans le dossier qui contient **package.json** et executer 
```shell
npm install
```

## Configuration

Editer le fichier **config.json** pour attribuer un **prefix** aux balise HTML des composants.
    Pour qu'un custom élemtn soit valide il faut que le nom de sa balise contienne un préfix

## création de nouveaux composants

Il suffit de créer un dossier dans **Componens/** (ou une arborscence), portant le nom du composant et d'executer dans un shell
```shell
npm run updateComponents
```

## suppression d'un composant

Pour supprimer un composant, supprimer son dossier et executer
```shell
npm run updateComponents
```

sans ça une erreur indiquera que le composant est introuvable

## Création de la fenêtre principale

Dans **main.js**

```js
const mainWin = new WindowHandler( width,height);

```

## création d'un menu

```js
MenuManager.createMenu([
    {
        label: 'Menu',
        submenu: [
            {
                label: 'sous menu',
                accelerator: 'CmdOrCtrl+T',
                click: () => {
                    MenuManager.menuEvent("menu")
                }
            }
        ]
    }
]);
```


**MenuManager.menuEvent("menu")** permet de créer un event nomé "menu", pour écouter cet event dans un controller on fait

```js
class monComposant_controller{
  setupEventListeners (){
          this.addMenuEventListener('menu', () => {
              console.log('menu event received');
          });
      }
}
```

## comunication entre le Controller et le Model

Ce fait de manière tranparente : le Controller a une propriété **model** qui "contient" les méthodes déclarées dans le Model.

Les méthodes du model peuvent être des Promesses ou de simple fonction. Il est fortement conseiller d'utiliser les promesses.

Dans tous les cas le Controller recevra lui une Promesse.

Dans le controller
```js
class monComposant_Controller{
  foo (){
      this.model.maMethode(arg1,arg2,arg3)
      .then(reponse=>{
        // ici je gère la reponse
      })
      .catch(err=>{
        // ici je gère les erreurs
      })
  }
}

```

Dans le Model
```js
class monComposant_Model{
  maMethode(arg1,arg2,arg3){
     return new Promise((resolve,reject)=>{
      if(tout va bien){
        resolve("la réponse")
      }else{
        reject("message d'erreur)
      }
     })
  }
}
```

ou sous forme de fonction simple
```js
class monComposant_Model{
  maMethode(arg1,arg2,arg3){
    // traitement
     return "la reponse"
  }
}
```


## communication entre Composants [TODO]

pas encore implémenté.

C'est un peu comme une bouteille à la mer, le composant qui veut communiquer avec un autre va envoyer un message en précisant son type et son destinataire (facultatif).

Un autre composant va être à l'écoute de ce type de message, si le destinataire est précisé et que cela le concerne ou si aucun destinataire n'est sépcifié il va traiter le message.

Il peut alors envoyer une reponse, dans ce cas seul le Composant à l'origine du message est concerné.


Celle-ci se fait via les méthodes

```js
sendMessage(messageType,message,[destinataire]).then(reponse=>{
  //traite la reponse
})
```

et

```js
messageListener(messageType,(message,[sender])=>{
  //traite le message
})
```

