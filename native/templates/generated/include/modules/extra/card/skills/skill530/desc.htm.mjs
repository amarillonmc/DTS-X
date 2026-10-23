// Generated from include/modules/extra/card/skills/skill530/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 530);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n降维\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n一次性技能。把自己转移到另外一个随机的游戏中。<br>（除错、伐木、教程、试炼模式和开局不满15分钟的游戏除外）<br>\r\n降维后你会位于【三体星】并手持【维度跌落「二向箔」】，但其他装备道具和金钱都会丢失，且使用这个技能后你将无法完成竞速挑战。<br>\r\n你只能降维1次，并且每局游戏最多只能有1个玩家转移出去。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill530_special';$('subcmd').value=postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n武器效果值不低于7000点才能发动！\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
