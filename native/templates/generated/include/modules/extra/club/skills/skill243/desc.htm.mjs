// Generated from include/modules/extra/club/skills/skill243/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 243);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n证伪\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.imports(s, "itemmain");
  r.assign(r.slot(s, ["sk243l"]), (await r.module("skillbase", "skill_getvalue", 243, "l")));
  r.assign(r.slot(s, ["sk243list"]), "");
  r.imports(s, "ex_phy_def");
  r.assign(r.slot(s, ["def_kind0"]), r.get(s, "def_kind"));
  r.imports(s, "ex_dmg_def");
  r.assign(r.slot(s, ["def_kind0"]), (await r.call("array_merge", r.get(s, "def_kind"), r.get(s, "def_kind0"))));
  r.assign(r.slot(s, ["def_kind0", r.APPEND]), "R");
  if (r.truth((await r.call("is_array", r.get(s, "def_kind0"))))) {
    {
      const a0 = r.copy(r.get(s, "def_kind0"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["key"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((!r.identical((await r.call("strpos", r.get(s, "sk243l"), r.get(s, "value"))), false)))) {
          r.update(r.slot(s, ["sk243list"]), "concat", (r.text(r.get(r.get(s, "itemspkinfo"), r.get(s, "value"))) + r.text(" ")));
        }
        r.assign(r.slot(s, ["sk243l"]), (await r.call("str_replace", r.get(s, "value"), "", r.get(s, "sk243l"))));
      }
    }
  }
  if (r.truth(r.equal(r.get(s, "sk243list"), ""))) {
    r.assign(r.slot(s, ["sk243list"]), "无");
  }
  await r.write("战斗中敌人没有正常生效的减半防御属性类型将永久对你无效<br>\r\n当前你无视的防御属性列表：<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "sk243list")));
  await r.write("</span>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n12级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
