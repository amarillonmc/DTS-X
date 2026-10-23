import { AccountError } from '../accounts/service.mjs';
import { AdminInputError } from '../accounts/admin.mjs';
import { adminCommands } from '../accounts/primitives.mjs';
import { serializeGameCookie } from './request.mjs';
import { gencode } from '../protocol/codec.mjs';
import { present,text } from '../gameplay/numbers.mjs';
import adminConfig from '../accounts/admin-config.json' with {type:'json'};

const routes=new Set(['/login.php','/logout.php','/register.php','/user.php','/user_profile.php','/messages.php','/admin.php','/userdb_receive.php']);
const requireMethod=(owner,key)=>{if(typeof owner?.[key]!=='function')throw new Error(`Native account HTTP requires ${key} service`);return owner[key].bind(owner);};
export function accountResponseCookies(cookies,now=Math.floor(Date.now()/1000)){
 return cookies.map(cookie=>{
  let result=serializeGameCookie(cookie.name,cookie.delete?'':cookie.value,{prefix:false,tablePrefix:'',now,path:cookie.path,domain:cookie.domain,secure:cookie.secure,life:cookie.expires==null?0:cookie.expires-now});
  if(cookie.httpOnly&&!result.endsWith('; HttpOnly'))result+='; HttpOnly';return result;
 });
}

/** Actual native account HTTP controllers. host services are request-scoped,
 * except remoteUsers, which owns cross-request remote lock leases. request is
 * parseRequest() output, with already filtered input.values and raw post/files.
 * Host finally must release users/database/OS locks, including error branches.
 * Full private context is only passed to original templates; JSON endpoints
 * send the original gencode payload rather than serializing account rows.
 */
export async function dispatchAccountPage(host,request,scope){
 if(!routes.has(request.pathname))return null;
 const input=request.input?.values??{},options={scope,server:request.server??{}},render=(name,context={})=>requireMethod(host.templates,'render')(name,Object.assign(Object.create(null),scope,context));
 if(request.pathname==='/userdb_receive.php')return {body:await requireMethod(host.remoteUsers,'handle')(request.post,request.server),headers:{'Content-Type':'text/plain; charset=utf-8'}};
 let result;
 try{
  if(request.pathname==='/login.php')result=await requireMethod(host.accounts,'login')(input,options);
  else if(request.pathname==='/logout.php')result=await requireMethod(host.accounts,'logout')(request.server);
  else if(request.pathname==='/register.php')result=await requireMethod(host.accounts,'register')(input,options);
  else if(request.pathname==='/user.php')result=await requireMethod(host.accounts,'userPage')(input,options);
  else if(request.pathname==='/user_profile.php')result=await requireMethod(host.accounts,'profile')(request.input?.request??input,options);
  else if(request.pathname==='/messages.php')result=await requireMethod(host.messages,'page')(input,scope);
  else{
   const {user,group}=await requireMethod(host.accounts,'authorizeAdmin')(scope);let command=null,showdata=false,info=false;
   if(input.mode==='admin_menu'&&Object.hasOwn(adminCommands,input.command))command=input.command;
   else if(Object.hasOwn(adminCommands,input.mode))command=input.mode;
   else if(present(input.mode))info=scope._ERROR?.wrong_adcmd??'错误的管理员命令';
   if(command){
    try{await host.accounts.authorizeAdmin(scope,command);}catch(error){if(error instanceof AccountError&&error.code==='no_power')info=error.message;else throw error;}
    if(!info){
     let sub;
     if(command==='gmlist')sub=await requireMethod(host.admin,'gmList')(input,scope);
     else if(command==='urlist'){
      try{
      if(input.pagecmd==='upload'){
       const file=request.files?.uploadfile;
       if(!file?.name)sub={context:{cmd_info:'不能上传空文件'}};
       else if(file.error>0)sub={context:{cmd_info:'上传错误，编号：'+file.error}};
       else{sub=await requireMethod(host.admin,'upload')(scope,file.bytes);sub={context:{cmd_info:sub.cmd_info}};}
       const page=await host.admin.userList({...input,pagecmd:'',urcmd:''},scope);sub={...page,context:{...page.context,...sub.context}};
      }else if(input.pagecmd==='recover'){
       const restored=await requireMethod(host.admin,'restore')(scope,input.recover_file),page=await host.admin.userList({...input,pagecmd:'',urcmd:''},scope);sub={...page,context:{...page.context,cmd_info:restored.cmd_info}};
      }else sub=await requireMethod(host.admin,'userList')(input,scope);
      }catch(error){if(!(error instanceof AdminInputError))throw error;const page=await host.admin.userList({...input,pagecmd:'',urcmd:''},scope);sub={...page,context:{...page.context,cmd_info:error.message}};}
     }else sub=await requireMethod(host.gameAdmin,'handle')(command,input,scope,request);
     if(sub?.bytes){if(!/^[a-zA-Z0-9_.-]+$/.test(sub.filename))throw new TypeError('Invalid backup download filename');return {body:sub.bytes,headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename=${sub.filename}`,'Accept-Ranges':'bytes','Accept-Length':String(sub.bytes.length)}};}
     info=sub?.context?.cmd_info??sub?.cmd_info??false;
     if(sub?.body!=null)showdata=sub.body;
     else if(sub?.template)showdata=await render(sub.template,{...scope,...adminConfig,...host.adminContext,...sub.context,mygroup:group});
    }
   }
   result={template:'admin',context:{...adminConfig,...host.adminContext,udata:user,mygroup:group,showdata,cmd_info:info}};
  }
 }catch(error){
  if(!(error instanceof AccountError))throw error;
  // Original account entrypoints do not set GEXIT_RETURN_JSON. Their gexit
  // errors render the error page even when a form was submitted with AJAX.
  return {status:200,body:await render('error',{message:error.message,file:'',line:0}),headers:{}};
 }
 const headers={};if(result.cookies?.length)headers['Set-Cookie']=accountResponseCookies(result.cookies,Math.floor(scope.now??Date.now()/1000));
 if(result.redirect)return {status:302,headers:{...headers,Location:result.redirect},body:''};
 if(result.payload!=null)return {body:result.payload,headers};
 if(result.template)return {body:await render(result.template,result.context??result.data),headers};
 if(result.data!=null)return {body:gencode(result.data),headers};
 throw new Error('Native account controller returned no response');
}
