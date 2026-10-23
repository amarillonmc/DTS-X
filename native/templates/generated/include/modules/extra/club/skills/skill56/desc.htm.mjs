// Generated from include/modules/extra/club/skills/skill56/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill56");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 56);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n佣兵\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill56_cnt"]), r.subtract(r.get(s, "skill56_lim"), r.int((await r.module("skillbase", "skill_getvalue", 56, "t")))));
  await r.write("<span class=\"red b\">限定技&nbsp;本局还可发动<span>");
  await r.write(r.text(r.get(s, "skill56_cnt")));
  await r.write("</span>/<span>");
  await r.write(r.text(r.get(s, "skill56_lim")));
  await r.write("</span>次</span><br>\t\r\n花费<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill56_need")));
  await r.write("</span>元，在当前地点随机召唤一名佣兵；<br>\r\n雇佣关系存在时，你的佣兵不会与你进入战斗界面；<br>雇佣佣兵后需每分钟耗费一定数量的金钱以维持雇佣关系；<br>\r\n<input type=\"button\" onclick=\"bubblebox_show('skill56_merc')\" value=\"点我查看可能召唤出的佣兵列表\">");
  (await r.call("bubblebox_start", "id:skill56_merc;height:560;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是所有可能被召唤出的佣兵的列表：<br><br>\r\n</p>");
  (await r.module("npcinfo", "npcinfo_get_npc_description_all", 25));
  (await r.call("bubblebox_end"));
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n15级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
