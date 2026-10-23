// Generated from include/modules/extra/card/skills/skill517/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["remtime"]), r.int((await r.module("skill517", "get_remaintime517"))));
  await r.write("物理伤害归0；对方随机防具的耐久下降你武器效果值；本局还可发动<span class=\"red b\">");
  await r.write(r.text(r.get(s, "remtime")));
  await r.write("</span>次");
return 1;
}
