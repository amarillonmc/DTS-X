// Generated from include/modules/extra/club/skills/skill86/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 86)))))) {
    await r.write("佣兵的追加攻击率上升至<span class=\"yellow b\">50%</span>，消耗<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气，并支付每个追击的佣兵<span class=\"red b\">");
    await r.write(r.text(r.get(s, "moneycost")));
    await r.write("</span>元金钱");
  } else {
    await r.write("<span class=\"red b\">发动条件不满足</span>");
  }
return 1;
}
