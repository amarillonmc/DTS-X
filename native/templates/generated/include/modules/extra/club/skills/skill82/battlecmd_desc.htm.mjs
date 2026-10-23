// Generated from include/modules/extra/club/skills/skill82/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["sk82_dmg"]), (await r.module("skill82", "get_dmg82", r.get(s, "sdata"))));
  await r.write("本次攻击附加<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk82_dmg")));
  await r.write("</span>点伤害，且武器损耗率减半，消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
