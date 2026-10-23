// Generated from include/modules/extra/instance/gtype1/main/showhacklevel.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<td class=\"b2\" width=\"60\" height=\"20\"><span>除错计数</span></td>\r\n<td class=\"b3\" height=\"20\"><span class=\"orange\">");
  await r.write(r.text((await r.module("skillbase", "skill_getvalue", 424, "lvl"))));
  await r.write("</span></td> \r\n");
return 1;
}
