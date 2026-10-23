// Static native page from instance8_testing_intro.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "updatelist"));
  (await r.nativeInclude("request-bootstrap", s));
  (await r.include(r.template("instance8_testing_intro"), s, false));
  return null;
}
