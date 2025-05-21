const{ AbstractModel } =require( '../../../core/system/base/abstractModel.cjs')

exports.HelloWorld_Model =class HelloWorld_Model extends AbstractModel{
    #askCount = 0

    getThinkAboutIt(){
 
        if(this.#askCount>0) return {
            '#modelResponse':{
                        p:"Hello World!",
                        '#listOne':{
                            '.list':["one", "two", "three"]
                        },
                        '#listTwo':{
                            '.list':[1, 2, 3]
                        }
                        
                    }
        }
        this.#askCount++
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    '#modelResponse':{
                        p:"Can you ask again?",
                    }
                });
            }, 2000);
        });
    }
}