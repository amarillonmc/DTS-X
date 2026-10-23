// Generated from include/modules/extra/card/skills/skill576/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill576", "sys", "item_recipe");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 576);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["mpid"]), r.int((await r.module("skillbase", "skill_getvalue", 576, "mpid"))));
  r.assign(r.slot(s, ["mname"]), r.get((await r.module("player", "fetch_playerdata_by_pid", r.get(s, "mpid"))), "name"));
  await r.write("你无法遇到<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "mname")));
  await r.write("</span>且被对方攻击时所有非称号特性技能无效，<br>直到完成以下配方合成：<br>");
  r.assign(r.slot(s, ["recipeid"]), (await r.module("skillbase", "skill_getvalue", 576, "recipeid")));
  await r.write("<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(r.get(r.get(s, "recipe_mixinfo"), r.get(s, "recipeid")), "result"), "0")));
  await r.write("</span><br>\r\n完成此配方时，会自动将合成产物交给<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "mname")));
  await r.write("</span>。<br>\r\n<span class=\"yellow b\">当你被战斗/陷阱击杀时失去此技能</span><br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
