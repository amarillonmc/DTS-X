// Generated from include/modules/extra/club/skills/skill259/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["dmgadd"]), r.add(1, (await r.module("skill259", "get_skill259_adddmg", r.get(s, "sdata")))));
  await r.write("本次攻击附加");
  await r.write(r.text(r.get(s, "dmgadd")));
  await r.write("点物理固定伤害；消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
