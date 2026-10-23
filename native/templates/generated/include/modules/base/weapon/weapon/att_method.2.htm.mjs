// Generated from include/modules/base/weapon/weapon/att_method.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "weapon");
  r.assign(r.slot(s, ["attmethod"]), (await r.module("weapon", "get_attack_method", r.get(s, "sdata"))));
  await r.write("<div class=\"cmd_positioner ");
  if (r.truth(r.get(s, "secattmethod"))) {
    await r.write("common_cmd");
  } else {
    await r.write("explore_cmd");
  }
  await r.write("\" style=\"height:50px\">\r\n<input type=\"button\" class=\"cmd_button ");
  if (r.truth(r.get(s, "secattmethod"))) {
    await r.write("common_cmd");
  } else {
    await r.write("explore_cmd");
  }
  await r.write(" glow_buttons yellow b\" style=\"height:50px;font-size:12pt;\" id=\"z\" value=\"");
  await r.write(r.text(r.get(r.get(s, "attinfo"), r.get(s, "attmethod"))));
  await r.write("\" \r\nonclick=\"$('command').value='");
  await r.write(r.text(r.get(s, "attmethod")));
  await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
  if (r.truth(r.get(s, "secattmethod"))) {
    (await r.include(r.template("MOD_DUALWEP_SEC_ATT_METHOD"), s));
  }
return 1;
}
