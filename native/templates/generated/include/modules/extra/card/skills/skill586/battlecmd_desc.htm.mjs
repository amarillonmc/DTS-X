// Generated from include/modules/extra/card/skills/skill586/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 586)))))) {
    await r.write("将对手装进异次元，消耗<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气");
  } else {
    await r.write("对手不为生命值低于你的NPC或异次元已满");
  }
return 1;
}
