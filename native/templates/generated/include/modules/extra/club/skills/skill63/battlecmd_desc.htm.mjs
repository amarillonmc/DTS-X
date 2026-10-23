// Generated from include/modules/extra/club/skills/skill63/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["skill63_cnt"]), r.int((await r.module("skill63", "get_remaintime63"))));
  await r.write("这名敌人对你的伤害将永久降低<span class=\"yellow b\">20%</span>");
return 1;
}
