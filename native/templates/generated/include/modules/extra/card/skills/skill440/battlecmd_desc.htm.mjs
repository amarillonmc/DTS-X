// Generated from include/modules/extra/card/skills/skill440/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 440)))))) {
    await r.write("本次战斗中敌方玩家所有技能无效，并使敌人<span class=\"red b\">烧伤</span>、<span class=\"purple b\">中毒</span>，且<span class=\"yellow b\">40</span>秒内无法解除");
  } else {
    await r.write("只能对玩家发动");
  }
return 1;
}
