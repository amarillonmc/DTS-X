// Generated from include/modules/extra/club/skills/skill90/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 90)))))) {
    await r.write("本次攻击属性伤害<span class=\"yellow b\">+(30+5×临时增益数)%</span>，");
    if (r.truth((r.compare(r.get(s, "rage"), r.get(s, "rageneed")) >= 0))) {
      await r.write("消耗<span class=\"red b\">");
      await r.write(r.text(r.get(s, "rageneed")));
      await r.write("</span>怒气");
    } else {
      await r.write("消耗<span class=\"red b\">");
      await r.write(r.text(r.get(s, "sscost")));
      await r.write("</span>歌魂");
    }
  } else {
    await r.write("需要<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气或<span class=\"red b\">");
    await r.write(r.text(r.get(s, "sscost")));
    await r.write("</span>歌魂发动");
  }
return 1;
}
