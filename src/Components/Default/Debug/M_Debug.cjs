const{ AbstractModel } =require( '../../../core/system/base/abstractModel.cjs')

exports.Debug_Model= class Debug_Model extends AbstractModel{
    #originalConsole = console

    #getCallerInfo() {
        const error = new Error();
        const stack = error.stack.split('\n');
        // On cherche la première ligne qui n'est pas dans ce fichier
        const callerLine = stack.find(line => !line.includes('M_Debug.cjs') && !line.includes('M_Debug.cjs') &&line.includes('at'));
        if (callerLine) {
            // Format typique: "at functionName (file:line:column)"
            const match = callerLine.match(/at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?/);
            if (match) {
                return {
                    function: match[1] || 'anonymous',
                    file: match[2],
                    line: match[3],
                    column: match[4]
                };
            }
        }
        return null;
    }

    #getFunctionNames(obj) {
        const functions = {};
        // Récupérer les fonctions propres à l'objet
        Object.getOwnPropertyNames(obj).forEach(prop => {
            if (typeof obj[prop] === 'function') {
                functions[prop] = 'function';
            }
        });
        // Récupérer les fonctions du prototype
        const proto = Object.getPrototypeOf(obj);
        if (proto) {
            Object.getOwnPropertyNames(proto).forEach(prop => {
                if (typeof proto[prop] === 'function') {
                    functions[`${proto.constructor.name}.${prop}`] = 'function';
                }
            });
        }
        return functions;
    }

    rerouteConsole(){
        console = {
             warn: (...args) => {
                const callerInfo = this.#getCallerInfo();
                const enrichedArgs = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                        return {
                            ...arg,
                            __functions: this.#getFunctionNames(arg)
                        };
                    }
                    return arg;
                });
                
                this.sendMessageToController('console-warn', JSON.stringify({
                    args: enrichedArgs,
                    caller: callerInfo
                }))
                this.#originalConsole.warn.apply(this.#originalConsole, args);
            },
            log:(...args)=>{
                const callerInfo = this.#getCallerInfo();
                 const enrichedArgs = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                        return {
                            ...arg,
                            __functions: this.#getFunctionNames(arg)
                        };
                    }
                    return arg;
                });
                this.sendMessageToController('console-log',JSON.stringify( {
                    args: enrichedArgs,
                    caller: callerInfo
                }))

                this.#originalConsole.log.apply(this.#originalConsole, args);
            },
            error:(...args)=>{
                const callerInfo = this.#getCallerInfo();
                 const enrichedArgs = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                        return {
                            ...arg,
                            __functions: this.#getFunctionNames(args)
                        };
                    }
                    return arg;
                });
                this.sendMessageToController('console-error',JSON.stringify({
                    args: enrichedArgs,
                    caller: callerInfo
                }))
                this.#originalConsole.error.apply(this.#originalConsole, args);
            }
        }
    }

    test(){
        console.log("TEST ",[1,2,3],this)
        console.warn("TEST ",[1,2,3],this)
        console.error("TEST ",[1,2,3],this)
        
    }
}