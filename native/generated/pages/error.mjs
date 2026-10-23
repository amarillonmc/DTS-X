// Static native page from error.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "NO_MOD_LOAD", true));
  (await r.call("define", "NO_SYS_UPDATE", true));
  (await r.call("define", "TPLDIR", "./templates/default"));
  (await r.call("define", "TEMPLATEID", "1"));
  (await r.nativeInclude("request-bootstrap", s));
  r.assign(r.slot(s, ["message"]), r.get(r.get(r.globals, "_POST"), "errormsg"));
  (await r.include(r.template("error"), s, false));
  return null;
}
