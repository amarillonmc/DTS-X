import { text } from '../gameplay/numbers.mjs';

const defaults=()=>({'id':'','height':100,'width':100,'z-index-base':10,'offset-x':0,'offset-y':0,'opacity':0.95,'cancellable':0,'change-to':'','scroll-bar':0,'border-width-x':5,'border-width-y':5,'margin-top':8,'margin-bottom':8,'margin-left':8,'margin-right':4});
export const trimBubbleSpaces=value=>text(value).replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g,'');
export function parseBubbleStyle(value){
 const style=defaults();let key='',data='',flag=false;
 for(const char of text(value)+';'){
  if(char===';'){if(flag){key=trimBubbleSpaces(key);data=trimBubbleSpaces(data);if(key&&Object.hasOwn(style,key))style[key]=data;flag=false;key='';data='';}}
  else if(char===':'){if(!flag)flag=true;}
  else if(flag)data+=char;else key+=char;
 }
 return style;
}
const numeric=value=>{const result=Number.parseFloat(text(value));if(Number.isNaN(result))return 0;if(!Number.isFinite(result))throw new RangeError('Bubble style number must be finite');return result;};
export function bubbleScope(style){
 const scope=Object.fromEntries(Object.entries(style).map(([key,value])=>['bbox_'+key.replaceAll('-','_'),value]));
 const height=numeric(style.height),width=numeric(style.width),x=numeric(style['offset-x']),y=numeric(style['offset-y']),bx=numeric(style['border-width-x']),by=numeric(style['border-width-y']);
 const vertical=numeric(style['margin-top'])+numeric(style['margin-bottom']),horizontal=numeric(style['margin-left'])+numeric(style['margin-right']);
 Object.assign(scope,{bbox_positioner_inner_margin_top:y-Math.ceil((height+by*2+vertical)/2),bbox_positioner_inner_margin_left:x-Math.ceil((width+bx*2+horizontal)/2),
 bbox_positioner_inner_min_width:width+bx*2+horizontal,bbox_positioner_inner_max_width:width+bx*2+horizontal,bbox_positioner_inner_min_height:height+by*2+vertical,bbox_positioner_inner_max_height:height+by*2+vertical,
 bbox_screen_fader_inner_margin_top:y-Math.ceil((height+vertical)/2),bbox_screen_fader_inner_margin_left:x-Math.ceil((width+horizontal)/2),
 bbox_screen_fader_inner_min_width:width+horizontal,bbox_screen_fader_inner_max_width:width+horizontal,bbox_screen_fader_inner_min_height:height+vertical,bbox_screen_fader_inner_max_height:height+vertical,
 bubblebox_container_min_height:height+vertical,bubblebox_container_max_height:height+vertical});return scope;
}
/** Native global helpers from include/bubblebox.func.php. A request owns one
 * style record. Rendering writes into the same real output buffer as templates,
 * preserving nested capture ordering; no template or HTML is substituted. */
export function createBubbleboxFunctions({templates,output}){
 let style;
 const renderer=()=>typeof templates==='function'?templates():templates;
 const functions={bubblebox_delete_trailing_spaces:trimBubbleSpaces,
  bubblebox_set_default(){style=defaults();return structuredClone(style);},
  bubblebox_set_style(value){style=parseBubbleStyle(value);},
  bubblebox_get_style(value){let key=text(value).replace(/^[\x00\t\n\v\r ]+|[\x00\t\n\v\r ]+$/g,'');if(key.endsWith(';'))key=key.slice(0,-1);return style?.[key]??null;},
  async bubblebox_start(value){style=parseBubbleStyle(value);await output.write(await renderer().render('bubblebox_start',bubbleScope(style)));},
  async bubblebox_end(){await output.write(await renderer().render('bubblebox_end',{}));},
 };
 return Object.freeze(functions);
}
