// Static native page from kujilist.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "kujilist"));
  (await r.nativeInclude("request-bootstrap", s));
  if (r.truth((r.truth((!r.truth(r.get(s, "cuser")))) || r.truth((!r.truth(r.get(s, "cpass"))))))) {
    (await r.call("gexit", r.get(r.get(s, "_ERROR"), "no_login"), "kujilist.php", 7));
  }
  r.assign(r.slot(s, ["udata"]), (await r.call("udata_check")));
  r.extract(s, r.get(s, "udata"));
  r.assign(r.slot(s, ["cg"]), r.get(r.get(s, "udata"), "gold"));
  r.imports(s, "kujibase");
  r.assign(r.slot(s, ["kreq"]), r.get(s, "kujicost"));
  (await r.include(r.template("kujilist"), s, false));
  return null;
}
