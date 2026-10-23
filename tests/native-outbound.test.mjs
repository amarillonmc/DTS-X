import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {createOutboundFunctions,formEncode,cookieEncode} from '../native/http/outbound.mjs';

test('peer form transport preserves PHP nested forms, cookie headers, redirects, timeouts and response cookies',async t=>{
  const data={a:'空 格+~',list:[true,false,null,''],nested:{first:'a&b',second:3}},cookies={name:'空 格+~'};
  const oracle=spawnSync(process.env.DTS_REFERENCE_PHP||'php',['-r','$v=json_decode(stream_get_contents(STDIN),true);echo http_build_query($v);'],{input:JSON.stringify(data),encoding:'utf8',windowsHide:true});
  assert.equal(oracle.status,0,oracle.stderr);assert.equal(formEncode(data),oracle.stdout);assert.equal(cookieEncode(cookies),'name=%E7%A9%BA+%E6%A0%BC%2B%7E');
  const calls=[],server=createServer(async(req,res)=>{
    let body='';for await(const part of req)body+=part;calls.push({url:req.url,cookie:req.headers.cookie,body});
    if(req.url==='/slow'){setTimeout(()=>res.end('late'),100);return;}
    if(req.url==='/redirect'){res.writeHead(302,{Location:'/unexpected'}).end(' original ');return;}
    res.setHeader('Set-Cookie',['first=a%20b; HttpOnly','second=c=d; Path=/']);res.end(' \n原始回应\r\n');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`,globals={},api=createOutboundFunctions(globals);
  assert.equal(await api.curl_post(base,data,cookies),'原始回应');assert.equal(calls[0].body,oracle.stdout);assert.equal(calls[0].cookie,cookieEncode(cookies));
  assert.deepEqual({...globals.response_cookies},{first:'a%20b',second:'c=d'});
  assert.equal(await api.curl_post(base+'/redirect'),'original');assert.equal(calls.some(item=>item.url==='/unexpected'),false);
  assert.equal(await api.curl_post(base+'/slow',[],[],0.01),'');assert.equal(await api.curl_post(''),false);
});
