// Generated from include/modules/extra/club/skills/skill253/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["skgain"]), (await r.call("min", 220, (await r.call("round", r.divide(r.multiply(r.get(s, "rage"), r.get(s, "lvl")), 6))))));
  await r.write("计算熟练度时增加<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skgain")));
  await r.write("</span>点，消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
