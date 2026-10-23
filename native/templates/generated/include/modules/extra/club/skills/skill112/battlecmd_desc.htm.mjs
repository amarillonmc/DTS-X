// Generated from include/modules/extra/club/skills/skill112/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 90)))))) {
    await r.write("本次攻击物理伤害<span class=\"yellow b\">+30%</span>，且无视减半防御属性，若击杀敌人则临时复制一个技能，消耗<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气与<span class=\"yellow b\">1</span>点理智值");
  } else {
    await r.write("怒气或理智值不足");
  }
return 1;
}
