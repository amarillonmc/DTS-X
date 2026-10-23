// Generated from include/modules/extra/club/skills/skill38/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("必定触发技能“<span class=\"yellow b\">猛击</span>”，并附加(<span class=\"yellow b\">敌方体力上限减当前体力</span>)点伤害。消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气\r\n");
return 1;
}
