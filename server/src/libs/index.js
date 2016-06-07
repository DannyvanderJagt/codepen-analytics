import Fs from 'fs';
import Config from '../config';

let Lib = {
  cache: {},

  load(){
    for(let lib in Config.libs){
      this.cache[lib] = Fs.readFileSync(Config.libs[lib])
    }
  },

  getJavascriptForPen(uniqueid){
    return `
      !(function(){ 
        var uniqueid = '${uniqueid}';
        ${this.cache.pen}
      }());
    `;
  }

}

Lib.load();

export default Lib;