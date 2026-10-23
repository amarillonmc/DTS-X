// Generated from include/modules/extra/card/skills/skill722/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("发出巨大的响声，命中后将双方包裹和视野里的道具用毒补给覆盖。消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>怒气");
return 1;
}
