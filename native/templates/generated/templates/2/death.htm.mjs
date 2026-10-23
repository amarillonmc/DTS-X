// Generated from templates/2/death.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_row\">\r\n<div class=\"subtitle\">");
  await r.write(r.text(r.get(r.get(s, "stateinfo"), r.get(s, "state"))));
  await r.write("</div><div>");
  await r.write(r.text((await r.module("player", "get_dinfo", r.get(s, "sdata")))));
  await r.write("</div>");
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "kname")))))) && r.truth((await r.call("in_array", r.get(s, "state"), r.array([[r.APPEND, 20], [r.APPEND, 21], [r.APPEND, 22], [r.APPEND, 23], [r.APPEND, 24], [r.APPEND, 28], [r.APPEND, 29]]))))))) {
    await r.write("<br><div>凶手：");
    await r.write(r.text(r.get(s, "kname")));
    await r.write("</div>");
  }
  await r.write("<br><div><span class=\"dmg\">你死了。</span></div>\r\n</div>");
  r.assign(r.slot(s, ["tmp_death_txt"]), r.array([[r.APPEND, "我靠！"], [r.APPEND, "我觉得我还能再抢救一下…"], [r.APPEND, (r.text((r.text("是、是") + r.text(r.get(s, "kname")))) + r.text("！呃啊啊啊…"))], [r.APPEND, "稽不如人，甘拜下风"]]));
  await r.write("<div class=\"cmd_row\">\r\n<div class=\"cmd_positioner common_cmd zx_cmd\" style=\"height:30px\">\r\n<input type=\"button\" class=\"common_cmd glow_buttons grey forbidden\" value=\"");
  await r.write(r.text((r.truth((await r.call("trim", r.get(s, "motto")))) ? r.get(s, "motto") : r.get(r.get(s, "tmp_death_txt"), r.modulo(r.get(s, "dtime"), (await r.call("sizeof", r.get(s, "tmp_death_txt"))))))));
  await r.write("\">\r\n</div>\r\n</div>");
  if (r.truth((await r.call("defined", "MOD_SKILL475")))) {
    (await r.include(r.template("MOD_SKILL475_RESPAWNTIMER"), s));
  }
return 1;
}
