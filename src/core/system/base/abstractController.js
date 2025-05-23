import { COMPONENTS } from "../componentsList.js";

// Sauvegarde de la fonction console.log originale

/**
 * Class abstraite Pour les controlleur
 * 
 * gére le communication avec le Model (proxy) et la vue (proxy)
 * @template TModel
 * @export
 * @class abstractController
 * @extends {HTMLElement}
 */
export class abstractController extends HTMLElement {

  static #countInstances = [];                          // compte les instance pour crée callId
  static #anonymousCounter = 0;                       // compte les function anonye des menu pour uniqId

  static getNewInstance(name) {
    if (!abstractController.#countInstances[name]) {
      abstractController.#countInstances[name] = 0;
    }
    return abstractController.#countInstances[name]++;
  }

  /** @type {TModel} */
  model

  #modelLinked = false;

  constructor() {
    super();
    this._name = this.constructor.name.replace('_Controller', '');
    this._path = COMPONENTS.find(component => component.name === this._name).path;
    this._callId = this._name + abstractController.getNewInstance(this._name);

    this.#createModelLink()
    this.#createShadowDOM()

      this.isReady().then(() => {
        this.setupEventListeners()

    })

   
      this.isReady().then(() => {
        this.setupMessageListeners()
      })


    
      this.isReady().then(() => {
        this.setupMenu()
      })
  
  }

  /**
   * Déclarer ici les écouteurs d'évènements
   */
  setupEventListeners(){

  }

  /**
   * Déclarer ici les écouteur de message
   */
  setupMessageListeners(){

  }

  /**Déclarer ici les entrées dans le menu */
  setupMenu(){

  }

  /**
   * Applé quand la vue et le model sont opérationnels
   */
  onReady(){

  }



  connectedCallback() {
    if (this.onReady) {
      this.isReady().then(() => {
        this.onReady()
      })
    }
  }

  get name() {
    return this._name;
  }


  /**
   * Ajoute une entrée de menu à la barre de menu de l'application.

   * @param {JSON} menuTemplate 
   * [https://www.electronjs.org/docs/latest/api/menu#menutemplate](https://www.electronjs.org/docs/latest/api/menu#menutemplate)
   * @memberof abstractController
   */
  addMenuEntry(menuTemplate) {
    if (!Array.isArray(menuTemplate)) menuTemplate = [menuTemplate]
    menuTemplate.forEach(mt => {
      mt.submenu.forEach(sm => {
        if (sm.click) {
          let funcName = sm.click.name
          let eventName
          if (funcName.toLowerCase() == "click" || funcName == '') {
            //renommer la fonction avec un id unique
            eventName = `${this._callId}_anonymous_${abstractController.#anonymousCounter++}`
          } else {
            eventName = `${this._callId}_${sm.click.name}`
          }

          this.addMenuEventListener(eventName, sm.click)
          sm.click = eventName
        }
      })
    })

    window.electronAPI.menuEntry(JSON.stringify(menuTemplate))
  }

  /**
   * Ajoute un écouteur d'événement envoyé par un menu item
   * @param {string} eventName - Nom de l'événement.
   * @param {function} callback - Fonction de rappel à exécuter lorsque l'événement se produit.
   * @memberof abstractController
   * @example
   * this.addMenuEventListener('myEvent', () => { })
   * où myEvent sera déclenché par le click sur un menu item
   */
  addMenuEventListener(eventName, callback) {
    document.addEventListener(eventName, callback.bind(this))
  }



  /**
   * Ajoute un écouteur d'événement pour les messages envoyés par d'autres composants.
   * 
   * Le callback reçoit deux arguments : le message et l'expéditeur.
   * Le message est le contenu du message envoyé par l'expéditeur.
   * L'expéditeur est l'élément qui a envoyé le message.
   * On peut utiliser sender.reponse() pour répondre au message directement au composant qui a émit le message.
   *
   * @param {string} type 
   * @param {function} callback 
   */
  addMessageListener(type, callback) {
    document.addEventListener(type, (e) => {
      if (e.detail.destinataires) {
        let itsMe = false
        const destinataires = e.detail.destinataires

        if (Array.isArray(destinataires)) {
          destinataires.forEach(dest => {
            if (this.#isItMe(dest)) itsMe = true
          })
        } else {
          if (this.#isItMe(destinataires)) itsMe = true
        }
        if (!itsMe) return
      }
      const message = e.detail.message
      const sender = e.detail.sender
      callback.bind(this)(message, sender)
    })
  }



  /**
   * Envoie un message à d'autres composants.
   * Si destinataires n'est pas spécifié, le message est une bouteille à la mer, tous les composants qui écoutent le message le recevront.
   * Si destinataires est spécifié, le message sera envoyé uniquement à ces composants.
   *
   * @param {json} infos
   * @param {string} infos.type - Type de message.
   * @param {*} infos.message - Message à envoyer.
   * @param {string} [infos.destinataires] - Composants destinataires du message. Peut être un tableau ou une chaîne de caractères.
   * @returns {Promise} - Résout la promesse avec la réponse du destinataire.
   * @memberof abstractController
   * @example
   * this.sendMessage({
   *  type: 'myEvent',
   *  message: 'Hello World',
   *  destinataires: ['#myComponent']
   * })
   */
  sendMessage(infos) {
    return new Promise((resolve, reject) => {
      if (!infos.type) throw new Error('Le message doit avoir un type')
      document.dispatchEvent(new CustomEvent(infos.type, {
        detail:
        {
          message: infos.message,
          destinataires: infos.destinataires,
          sender: {
            reponse: (...args) => {
              resolve(...args)
            },
            error: (...args) => {
              reject(...args)
            }
          }
        }
      }))
    })

  }


  /**
   * Vérifie si le sélecteur correspond à l'élément actuel. (pour les destinaters des messages)
   * @private
   * @param {string} selector - Sélecteur CSS ou _callId à vérifier.
   * @memberof abstractController
   * @returns {boolean} 
   */
  #isItMe(selector) {
    if (selector.startsWith('#')) {
      if (this.id == selector.slice(1)) return true
    }

    if (selector.startsWith('.')) {
      if (this.classList.contains(selector.slice(1))) return true
    }

    if (this.tagName.toLowerCase() == selector) return true

    if (this._callId == selector) return true

    return false
  }



  /** 
   * Crée un proxy pour la vue qui permet d'accéder aux éléments du DOM
   * this.view peut être utilisé sans querySelector
   * @example
   * this.view.myElement.addEventListener('click', () => { })
   * @private
   * @memberof abstractController
   * 
   */
  #createShadowDOM() {
    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateContent = document.querySelector(`#${this._name}_View`);
    if (templateContent) {
      shadowRoot.appendChild(templateContent.content.cloneNode(true));
    } else {
      console.error(`Template for ${this._name} not found.`);
    }

      const handler = {
        get: (target, prop) => {
            // Gérer les symboles natifs pour préserver le comportement DOM
            if (typeof prop === 'symbol') {
                return target[prop];
            }

             if (prop == "update") {
                return this.#updateView.bind(this)
            }

            if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
            }

            if (prop in target) {
                return target[prop];
            }

            let queriedElement = target.querySelectorAll(prop);
            if (queriedElement) {
                if (queriedElement.length === 0) {
                    console.error(`Element ${prop} not found in ${this._name} view.`);
                    return null;
                }
                return queriedElement.length === 1 
                    ? this.#createViewElementProxy(queriedElement[0])
                    : queriedElement;
            }

            return target[prop];
        },

        set: (target, prop, value) => {
            if (prop.startsWith('on')) {
                const eventName = prop.slice(2).toLowerCase();
                target.addEventListener(eventName, value.bind(this));
                return true;
            }

            target[prop] = value;
            return true;
        },

        // Préserver l'identité de l'élément DOM
        getPrototypeOf: (target) => {
            return Object.getPrototypeOf(target);
        }
    };

