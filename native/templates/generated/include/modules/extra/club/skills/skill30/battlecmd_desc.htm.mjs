// Generated from include/modules/extra/club/skills/skill30/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["rageneed"]), (await r.module("skill30", "get_rage_cost30")));
  r.assign(r.slot(s, ["hpcost"]), (await r.module("skill30", "get_hp_cost30")));
  await r.write("消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>点怒气以及<span class=\"red b\">");
  await r.write(r.text(r.get(s, "hpcost")));
  await r.write("</span>点生命值，附加相同的伤害。");
return 1;
}
