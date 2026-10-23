// Generated from changelogs/newfeature.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br>\r\n\r\n<div style=\"width:50%; margin:0 auto; text-align:left\">\r\n<font size=\"5\">肌肉兄贵技能初稿预览：</font><br><br>\r\n<font size=\"2\">\r\n※ 基本特性 开局基础攻击力+200，基础防御力+200，升级时攻防成长增加，技能点获取攻防数值增加。<br>\r\n<br>\r\n※ 活化 每次攻击提升一点基础攻击，每次被攻击提升一点基础防御。<br>\r\n<br>\r\n※ 龙胆 3级 获得技能“神速”或者“恃勇”。<br>\r\n<br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;神速 战斗中基础攻击力增加10%，每次攻击提升1点基础攻击；<br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;射程内反击判定时60%几率触发，触发则反击；<br>\r\n<br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恃勇 先攻率增加10%，战斗中基础防御力增加35%，每次被攻击提升2点基础防御；<br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;但战斗中敌方视为具有“神速”；<br>\r\n<br>\r\n※ 金刚 每一点基础防御降低x%固定伤害或爆炸伤害，最高50%。（可随意切换）<br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0级： x=0.01 <br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1级： x=0.02 （4技能点）<br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2级： x=0.03 （5技能点）<br>\r\n固定伤害指的是灵系和重枪的固定部分。<br>\r\n<br>\r\n※ 重拳 3级 战斗技，本次攻击物理伤害+30%。20怒气。<br>\r\n<br>\r\n※ 暴打 12级 战斗技，本次攻击物理伤害+30%，本次战斗中对方所有称号技能无效。85怒气。<br>\r\n<br>\r\n<font size=\"3\">欢迎在主群讨论意见。实装可能得等一阵子我闲下来再说了……</font>\r\n</font>\r\n</font>\r\n</div>");
  (await r.include(r.template("footer"), s));
return 1;
}