    //return new Proxy(element, handler);

    this.view = new Proxy(shadowRoot, handler);


  }

  /**
   * 
   * @param {JSON} data 
   * les propriétés de data doivent correspondre aux id de la vue ou au className (mais array)
   * @example
   * this.view.update({
   *  myElement: 'Hello World',
   *  myOtherElement: 'Hello World'
   * })
   * avec dans la vue
   *  <div id="myElement"></div>
   *  <div id="myOtherElement"></div>
   */
  #updateView(data, view = null,) {

    view = view == null ? this.view : view;
    if (typeof (data) != "object") {
      this.#setViewElementValue(view, data);
      return
    }

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (view[index]) {
          this.#updateView(item, view[index]);
        }
      });
      return
    }

    for (const k in data) {
      const item = data[k];
      if (view[k]) {
        this.#updateView(item, view[k]);
      }
    }
  }

  #setViewElementValue(view, item) {
    if (!view) return
    if (view.tagName == "input" || view.tagName == "textarea") {
      view.value = item
    } else if (this.viewtagName == "img") {
      view.src = item
    } else {
      view.innerHTML = item
    }
  }



  #createModelLink() {
    window.electronAPI.attachModel(this._name, this._callId).then(() => {

      this.#modelLinked = true;
    }).catch((error) => {
      console.error(`Erreur lors de l'attachement du modèle ${this._name}:`, error);
    });
    this.model = new Proxy({}, {
      get: (target, functionName) => {
        return (...args) => {
          return new Promise((resolve, reject) => {
            window.electronAPI.callingModel(this._callId, functionName, ...args)
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              })
          });
        }
      }
    })
  }


  /**
   * crée un proxy qui permet d'ajouter des eventLsitenr si prop commence par on (et n'existe pas déjàa dans les propriété de l'élément)
   * @example
   * this.view.myElement.onClick = () => { }
   * @private
   * @memberof abstractController
   * @param {} element 
   */
  #createViewElementProxy(element) {
    // Créer un proxy qui hérite directement de l'élément
    const handler = {
        get: (target, prop) => {
            // Gérer les symboles natifs pour préserver le comportement DOM
            if (typeof prop === 'symbol') {
                return target[prop];
            }

            if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
            }

            if (prop in target) {
                return target[prop];
            }

            let queriedElement = target.querySelectorAll(prop);
            if (queriedElement) {
                if (queriedElement.length === 0) {
                    console.error(`Element ${prop} not found in ${this._name} view.`);
                    return null;
                }
                return queriedElement.length === 1 
                    ? this.#createViewElementProxy(queriedElement[0])
                    : queriedElement;
            }

            return target[prop];
        },

        set: (target, prop, value) => {
            if (prop.startsWith('on')) {
                const eventName = prop.slice(2).toLowerCase();
                target.addEventListener(eventName, value.bind(this));
                return true;
            }

            target[prop] = value;
            return true;
        },

        // Préserver l'identité de l'élément DOM
        getPrototypeOf: (target) => {
            return Object.getPrototypeOf(target);
        }
    };

    return new Proxy(element, handler);
  }

  /**
   * Vérifie si le Controlleur est prêt.
   * @private
   * @returns {Promise} - Résout la promesse lorsque le contrôleur est prêt.
   * @memberof abstractController
   */
  isReady() {
    return new Promise((resolve, reject) => {
      const checkReady = () => {
        if (this.view && this.#modelLinked) {
          resolve();
        } else {
          setTimeout(checkReady, 100); // Vérifie toutes les 100ms
        }
      };
      checkReady();
    });
  }
}