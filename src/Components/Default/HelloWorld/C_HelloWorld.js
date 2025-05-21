import { abstractController } from '../../../core/system/base/abstractController.js';

export class HelloWorld_Controller extends abstractController{
    setupEventListeners(){
       this.view["button"].onClick = () => {
            this.view['#modelResponse']['p'].innerHTML = "Loading...(2<small>sec</small>)";
            this.model.getThinkAboutIt().then((data) => {
                this.view.update(data);
            });
        }
    }


}
