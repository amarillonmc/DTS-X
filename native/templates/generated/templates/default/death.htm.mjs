// Generated from templates/default/death.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<br>\r\n<div class=\"subtitle\">");
  await r.write(r.text(r.get(r.get(s, "stateinfo"), r.get(s, "state"))));
  await r.write("</div><div>");
  await r.write(r.text((await r.module("player", "get_dinfo", r.get(s, "sdata")))));
  await r.write("</div>\r\n<br>\r\n<div>死亡时间：");
  await r.write(r.text(r.get(s, "dtime")));
  await r.write("</div>");
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "kname")))))) && r.truth((await r.call("in_array", r.get(s, "state"), r.array([[r.APPEND, 20], [r.APPEND, 21], [r.APPEND, 22], [r.APPEND, 23], [r.APPEND, 24], [r.APPEND, 26], [r.APPEND, 28], [r.APPEND, 29]]))))))) {
    await r.write("<div>凶手：");
    await r.write(r.text(r.get(s, "kname")));
    await r.write("</div>");
  }
  await r.write("<br>\r\n<span class=\"dmg\">你死了。</span>\r\n<br><br>\r\n\r\n<input type=\"button\" class=\"cmdbutton\" value=\"我靠！\" disabled>");
  if (r.truth((await r.call("defined", "MOD_SKILL475")))) {
    (await r.include(r.template("MOD_SKILL475_RESPAWNTIMER"), s));
  }
return 1;
}
