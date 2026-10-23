// Static native page from donate.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "donate"));
  (await r.call("define", "LOAD_CORE_ONLY", true));
  (await r.nativeInclude("request-bootstrap", s));
  (await r.include(r.template("donate"), s, false));
  return null;
}
