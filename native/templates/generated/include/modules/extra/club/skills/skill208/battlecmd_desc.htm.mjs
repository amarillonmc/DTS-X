// Generated from include/modules/extra/club/skills/skill208/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("发动后获得增益效果：<br>");
  if (r.truth(r.equal(r.get(s, "card"), 5))) {
    await r.write("本次攻击最终伤害<span class=\"yellow b\">+70%</span>，无视敌方减半类防御属性；消耗<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气");
  } else {
    await r.write("本次攻击最终伤害<span class=\"yellow b\">+40%</span>，无视敌方减半类防御属性；消耗<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed")));
    await r.write("</span>怒气");
  }
return 1;
}
