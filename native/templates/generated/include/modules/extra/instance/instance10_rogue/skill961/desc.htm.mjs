// Generated from include/modules/extra/instance/instance10_rogue/skill961/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 961);
  r.imports(s, "map");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["dest"]), r.int((await r.module("skillbase", "skill_getvalue", 961, "dest"))));
  await r.write("<span class=\"yellow b\">特殊任务</span>  将<span class=\"yellow b\">『Hyper』</span>护送到<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "dest"))));
  await r.write("</span><br>\r\n护送时你会更容易被敌人发现并攻击；<span class=\"yellow b\">『Hyper』</span>可能会帮助你战斗<br>\r\n<span class=\"yellow b\">『Hyper』</span>被击破时任务失败\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
