// Generated from templates/default/header.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">\r\n<html>\r\n<head>\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=");
  await r.write(r.text(r.get(s, "charset")));
  await r.write("\">\r\n<meta http-equiv=\"pragma\" content=\"no-cache\">\r\n<meta http-equiv='expires' content='0'>\r\n<meta name=\"viewport\" content=\"width=1050px,initial-scale=1.0\">\r\n<title> ");
  await r.write(r.text(r.get(s, "gtitle")));
  await r.write(" </title>");
  if (r.truth(((r.get(s, "extrahead") != null)))) {
    await r.write(r.text(r.get(s, "extrahead")));
  }
  await r.write("<link rel=\"icon\" href=\"favicon.ico\"><!-- 32×32 -->\r\n<link rel=\"apple-touch-icon\" href=\"apple-touch-icon.png\"><!-- 180×180 -->\r\n<link rel=\"manifest\" href=\"site.webmanifest\">\r\n\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_1.20240331.css\">\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_card.20240207.css\">");
  if (r.truth((r.truth(r.equal(r.get(s, "u_templateid"), 2)) || r.truth((await r.call("defined", "IN_REPLAY")))))) {
    await r.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_2.20240311.css\">");
  }
  await r.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_buttons.20240219.css\">\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_glowbuttons.20230807.css\">\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_bubblebox.20240223.css\">");
  if (r.truth(r.equal(r.constant("CURSCRIPT"), "messages"))) {
    await r.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_messages.20230712.css\">");
  }
  if (r.truth(r.equal(r.constant("CURSCRIPT"), "user_profile"))) {
    await r.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"gamedata/css/style_ach.20230901.css\">");
  }
  await r.write("<!-- jScrollPanel Utility Start -->\r\n<!--<link type=\"text/css\" href=\"include/javascript/jScrollPane/jquery.jscrollpane.css\" rel=\"stylesheet\" media=\"all\" />\r\n<link type=\"text/css\" href=\"include/javascript/jScrollPane/jquery.jscrollpane.lozenge.css\" rel=\"stylesheet\" media=\"all\" />\r\n<script type=\"text/javascript\" src=\"include/javascript/jScrollPane/jquery.mousewheel.js\"></script>\r\n<script type=\"text/javascript\" src=\"include/javascript/jScrollPane/mwheelIntent.js\"></script>\r\n<script type=\"text/javascript\" src=\"include/javascript/jScrollPane/jquery.jscrollpane.js\"></script>-->\r\n\r\n<script type=\"text/javascript\" src=\"include/javascript/jquery-1.12.4.min.js\"></script>\r\n<script type=\"text/javascript\" id=\"sourcecode\">\r\njQuery.noConflict();\r\n</script>\r\n<!-- jScrollPanel Utility End -->\r\n\r\n<script type=\"text/javascript\" src=\"include/javascript/common.20240405.js\"></script>\r\n<script type=\"text/javascript\" src=\"include/javascript/game.20240718.js\"></script>");
  if (r.truth((r.truth(r.equal(r.get(s, "u_templateid"), 2)) || r.truth((await r.call("defined", "IN_REPLAY")))))) {
    await r.write("<script type=\"text/javascript\" src=\"include/javascript/interface_2.20230924.js\"></script>");
  }
  await r.write("<!-- gzip Decode Utility Start -->\r\n<script type=\"text/javascript\" src=\"include/javascript/gzip.util.js\"></script>\r\n<!-- gzip Decode Utility End -->\r\n\r\n<!-- Game Word Data Lib Start -->");
  r.global(s, "___MOD_CODE_ADV3");
  if (r.truth(r.get(s, "___MOD_CODE_ADV3"))) {
    await r.write("<script type=\"text/javascript\" src=");
    r.assign(r.slot(s, ["___TEMP_curdatalibname"]), (await r.call("file_get_contents", (r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/javascript/datalib.current.txt")))));
    await r.write(r.text((r.text((r.text("\"gamedata/javascript/") + r.text(r.get(s, "___TEMP_curdatalibname")))) + r.text("\""))));
    await r.write("></script>");
  }
  await r.write("<!-- Game Word Data Lib End -->\r\n\r\n<!-- jQuery Load Script Utility -->\r\n<script type=\"text/javascript\" src=\"include/javascript/jquery.cachedScript.js\"></script>\r\n<!-- jQuery Load Script Utility End -->\r\n\r\n</head>\r\n<BODY ");
  if (r.truth(r.equal(r.constant("CURSCRIPT"), "game"))) {
    await r.write("onkeyup=\"hotkey(event);\"");
    if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "gamestate")))))) && r.truth((r.compare(r.get(s, "gamestate"), 40) >= 0))))) {
      await r.write("style=\"background-image:url('img/PB2.gif');\"");
    }
  }
  await r.write(">\r\n<div class=\"title\" > ");
  await r.write(r.text(r.get(s, "gtitle")));
  await r.write(" ");
  if (r.truth(r.equal(r.get(s, "u_templateid"), 2))) {
    await r.write("TEST INTERFACE");
  }
  await r.write("</div><div class=\"headerlink\" >\r\n<a href=\"index.php\">>>首页</a>");
  if (r.truth((r.truth(((r.get(s, "cuser") != null))) && r.truth(((r.get(s, "cpass") != null)))))) {
    await r.write("<a href=\"messages.php\">>>站内邮件");
    if (r.truth((!r.truth((!r.truth(r.get(s, "new_messages"))))))) {
      await r.write("<span class=\"L5 b\">NEW!</span>");
    }
    await r.write("</a>\r\n<a href=\"user_profile.php\">>>帐号资料</a>");
  } else {
    await r.write("<a href=\"register.php\">>>账号注册</a>");
  }
  await r.write("<a href=\"game.php\">>>进入游戏</a>\r\n<a href=\"map.php\">>>战场地图</a>\r\n<a href=\"news.php\">>>进行状况</a>\r\n<a href=\"alive.php\">>>当前幸存</a>\r\n<a href=\"winner.php\">>>历史优胜</a>\r\n<a href=\"rank.php\">>>玩家排行</a>\r\n<a href=\"help.php\">>>游戏帮助</a>\r\n<a href=\"logistics.php\">>>刺激市场</a>\r\n<a href=\"admin.php\">>>游戏管理</a>\r\n<a href=\"");
  await r.write(r.text(r.get(s, "bbsurl")));
  await r.write("\" target=\"_blank\">>>官方讨论区</a>\r\n<a href=\"");
  await r.write(r.text(r.get(s, "homepage")));
  await r.write("\" target=\"_blank\">>>官方网站</a>\r\n<!--[if lt IE 7]> <div style=' clear: both; height: 59px; padding:0 0 0 15px; position: relative;'> <a href=\"http://windows.microsoft.com/en-US/internet-explorer/products/ie/home?ocid=ie6_countdown_bannercode\"><img src=\"http://storage.ie6countdown.com/assets/100/images/banners/warning_bar_0027_Simplified Chinese.jpg\" border=\"0\" height=\"42\" width=\"820\" alt=\"You are using an outdated browser. For a faster, safer browsing experience, upgrade for free today.\" /></a></div> <![endif]-->\r\n \r\n</div><div id=\"fmsgbox-container\"></div><div id=\"hidden-fmsgbox-container\" style=\"display:none;\"></div><div id=\"hidden-persistent-fmsgbox-container\"></div><div style=\"text-align:center\">\r\n");
return 1;
}
