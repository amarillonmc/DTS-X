// Generated from include/modules/extra/card/skills/skill768/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill768", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 768);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 768, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("随机获得一个鱼类（？）物品<br>");
  if (r.truth(r.equal(2, r.get(s, "st")))) {
    await r.write("<span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  }
  r.assign(r.slot(s, ["fishids768"]), (await r.module("skill768", "get_fishids768", r.get(s, "who"))));
  await r.write("已钓到过：<br>");
  if (r.truth((!r.truth(r.get(s, "fishids768"))))) {
    await r.write("<span class=\"yellow b\">无</span>");
  } else {
    await r.write("<span class=\"yellow b\">");
    if (r.truth((await r.call("is_array", r.get(s, "fishids768"))))) {
      {
        const a0 = r.copy(r.get(s, "fishids768"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write(r.text(r.get(r.get(r.get(s, "skill768_items"), r.get(s, "i")), "0")));
          await r.write(" ");
        }
      }
    }
    await r.write("</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
