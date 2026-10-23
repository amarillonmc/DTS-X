// Static native page from map.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "map"));
  (await r.nativeInclude("request-bootstrap", s));
  (await r.include(r.template("map"), s, false));
  return null;
}
