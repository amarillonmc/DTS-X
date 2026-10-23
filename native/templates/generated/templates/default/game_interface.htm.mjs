// Generated from templates/default/game_interface.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div id=\"notice\"></div>\r\n<table id=\"game_interface\" border=\"0\" cellspacing=\"10\" cellpadding=\"0\" align=\"center\">\r\n<tr valign=top>\r\n<td>\r\n<div id=\"main\" style=\"width:720px\">");
  if (r.truth((!r.truth((!r.truth(r.get(s, "main"))))))) {
    (await r.include(r.template(r.get(s, "main")), s));
  } else {
    (await r.include(r.template("profile"), s));
  }
  await r.write("</div><div style=\"margin-top:10px\">");
  (await r.include(r.template("chat"), s));
  await r.write("</div>\r\n</td>\r\n<td valign=\"top\">\r\n<div id=\"cmd_interface\">");
  (await r.include(r.template("cmd_interface"), s));
  await r.write("</div>\r\n</td>\r\n</tr>\r\n</table> \r\n");
return 1;
}
