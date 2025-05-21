

/**
 * Description placeholder
 *
 * @export

 * @class AbstractModel
 * @typedef {AbstractModel}
 */
exports.AbstractModel = class AbstractModel {
  _componentId = null
  #win = null
  constructor(componentId,win){
    this._componentId = componentId
    this.#win = win
  }

  /**
   * Envois directemment un message au controller
   * à utiliser avec parcimonie : 
   * le MVC est fait pour que ce soit le controlleur qui envois les messages au model 
   * et attende une reponse
   * 
   * Le controller doit écouter le message [type]
   * avec addMessageListener()
   * @memberof AbstractModel
   * @param {string} type 
   * @param {*} message 
   */
  sendMessageToController(type,message){
     this.#win.webContents.send('model-sendMessage',type,this._componentId,message);
  }
}