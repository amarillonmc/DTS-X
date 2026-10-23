// Generated from include/modules/base/weapon/dualwep/sec_att_method.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_positioner common_cmd\" style=\"height:50px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" style=\"height:50px;font-size:12pt;\" id='a' value=\"");
  await r.write(r.text(r.get(r.get(s, "attinfo"), r.get(s, "secattmethod"))));
  await r.write("\" \r\nonclick=\"$('command').value='");
  await r.write(r.text(r.get(s, "secattmethod")));
  await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
return 1;
}
