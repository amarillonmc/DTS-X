// Generated from templates/default/index.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<table align=\"center\" style=\"text-align:center;border:0;padding:0;\">\r\n<tr>\r\n<td><span class=\"yellow b\">游戏版本：</span></td>\r\n<td style=\"text-align:left;\"><span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "gameversion")));
  await r.write("</span></td>\r\n<td>&nbsp;&nbsp;&nbsp;&nbsp;</td>\r\n<td style=\"text-align:center;padding:0 0 0 25px;\"><span class=\"yellow b\">站长留言</span></td>\r\n</tr>\r\n<tr>\r\n<td><span class=\"yellow b\">当前时刻：</span></td>\r\n<td style=\"text-align:left;\"><span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "month")));
  await r.write("月");
  await r.write(r.text(r.get(s, "day")));
  await r.write("日 星期");
  await r.write(r.text(r.get(r.get(s, "week"), (r.text(r.get(s, "wday"))))));
  await r.write(" ");
  await r.write(r.text(r.get(s, "hour")));
  await r.write(":");
  await r.write(r.text(r.get(s, "min")));
  await r.write("</span></td>\r\n<td></td>\r\n<td rowspan=\"3\" style=\"width:520px; height:100%; vertical-align:top;text-align:left;\">\r\n<span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "adminmsg")));
  await r.write("</span>\t\t\r\n</td>\r\n</tr>\r\n<tr>\r\n<td><span class=\"yellow b\">系统状况：</span></td>\r\n<td style=\"text-align:left;\"><span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "systemmsg")));
  await r.write("</span></td>\r\n<td></td>\r\n</tr>\r\n<tr>\r\n<td><span class=\"yellow b\">游戏情报：</span></td>\r\n<td style=\"text-align:left;\">\r\n<span class=\"evergreen b\">\r\n<span class=\"evergreen2\">");
  if (r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))) {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text((r.text((r.text("房间&nbsp;") + r.text((await r.call("room_prefix2id", r.get(s, "room_prefix")))))) + r.text("&nbsp;"))));
    await r.write("</span>");
  } else {
    await r.write("第 ");
    await r.write(r.text(r.get(s, "gamenum")));
    await r.write(" 回游戏 ");
  }
  if (r.truth(r.get(s, "gametype"))) {
    await r.write(r.text(r.get(r.get(s, "gtinfo"), r.get(s, "gametype"))));
  }
  await r.write(" ");
  if (r.truth((!r.equal(r.get(s, "gametype"), 17)))) {
    await r.write(r.text(r.get(r.get(s, "gstate"), r.get(s, "gamestate"))));
  }
  await r.write("</span>\r\n</span>\r\n</td>\r\n<td></td>\r\n\r\n</tr>\r\n<tr>\r\n<td colspan=\"2\" style=\"vertical-align:top;\">\r\n<div>");
  if (r.truth((r.compare(r.get(s, "gamestate"), 10) > 0))) {
    await r.write("本局游戏已经进行  <span id=\"timing\"></span><script type=\"text/javascript\">updateTime('timing',");
    await r.write(r.text(r.get(s, "timing")));
    await r.write(",1,1000,'hh:mm:ss');</script><br> ");
    if (r.truth(r.get(s, "hplayer"))) {
      await r.write("当前最高伤害 ");
      await r.write(r.text(r.get(s, "hplayer")));
      await r.write(" (");
      await r.write(r.text(r.get(s, "hdamage")));
      await r.write(")<br>");
    }
  } else {
    if (r.truth((r.compare(r.get(s, "starttime"), r.get(s, "now")) > 0))) {
      await r.write("下局游戏开始于  <span id=\"timing\"></span><script type=\"text/javascript\">updateTime('timing',");
      await r.write(r.text(r.get(s, "timing")));
      await r.write(",0,1000,'hh:mm:ss');</script>   后<br>");
    } else {
      await r.write("下局游戏开始时间  <span id=\"timing\"></span>未定<br>");
    }
    if (r.truth(r.get(s, "hplayer"))) {
      await r.write("上局最高伤害 ");
      await r.write(r.text(r.get(s, "hplayer")));
      await r.write(" (");
      await r.write(r.text(r.get(s, "hdamage")));
      await r.write(")<br>");
    }
  }
  await r.write("</div><div>");
  if (r.truth((!r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))))) {
    await r.write("上局结果：<span id=\"lastwin\">");
    await r.write(r.text(r.get(r.get(s, "gwin"), r.get(s, "winmode"))));
    await r.write("</span>");
    if (r.truth(r.get(s, "winner"))) {
      await r.write("，优胜者：<span id=\"lastwinner\">");
      await r.write(r.text(r.get(s, "winner")));
      await r.write("</span>");
    }
  }
  await r.write("</div>\r\n禁区间隔时间： ");
  await r.write(r.text(r.get(s, "areaintv")));
  await r.write(" 分钟 ， ");
  await r.write(r.text(r.get(s, "arealimit")));
  await r.write(" 禁后停止激活<br>\r\n每次增加禁区： ");
  await r.write(r.text(r.get(s, "areaadd")));
  await r.write(" 个 ， 当前禁区数： ");
  await r.write(r.text(r.get(s, "areanum")));
  await r.write("<br>\r\n自动逃避禁区功能：");
  if (r.truth((r.truth(r.get(s, "areaesc")) && r.truth((r.compare(r.get(s, "gamestate"), 40) < 0))))) {
    await r.write("<span class=\"yellow b\">开放</span>");
  } else {
    await r.write("<span class=\"red b\">关闭</span>");
  }
  await r.write("<br>\r\n<span class=\"red b\">注意：进入连斗后，自动逃避功能自动关闭。</span><br><br>\r\n激活人数：<span id=\"validnum\">");
  await r.write(r.text(r.get(s, "validnum")));
  await r.write("</span>\r\n生存人数：<span id=\"alivenum\">");
  await r.write(r.text(r.get(s, "alivenum")));
  await r.write("</span>\r\n死亡总数：<span id=\"deathnum\">");
  await r.write(r.text(r.get(s, "deathnum")));
  await r.write("</span>\r\n<br />");
  if (r.truth(r.get(s, "cuser"))) {
    await r.write("<br />欢迎你，");
    await r.write(r.text(r.get(s, "cuser")));
    await r.write("！\r\n<form method=\"post\" name=\"togame\" action=\"game.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"main\">\r\n<input type=\"submit\" name=\"enter\" value=\"进入游戏\">\r\n</form>\r\n\r\n<form method=\"post\" name=\"quitgame\" action=\"game.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"quit\">\r\n<input type=\"submit\" name=\"quit\" value=\"账号退出\">\r\n</form>");
  } else {
    await r.write("<form method=\"post\" name=\"login\" action=\"login.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"main\">\r\n账号<input type=\"text\" name=\"username\" size=\"20\" maxlength=\"20\" value=\"");
    await r.write(r.text(r.get(s, "cuser")));
    await r.write("\">\r\n密码<input type=\"password\" name=\"password\" size=\"20\" maxlength=\"24\" value=\"");
    await r.write(r.text(r.get(s, "cpass")));
    await r.write("\">\r\n<input type=\"submit\" name=\"enter\" value=\"登录\">\r\n</form>");
  }
  await r.write("</td>\r\n<td></td>\r\n<td rowspan=\"2\" style=\"width:400px; vertical-align:top;text-align:left;\">");
  (await r.include(r.template("roomlist"), s));
  await r.write("<div>\r\n<span class=\"evergreen\" style=\"font-size:16px;line-height:32px;\">如果你是新玩家，请先体验<a href=\"roomcmd.php?command=newroom&amp;para1=7\" class=\"red b\" style=\"font-size:16px;\"> 教程模式 </a>！\r\n也可在<a href=\"roomcmd.php?command=newroom&amp;para1=13\" class=\"lightblue b\" style=\"font-size:16px;\"> 蹲站模式 </a>获得别样乐趣！\r\n</span>\r\n</div>\r\n</td>\r\n</tr>\r\n</table>");
  (await r.include(r.template("footer"), s));
return 1;
}
