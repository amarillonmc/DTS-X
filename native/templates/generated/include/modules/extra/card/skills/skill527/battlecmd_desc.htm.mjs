// Generated from include/modules/extra/card/skills/skill527/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 527)))))) {
    await r.write("本次攻击结束时，让你的基础攻击力翻倍。");
    r.assign(r.slot(s, ["rmt"]), (await r.module("skill527", "get_remaintime527", r.get(s, "sdata"))));
    await r.write("本局还能发动<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "rmt")));
    await r.write("</span>次。");
  } else {
    await r.write("你本局已经不能再发动这个技能了。");
  }
return 1;
}
