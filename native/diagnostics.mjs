/** Report the failing native source locations without logging SQL, request
 * payloads, database options, cookies or arbitrary Error.message content. */
export function nativeDiagnostic(error,operation='operation') {
  const safe=value=>typeof value==='string'&&/^[A-Za-z0-9_-]+$/.test(value)?value:'Error';
  const frames=String(error?.stack??'').split('\n').filter(line=>/^\s+at /.test(line)&&/(?:[\\/]native[\\/]|node:)/.test(line)).slice(0,12);
  return [`Native ${safe(operation)} failed (${safe(error?.code??error?.name)}).`,...frames].join('\n');
}
export function reportNativeError(error,operation='request') {console.error(nativeDiagnostic(error,operation));}
