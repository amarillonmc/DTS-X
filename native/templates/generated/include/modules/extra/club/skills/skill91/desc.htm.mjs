// Generated from include/modules/extra/club/skills/skill91/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "map");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 91);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n每当你连续在同一地点歌唱消耗歌魂达到<span class=\"yellow b\">240</span>时，<br>当前地点所有其他角色获得状态“<span class=\"yellow b\">倾心</span>”（对少数NPC无效）：<br>若为NPC，生命值低于你的生命值的<span class=\"yellow b\">3</span>倍时不会先制攻击你，<br>攻击其他角色最终伤害<span class=\"yellow b\">+40%</span>，受到其他角色伤害<span class=\"yellow b\">-20%</span>；<br>若为玩家，对你先制率<span class=\"yellow b\">-30%</span><br>（再次获得“<span class=\"yellow b\">倾心</span>”时，记录的来源角色会被替换）<br>");
  r.assign(r.slot(s, ["skill91_uss"]), r.int((await r.module("skillbase", "skill_getvalue", 91, "uss"))));
  if (r.truth(r.get(s, "skill91_uss"))) {
    r.assign(r.slot(s, ["skill91_pls"]), r.int((await r.module("skillbase", "skill_getvalue", 91, "pls"))));
    await r.write("在<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "skill91_pls"))));
    await r.write("</span>已歌唱消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "skill91_uss")));
    await r.write("</span>歌魂");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n7级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
