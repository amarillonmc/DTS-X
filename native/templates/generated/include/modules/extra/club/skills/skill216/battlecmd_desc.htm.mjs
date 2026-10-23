// Generated from include/modules/extra/club/skills/skill216/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["remtime"]), r.int((await r.module("skill216", "get_remaintime216"))));
  await r.write("本次战斗你将连续攻击2次；本局还可发动<span class=\"red b\">");
  await r.write(r.text(r.get(s, "remtime")));
  await r.write("</span>次");
return 1;
}
