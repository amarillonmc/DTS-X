// Generated from include/modules/extra/club/skills/skill26/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["sklvl"]), (await r.module("skillbase", "skill_getvalue", 26, "lvl")));
  if (r.truth(r.equal(r.get(s, "sklvl"), 1))) {
    await r.write("本次攻击伤害全部视为<span class=\"red b\">火焰</span>伤害。");
  } else {
    await r.write("本次攻击伤害全部视为<span class=\"red b\">灼焰</span>伤害。");
  }
  await r.write("消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
