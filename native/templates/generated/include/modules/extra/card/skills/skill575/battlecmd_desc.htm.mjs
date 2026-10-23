// Generated from include/modules/extra/card/skills/skill575/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["r"]), (await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 575)));
  if (r.truth((!r.truth(r.get(s, "r"))))) {
    await r.write("使对手获得一道难题，仅对玩家有效且对每名玩家限一次。消耗<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气");
  } else {
    if (r.truth(r.equal(r.get(s, "r"), 6))) {
      await r.write("你已对该玩家使用过此技能");
    } else {
      await r.write("只能对玩家发动");
    }
  }
return 1;
}
