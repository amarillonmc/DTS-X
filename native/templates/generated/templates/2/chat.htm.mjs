// Generated from templates/2/chat.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.call("defined", "IN_REPLAY")))) {
    await r.write("<div style=\"position:relative; height:100%; width:100%;\">\r\n<div class=\"skill_unacquired\">");
  }
  await r.write("<div id=\"chat\" class=\"profile_box\" style=\"width:720px; height:190px;\">\r\n<div id=\"chattitle\">聊天讯息</div><div id=\"chatlist\" style=\"display:block\" class=\"showlist chatlist\">");
  if (r.truth((!r.truth((await r.call("defined", "IN_REPLAY")))))) {
    if (r.truth((await r.call("is_array", r.get(r.get(s, "chatdata"), "msg"))))) {
      {
        const a0 = r.copy(r.get(r.get(s, "chatdata"), "msg"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["msg"]), v0);
          await r.write(r.text(r.get(s, "msg")));
        }
      }
    }
  }
  await r.write("</div><div id=\"newslist\" style=\"display:none\" class=\"showlist newslist\">");
  if (r.truth((!r.truth((await r.call("defined", "IN_REPLAY")))))) {
    if (r.truth((await r.call("is_array", r.get(r.get(s, "chatdata"), "news"))))) {
      {
        const a1 = r.copy(r.get(r.get(s, "chatdata"), "news"));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["news"]), v1);
          await r.write(r.text(r.get(s, "news")));
        }
      }
    }
  }
  await r.write("</div><div class=\"sendchat\">\r\n<form type=\"post\" id=\"sendchat\" name=\"sendchat\" action=\"chat.php\" onsubmit=\"return false;\" >\r\n<input type=\"hidden\" id=\"cgamenum\" name=\"cgamenum\" value=\"");
  await r.write(r.text(r.get(s, "gamenum")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"croomid\" name=\"croomid\" value=\"");
  await r.write(r.text(r.get(s, "groomid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"lastcid\" name=\"lastcid\" value=\"");
  await r.write(r.text(r.get(r.get(s, "chatdata"), "lastcid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"lastnid\" name=\"lastnid\" value=\"");
  await r.write(r.text(r.get(r.get(s, "chatdata"), "lastnid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"teamID\" name=\"teamID\" value=\"");
  await r.write(r.text(r.get(s, "teamID")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"chatpid\" name=\"chatpid\" value=\"");
  await r.write(r.text(r.get(s, "pid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"sendmode\" name=\"sendmode\" value=\"ref\">\r\n<div id=\"chattype\" style=\"display:inline-block;height:25px;vertical-align:middle;\">\r\n<select name=\"chattype\" value=\"2\">\r\n<option value=\"0\" selected>");
  await r.write(r.text(r.get(r.get(s, "chatinfo"), "0")));
  if (r.truth(r.get(s, "teamID"))) {
    await r.write("<option value=\"1\" >");
    await r.write(r.text(r.get(r.get(s, "chatinfo"), "1")));
  }
  await r.write("</select>\r\n</div> \r\n<div class=\"inputhint_container\" style=\"width:400px;\">\r\n<div class=\"inputhint\">可按回车发送消息</div>\r\n<input type=\"text\" id=\"chatmsg\" name=\"chatmsg\" maxlength=\"60\" onfocus=\"inputhint_onfocus(this)\" onblur=\"inputhint_onblur(this)\">\r\n</div>\r\n<input type=\"submit\" id=\"send\" class=\"glow_buttons white h25\" style=\"vertical-align:middle;\" onClick=\"\r\n$('sendmode').value='send';\r\n$('chatlist').style.display='block';\r\n$('newslist').style.display='none';\r\n$('chattitle').innerHTML='聊天讯息';\r\nchat('send',");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write(");\r\nreturn false;\" value=\"发送\">\r\n<input type=\"button\" id=\"ref\" class=\"glow_buttons white h25\" style=\"vertical-align:middle;\" onClick=\"if($('sendmode').value=='send'){$('sendmode').value='ref'};chat($('sendmode').value,");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write(");return false;\" value=\"刷新\">\r\n<input type=\"button\" id=\"switch\" class=\"glow_buttons white h25\" style=\"vertical-align:middle;\" onClick=\"\r\nif($('sendmode').value=='news'){\r\n$('sendmode').value='ref';\r\n$('chatlist').style.display='block';\r\n$('newslist').style.display='none';\r\n$('chattitle').innerHTML='聊天讯息';\r\n}else{\r\n$('sendmode').value='news';\r\n$('chatlist').style.display='none';\r\n$('newslist').style.display='block';\r\n$('chattitle').innerHTML='进行状况';\r\n}\r\nchat($('sendmode').value,");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write(");\r\nreturn false;\" value=\"切换模式\">\r\n</form>");
  if (r.truth((!r.truth((await r.call("defined", "IN_REPLAY")))))) {
    await r.write("<script type=\"text/javascript\">chat('ref',");
    await r.write(r.text(r.get(s, "chatrefresh")));
    await r.write(");</script>");
  }
  await r.write("</div>\r\n</div>");
  if (r.truth((await r.call("defined", "IN_REPLAY")))) {
    await r.write("</div><div class=\"skill_unacquired_hint\">\r\n<table border=\"0\" cellSpacing=0 cellPadding=0 height=100% width=100%>\r\n<tr><td valign=\"center\" align=\"center\">\r\n回放录像聊天记录暂未实现\r\n</td></tr>\r\n</table>\r\n</div></div>");
  }
return 1;
}
