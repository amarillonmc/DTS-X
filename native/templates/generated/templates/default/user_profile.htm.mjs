// Generated from templates/default/user_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" align=\"center\">帐号资料</div>\r\n<center>\r\n<table style=\"text-align: center;\" CellSpacing=0 CellPadding=0>\r\n<tr>\r\n<td>\r\n<table>\r\n<tr>\r\n<td>账号</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
  await r.write(r.text(r.get(s, "username")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>游戏场数</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
  await r.write(r.text(r.get(s, "validgames")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>获胜场数</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
  await r.write(r.text(r.get(s, "wingames")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>胜率</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
  await r.write(r.text(r.get(s, "winning_rate")));
  await r.write("</td>\r\n</tr>");
  if (r.truth((await r.call("defined", "MOD_ELORATING")))) {
    await r.write("<tr style=\"cursor:pointer;\" title=\"点击查看天梯积分详细信息\" onclick=\"bubblebox_show('elodata');\">\r\n<td>天梯积分</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
    if (r.truth(r.equal(r.get(s, "elo_history"), ""))) {
      await r.write("1500");
    } else {
      await r.write("<span style=\"color:");
      await r.write(r.text((await r.module("elorating", "elorating_get_color", r.get(s, "elo_rating")))));
      await r.write("\"><span style=\"font-weight:bold;\">");
      await r.write(r.text(r.get(s, "elo_rating")));
      await r.write("</span></span>");
    }
    await r.write("</td>\r\n</tr>");
  }
  await r.write("<tr>\r\n<td>积分</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
  await r.write(r.text(r.get(s, "credits")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>切糕</td>\r\n<td width=55px>&nbsp;</td>\r\n<td>");
  await r.write(r.text(r.get(s, "gold")));
  await r.write("</td>\r\n</tr>");
  if (r.truth(r.get(s, "gold2"))) {
    await r.write("<tr>\r\n<td><span class=\"cyan b\">因果</span></td>\r\n<td width=55px>&nbsp;</td>\r\n<td><span class=\"cyan b\">");
    await r.write(r.text(r.get(s, "gold2")));
    await r.write("</span></td>\r\n</tr>");
  }
  await r.write("<tr style=\"cursor:pointer;\" title=\"点击查看身份卡详细信息\" onclick=\"bubblebox_show('carddata');\">\r\n<td>身份卡</td>\r\n<td width=55px>&nbsp;</td>\r\n<td><span class=\"");
  await r.write(r.text(r.get(s, "rarecolor")));
  await r.write("\">");
  await r.write(r.text(r.get(s, "cr")));
  await r.write(" ");
  await r.write(r.text(r.get(r.get(s, "carr"), "name")));
  await r.write("</span></td>\r\n</tr>\r\n</table>\r\n</td>\r\n<td width=60px>&nbsp;</td>\r\n<td>\r\n<table>\r\n<tr><td>\r\n<div id=\"userIconImg\" class=\"iconImg\" >\r\n<img src=\"img/");
  await r.write(r.text(r.get((await r.module("player", "icon_parser_shell", r.get(s, "udata"))), 0)));
  await r.write("\">\r\n</div>\t\r\n</td></tr>\r\n<tr><td>");
  if (r.truth(r.get(s, "curuser"))) {
    await r.write("<button type=\"button\" class=\"b_button bc_white\" style=\"width:140px;padding:0.5em;\" onclick=\"window.location.href='user.php'\">编辑我的账户资料</button>");
  }
  await r.write("</td></tr>\r\n<tr><td>");
  if (r.truth(r.get(s, "curuser"))) {
    await r.write("<button type=\"button\" class=\"b_button bc_white\" style=\"width:140px;padding:0.5em;\" onclick=\"window.location.href='kujilist.php'\">我要抽卡</button>");
  }
  await r.write("</td></tr>\r\n<tr><td>");
  if (r.truth(r.get(s, "curuser"))) {
    await r.write("<button type=\"button\" class=\"b_button bc_white\" style=\"width:140px;padding:0.5em;\" onclick=\"window.location.href='cardbook.php?packName=Standard Pack'\">查看我的卡册</button>");
  } else {
    await r.write("<button type=\"button\" class=\"b_button bc_white\" style=\"width:140px;padding:0.5em;\" onclick=\"window.location.href='cardbook.php?playerID=");
    await r.write(r.text(r.get(s, "uname")));
    await r.write("&packName=Standard Pack'\">查看他的卡册</button>\r\n<br><button type=\"button\" class=\"b_button bc_white\" style=\"width:140px;padding:0.5em;\" onclick=\"window.location.href='showcase.php?playerID=");
    await r.write(r.text(r.get(s, "uname")));
    await r.write("'\">查看他的展柜</button>");
  }
  await r.write("</td></tr>\r\n</table>\r\n</td>\r\n</tr>\r\n</table>\r\n<div style=\"width:600px;text-align:center;\"><span class=\"cyan b\">点击天梯积分和身份卡可以查看详细信息</span></div>");
  if (r.truth((await r.call("defined", "MOD_ACHIEVEMENT_BASE")))) {
    (await r.include(r.template("achievements"), s));
  }
  await r.write("<br><br>\r\n</center>");
  if (r.truth((await r.call("defined", "MOD_ELORATING")))) {
    (await r.call("bubblebox_start", "id:elodata;height:450;width:650;cancellable:1;"));
    (await r.module("elorating", "elorating_show"));
    await r.write("<input class=\"cmdbutton\" onclick=\"bubblebox_hide_all();\" value=\"关闭窗口\" type=\"button\">");
    (await r.call("bubblebox_end"));
  }
  (await r.call("bubblebox_start", "id:carddata;height:370;width:250;cancellable:1;"));
  await r.write("<div style=\"text-align:center;\">\r\n<div style=\"margin:2px\">以下是该身份卡的数据。</div>");
  r.assign(r.slot(s, ["nowcard"]), r.get(s, "carr"));
  (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
  await r.write("<div style=\"margin:2px\"><input class=\"cmdbutton\" onclick=\"bubblebox_hide_all();\" value=\"关闭窗口\" type=\"button\"></div>\r\n</div>");
  (await r.call("bubblebox_end"));
  (await r.include(r.template("footer"), s));
return 1;
}
