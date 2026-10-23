// Generated from include/modules/extra/club/skills/skill75/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["sk75_dmg"]), r.add(r.get(s, "lvl"), 30));
  await r.write("附加<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk75_dmg")));
  await r.write("</span>点伤害");
return 1;
}
