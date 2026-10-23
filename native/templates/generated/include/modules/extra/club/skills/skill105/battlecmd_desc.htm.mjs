// Generated from include/modules/extra/club/skills/skill105/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("本次攻击中，技能“<span class=\"yellow b\">晶环</span>”的生效概率增加至<span class=\"yellow b\">70%</span>，消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
