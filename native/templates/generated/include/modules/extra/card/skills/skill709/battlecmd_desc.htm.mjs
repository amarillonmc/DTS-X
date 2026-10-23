// Generated from include/modules/extra/card/skills/skill709/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("打落对方的武器并混入两个假道具中，仅对玩家有效。消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>怒气");
return 1;
}
