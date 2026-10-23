import { entries, text } from '../templates/values.mjs';

const encode = value => encodeURIComponent(text(value)).replace(/[!'()*~]/g, c=>'%'+c.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g,'+');
export function formEncode(data) {
  const pairs = [];
  const visit = (key, value) => {
    if (value == null) return;
    if (typeof value === 'object' && !Buffer.isBuffer(value)) { for (const [child, item] of entries(value)) visit(`${key}[${child}]`,item); }
    else pairs.push(`${encode(key)}=${encode(typeof value === 'boolean' ? Number(value) : value)}`);
  };
  for (const [key,value] of entries(data ?? [])) visit(key,value);
  return pairs.join('&');
}
export const cookieEncode = cookies => entries(cookies ?? []).map(([key,value])=>`${key}=${encode(value)}`).join('; ');

/** Real asynchronous HTTP transport for the original peer protocols. curl does
 * not follow redirects by default. Its failure/timeout result becomes empty
 * text after trim(); secret URL/form data is never included in diagnostics. */
export function createOutboundFunctions(globals, { fetch: fetcher = fetch } = {}) {
  return { http_build_query: formEncode, http_build_cookiedata: cookieEncode,
    async curl_post(url, data = [], cookies = [], timeout = 10) {
      if (text(url) === '') return false;
      const target = new URL(text(url));
      if (!['http:','https:'].includes(target.protocol)) throw new TypeError('Peer transport requires HTTP');
      const milliseconds = Number(timeout) >= 1 ? Math.trunc(Number(timeout))*1000 : Math.trunc(Number(timeout)*1000);
      try {
        const response = await fetcher(target,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Cookie:cookieEncode(cookies)},body:formEncode(data),redirect:'manual',signal:milliseconds>0?AbortSignal.timeout(milliseconds):undefined});
        globals.response_cookies = Object.create(null);
        for (const cookie of response.headers.getSetCookie()) { const pair=cookie.split(';',1)[0],at=pair.indexOf('=');if(at>=0)globals.response_cookies[pair.slice(0,at)]=pair.slice(at+1); }
        return (await response.text()).replace(/^[\s\0]+|[\s\0]+$/g,'');
      } catch (error) { if (error instanceof TypeError || ['AbortError','TimeoutError'].includes(error.name)) return '';throw error; }
    },
  };
}
