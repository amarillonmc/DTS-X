// Generated from include/modules/extra/club/skills/skill273/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill273", "sys");
  r.assign(r.slot(s, ["null1"]), r.array([["type", 0]]));
  r.assign(r.slot(s, ["null2"]), r.array([["type", 1]]));
  r.assign(r.slot(s, ["chance1"]), (await r.module("skill273", "get_skill273_chance", r.get(s, "null1"), r.get(s, "who"), 0)));
  r.assign(r.slot(s, ["chance2"]), (await r.module("skill273", "get_skill273_chance", r.get(s, "null2"), r.get(s, "who"), 0)));
  r.assign(r.slot(s, ["dmgdown"]), (await r.module("skill273", "get_skill273_effect", r.get(s, "null1"), r.get(s, "who"), 0)));
  r.assign(r.slot(s, ["skill273var"]), (await r.module("skillbase", "skill_getvalue", 273, "choice", r.get(s, "who"))));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 273);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n对撞\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n持投系武器时，你对玩家/NPC分别有<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "chance1")));
  await r.write("%/");
  await r.write(r.text(r.get(s, "chance2")));
  await r.write("%</span>几率<br>在受到伤害时抵挡 (武器效果值的平方根 x 10) 点伤害(最多3000)。<br>\r\n如果武器耐久有限，会消耗1耐久。<br>");
  if (r.truth(r.equal(r.get(s, "skill273var"), 1))) {
    await r.write("<span class=\"yellow b\">本技能当前关闭中</span>。");
  } else {
    await r.write("<span class=\"cyan b\">本技能当前开启中</span>，");
    if (r.truth(r.get(s, "dmgdown"))) {
      await r.write("可以抵挡<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "dmgdown")));
      await r.write("</span>点伤害");
    } else {
      await r.write("<span class=\"yellow b\">但不满足发动条件</span>");
    }
  }
  await r.write("<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 2)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 2)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.equal(r.get(s, "skill273var"), r.get(s, "i")))) {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" disabled value=\"[已选择]\">");
        } else {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" onclick=\"$('mode').value='special';$('command').value='skill273_special';$('subcmd').value='upgrade';$('skillpara1').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
          await r.write(r.text(r.get(r.get(s, "skill273stateinfo"), r.get(s, "i"))));
          await r.write("\">");
        }
        if (r.truth((r.compare(r.get(s, "i"), 2) < 0))) {
          await r.write("&nbsp;&nbsp;&nbsp;");
        }
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r");
    await r.write(r.text(r.get(s, "unlock_lvl273")));
    await r.write("级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
