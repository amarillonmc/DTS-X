// Generated from include/modules/extra/club/skills/skill96/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "bufficons", "clubbase");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 96);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill96_type"]), (await r.module("skillbase", "skill_getvalue", 96, "type")));
  r.assign(r.slot(s, ["skill96_effect"]), r.int((await r.module("skillbase", "skill_getvalue", 96, "effect"))));
  if (r.truth(r.equal(r.get(r.get(s, "skill96_type"), "0"), 1))) {
    r.assign(r.slot(s, ["v1"]), r.add(20, (await r.call("round", r.multiply(0.1, r.get(s, "skill96_effect"))))));
    await r.write("造成最终伤害<span class=\"yellow b\">+");
    await r.write(r.text(r.get(s, "v1")));
    await r.write("%</span>，");
  } else {
    if (r.truth(r.equal(r.get(r.get(s, "skill96_type"), "0"), 2))) {
      r.assign(r.slot(s, ["v2"]), (await r.call("round", r.multiply(0.06, r.get(s, "skill96_effect")))));
      await r.write("先制率<span class=\"yellow b\">+");
      await r.write(r.text(r.get(s, "v2")));
      await r.write("%</span>，");
    } else {
      r.assign(r.slot(s, ["v3"]), r.subtract(r.multiply(7, r.get(s, "skill96_effect")), 500));
      await r.write("视为具有<span class=\"yellow b\">+");
      await r.write(r.text(r.get(s, "v3")));
      await r.write("</span>生命上限的<span class=\"yellow b\">升血</span>属性，");
    }
  }
  await r.write("<br>");
  if (r.truth(r.equal(r.get(r.get(s, "skill96_type"), "1"), 1))) {
    await r.write("视为具有<span class=\"yellow b\">激奏3</span>属性");
  } else {
    if (r.truth(r.equal(r.get(r.get(s, "skill96_type"), "1"), 2))) {
      await r.write("视为具有<span class=\"yellow b\">音爆</span>属性");
    } else {
      r.assign(r.slot(s, ["v6"]), r.add(30, (await r.call("round", r.multiply(0.1, r.get(s, "skill96_effect"))))));
      await r.write("受到最终伤害<span class=\"yellow b\">-");
      await r.write(r.text(r.get(s, "v6")));
      await r.write("%</span>");
    }
  }
  await r.write("<br>");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 96, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  if (r.truth(r.equal(1, r.get(s, "st")))) {
    await r.write("<span class=\"yellow b\">状态有效时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  } else {
    await r.write("<span class=\"yellow b\">状态生效时间已经结束。</span><br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
