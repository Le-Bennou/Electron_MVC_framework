export class MessageSystem {
  static #instance = null;
  #pendingMessages = [];
  #listeners = new Map(); // Map<type, Set<{element, handler}>>
  
  constructor() {
    if (MessageSystem.#instance) {
      return MessageSystem.#instance;
    }
    MessageSystem.#instance = this;
  }

  static getInstance() {
    if (!MessageSystem.#instance) {
      MessageSystem.#instance = new MessageSystem();
    }
    return MessageSystem.#instance;
  }

  // Méthode pour envoyer un message
  sendMessage({type, message, destinataire = null}, sender) {
    return new Promise((resolve, reject) => {
      const messageData = {
        id: crypto.randomUUID(),
        type,
        message,
        destinataire,
        sender,
        timestamp: Date.now(),
        resolve,
        reject,
        processed: false
      };

      // Ajouter le message à la liste des messages en attente
      this.#pendingMessages.push(messageData);
      
      // Essayer de traiter immédiatement
      this.#processMessage(messageData);
      
      // Si le message n'a pas été traité après un délai, on peut le garder en attente
      setTimeout(() => {
        if (!messageData.processed) {
          console.log(`Message ${messageData.id} en attente pour le type "${type}"`);
        }
      }, 100);
    });
  }

  // Méthode pour écouter les messages
  ecouteMessage(element, type, handler) {
    // Enregistrer le listener
    if (!this.#listeners.has(type)) {
      this.#listeners.set(type, new Set());
    }
    
    const listenerData = { element, handler };
    this.#listeners.get(type).add(listenerData);

    // Traiter les messages en attente pour ce type
    this.#processPendingMessages(type);

    // Retourner une fonction pour supprimer le listener
    return () => {
      this.#listeners.get(type)?.delete(listenerData);
      if (this.#listeners.get(type)?.size === 0) {
        this.#listeners.delete(type);
      }
    };
  }

  // Traiter un message spécifique
  async #processMessage(messageData) {
    const listeners = this.#listeners.get(messageData.type);
    if (!listeners || listeners.size === 0) {
      return false; // Aucun listener disponible
    }

    const responses = [];
    const promises = [];

    for (const {element, handler} of listeners) {
      // Vérifier si c'est le bon destinataire
      if (messageData.destinataire && !this.#isValidDestination(element, messageData.destinataire)) {
        continue;
      }

      try {
       /* const response = handler.call(element, {
          type: messageData.type,
          message: messageData.message,
          timestamp: messageData.timestamp,
          id: messageData.id
        });*/
        const response = handler.call(element, messageData.message);
        // Si la réponse est une Promise, on l'ajoute à notre tableau de promises
        if (response instanceof Promise) {
          promises.push(response);
        } else {
          responses.push(response);
        }
      } catch (error) {
        messageData.reject?.(error);
        return true;
      }
    }

    try {
      // Attendre toutes les promesses si il y en a
      if (promises.length > 0) {
        const promiseResults = await Promise.all(promises);
        responses.push(...promiseResults);
      }

      messageData.processed = true;
      
      // Résoudre la promesse avec les réponses
      if (responses.length === 1) {
        messageData.resolve?.(responses[0]);
      } else if (responses.length > 1) {
        messageData.resolve?.(responses);
      } else {
        messageData.resolve?.();
      }

      // Retirer le message de la liste des messages en attente
      this.#removePendingMessage(messageData.id);
      return true;
    } catch (error) {
      messageData.reject?.(error);
      return true;
    }
  }

  // Traiter tous les messages en attente pour un type donné
  #processPendingMessages(type) {
    const messagesToProcess = this.#pendingMessages.filter(
      msg => msg.type === type && !msg.processed
    );

    messagesToProcess.forEach(messageData => {
      this.#processMessage(messageData);
    });
  }

  // Vérifier si l'élément correspond aux critères de destination
  #isValidDestination(element, destinataire) {

    if (Array.isArray(destinataire)) {
      return destinataire.some(dest => this.#isItMe(element, dest));
    } else {
      return this.#isItMe(element, destinataire);
    }
  }

  // Méthode pour vérifier si l'élément correspond au sélecteur
  #isItMe(element, selector) {
    try {
      if (selector === 'parent') {
        const sender = this.#pendingMessages.find(msg => !msg.processed)?.sender;
        if (!sender) return false;
        if(sender==this) return false
        // Vérifier dans le DOM standard
        if (element.contains(sender)) {
          return true;
        }
        
        // Vérifier dans le shadowDOM
        let currentElement = sender;
        while (currentElement) {
          if (currentElement === element) {
            return true;
          }
          const root = currentElement.getRootNode();
          if (root instanceof ShadowRoot) {
            currentElement = root.host;
          } else {
            break;
          }
        }
        return false;
      }
      return element.matches(selector);
    } catch (error) {
      console.warn(`Sélecteur invalide: ${selector}`, error);
      return false;
    }
  }

  // Retirer un message de la liste des messages en attente
  #removePendingMessage(messageId) {
    const index = this.#pendingMessages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      this.#pendingMessages.splice(index, 1);
    }
  }

  // Méthodes utilitaires pour le debugging
  getPendingMessages() {
    return this.#pendingMessages.map(msg => ({
      id: msg.id,
      type: msg.type,
      timestamp: msg.timestamp,
      destinataire: msg.destinataire,
      processed: msg.processed
    }));
  }

  getListeners() {
    const result = {};
    for (const [type, listeners] of this.#listeners) {
      result[type] = listeners.size;
    }
    return result;
  }

  // Nettoyer les messages anciens (optionnel)
  cleanOldMessages(maxAge = 30000) { // 30 secondes par défaut
    const now = Date.now();
    this.#pendingMessages = this.#pendingMessages.filter(msg => {
      if (now - msg.timestamp > maxAge) {
        msg.reject?.(new Error('Message timeout'));
        return false;
      }
      return true;
    });
  }
}




