// Generated from include/modules/extra/instance/instance12_dream/skill984/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill984");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 984);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 984, "lvl", r.get(s, "who")))));
  await r.write("完成每一波次");
  if (r.truth(r.equal(r.get(s, "clv"), 1))) {
    await r.write("有<span class=\"yellow b\">50%</span>概率获得<span class=\"yellow b\">1</span>个第1波次的<span class=\"yellow b\">梦境礼盒</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "clv"), 2))) {
      await r.write("获得<span class=\"yellow b\">1</span>个改造核心，<br>且随波次数增加有更高概率出现高等级的改造核心");
    } else {
      if (r.truth(r.equal(r.get(s, "clv"), 3))) {
        await r.write("获得<span class=\"yellow b\">1</span>个卡牌包，<br>且随波次数增加有更高概率出现高等级的卡牌包");
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
