// Static native page from aranking_receive.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("ignore_user_abort", 1));
  (await r.call("define", "CURSCRIPT", "aranking_receive"));
  (await r.call("define", "IN_GAME", true));
  (r.truth((await r.call("defined", "GAME_ROOT"))) || r.truth((await r.call("define", "GAME_ROOT", (r.text((await r.call("dirname", "aranking_receive.php"))) + r.text("/"))))));
  (await r.nativeInclude("request-bootstrap", s));
  (await r.nativeInclude("accounts", s));
  r.assign(r.slot(r.globals, ["_POST", "arealip"]), (await r.call("real_ip")));
  await r.write(r.text((await r.call("render_page", "command_aranking"))));
  return null;
}
