// Generated from include/modules/extra/instance/gtype2/skill475/showwpt.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<td class=\"b2\" height=\"20\"><span>胜利点数</span></td>\r\n<td class=\"b3\" height=\"20\"><span class=\"orange\">");
  await r.write(r.text((await r.module("skillbase", "skill_getvalue", 475, "wpt"))));
  await r.write("</span></td> \r\n");
return 1;
}
