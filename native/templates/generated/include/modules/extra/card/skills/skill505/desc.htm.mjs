// Generated from include/modules/extra/card/skills/skill505/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 505);
  r.imports(s, "map", "clubbase", "skill505");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n只要你装备着");
  await r.write(r.text(r.get(s, "skill505_keyitm")));
  await r.write("，你免疫一切战斗和陷阱伤害。<br>\r\n但是，如果你装备、包裹及视野中都不存在");
  await r.write(r.text(r.get(s, "skill505_keyitm")));
  await r.write("，你会立即从这局游戏中消失。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">");
    r.assign(r.slot(s, ["rpls"]), (await r.module("skill505", "check_pls505")));
    await r.write("找到并装备上");
    await r.write(r.text(r.get(s, "skill505_keyitm")));
    await r.write("以解锁<br>");
    if (r.truth((r.compare(0, r.get(s, "rpls")) > 0))) {
      await r.write("<span class=\"red b\">");
      await r.write(r.text(r.get(s, "skill505_keyitm")));
      await r.write("不在它本该在的位置了！</span>");
    } else {
      if (r.truth(r.equal(0, r.get(s, "rpls")))) {
        await r.write(r.text(r.get(s, "skill505_keyitm")));
        await r.write("在你的怀抱中");
      } else {
        await r.write(r.text(r.get(s, "skill505_keyitm")));
        await r.write("位于");
        await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "rpls"))));
      }
    }
    await r.write("</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
