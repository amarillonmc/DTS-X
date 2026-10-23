// Generated from include/modules/extra/club/skills/skill265/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("物理伤害<span class=\"yellow b\">+");
  await r.write(r.text(r.get(s, "skill265phyup")));
  await r.write("%</span>，命中率<span class=\"yellow b\">+");
  await r.write(r.text(r.get(s, "skill265htrup")));
  await r.write("%</span>，射程<span class=\"yellow b\">+1</span>，<span class=\"yellow b\">连击</span>无效，但<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill265prate")));
  await r.write("%概率物穿</span>。消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>点怒气");
return 1;
}
