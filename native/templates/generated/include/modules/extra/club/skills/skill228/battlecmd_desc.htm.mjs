// Generated from include/modules/extra/club/skills/skill228/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 228)))))) {
    r.assign(r.slot(s, ["stunsec228"]), r.divide(r.get(s, "stuntime228"), 1000));
    await r.write("本次攻击最终伤害<span class=\"yellow b\">×1.6</span>，并击晕敌人<span class=\"cyan b\">");
    await r.write(r.text(r.get(s, "stunsec228")));
    await r.write("</span>秒，");
    if (r.truth((r.compare(r.get(s, "rage"), r.get(s, "rageneed")) >= 0))) {
      await r.write("消耗<span class=\"red b\">");
      await r.write(r.text(r.get(s, "rageneed")));
      await r.write("</span>怒气");
    } else {
      await r.write("<span class=\"yellow b\">消耗5技能点</span>");
    }
  } else {
    await r.write("需要<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气或<span class=\"red b\">");
    await r.write(r.text(r.get(s, "skill228_skillpoint_req")));
    await r.write("</span>个技能点方可发动");
  }
return 1;
}
