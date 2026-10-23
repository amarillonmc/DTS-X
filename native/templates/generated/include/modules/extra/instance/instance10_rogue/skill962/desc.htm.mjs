// Generated from include/modules/extra/instance/instance10_rogue/skill962/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill962", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 962);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("skill962", "check_skill962_state", r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  r.assign(r.slot(s, ["skill962_cost"]), (await r.module("skill962", "get_skill962_cost", r.get(s, "who"))));
  await r.write("更换一个选择的任务，冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill962_cd")));
  await r.write("</span>秒，也可以花钱强行更换。<br>");
  if (r.truth((r.compare(r.get(s, "st"), 0) > 0))) {
    if (r.truth((!r.equal(3, r.get(s, "st"))))) {
      await r.write("<span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("</span>秒。</span><br>");
      if (r.truth(r.equal(1, r.get(s, "st")))) {
        await r.write("<span class=\"yellow b\">你当前金钱不足以更换任务，需要<span>");
        await r.write(r.text(r.get(s, "skill962_cost")));
        await r.write("</span>元</span>");
      } else {
        await r.write("可花费<span class=\"yellow b\">");
        await r.write(r.text(r.get(s, "skill962_cost")));
        await r.write("</span>元更换任务");
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
