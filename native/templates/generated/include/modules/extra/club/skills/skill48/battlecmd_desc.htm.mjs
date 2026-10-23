// Generated from include/modules/extra/club/skills/skill48/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["attrgot"]), (await r.module("skill48", "check_available_attr48", r.get(s, "sdata"), r.get(s, "edata"), 1)));
  if (r.truth((!r.truth(r.get(s, "attrgot"))))) {
    await r.write("本次攻击随机附加一种下位攻击属性。此外，");
  }
  await r.write("攻击后在本次施加的属性中随机选择一种，你持投掷兵器造成的该属性伤害永久<span class=\"yellow b\">+3%</span>；消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
