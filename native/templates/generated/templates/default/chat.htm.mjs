// Generated from templates/default/chat.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.call("defined", "IN_REPLAY")))) {
    await r.write("<div style=\"position:relative; height:100%; width:100%;\">\r\n<div class=\"skill_unacquired\">");
  }
  await r.write("<div style=\"position:relative;\">\r\n<div id=\"chat_floating_banner\" style=\"left:500px;top:-4px;display:none;\">\r\n<span id=\"chat_floating_banner_inner\" class=\"red b\">测试</span>\r\n</div>\r\n<table id=\"chat\" width=\"720\" cellspacing=\"0\" cellpadding=\"0\" style=\"border:0;valign:top;table-layout:fixed;\">\r\n<tr>\r\n<td height=\"20px\" width=\"100%\" class=\"b1\"><span id=\"chattitle\">聊天讯息</span></td>\r\n</tr>\r\n<tr>\r\n<td valign=\"top\" class=\"b3\" style=\"text-align: left\" height=\"1px\">\r\n<div id=\"chatlist\" style=\"display:block\" class=\"chatlist gscroll\">");
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
  await r.write("</div><div id=\"newslist\" style=\"display:none\" class=\"newslist gscroll\">");
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
  await r.write("</div>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=\"5\"></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=\"35\">\r\n<div>\r\n<form type=\"post\" id=\"sendchat\" name=\"sendchat\" action=\"chat.php\" onsubmit=\"return false;\" >\r\n<input type=\"hidden\" id=\"cgamenum\" name=\"cgamenum\" value=\"");
  await r.write(r.text(r.get(s, "gamenum")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"croomid\" name=\"croomid\" value=\"");
  await r.write(r.text(r.get(s, "groomid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"lastcid\" name=\"lastcid\" value=\"");
  await r.write(r.text(r.get(r.get(s, "chatdata"), "lastcid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"lastnid\" name=\"lastnid\" value=\"");
  await r.write(r.text(r.get(r.get(s, "chatdata"), "lastnid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"teamID\" name=\"teamID\" value=\"");
  await r.write(r.text(r.get(s, "teamID")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"cpls\" name=\"cpls\" value=\"");
  await r.write(r.text(r.get(s, "pls")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"chatpid\" name=\"chatpid\" value=\"");
  await r.write(r.text(r.get(s, "pid")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"sendmode\" name=\"sendmode\" value=\"ref\">\r\n<input type=\"hidden\" id=\"obsv_flag\" name=\"obsv_flag\" value=\"0\">\r\n<input type=\"button\" id=\"showchatfloatbox\" style=\"height:24px;\" value=\"表情/定型文\" onmouseenter=\"\r\n$('chatfloatbox').style.display='block';\" />\r\n<span id=\"chattype\">\r\n<select name=\"chattype\" style=\"height:24px;\" id=\"chattype_sl\">\r\n<option value=\"0\">");
  await r.write(r.text(r.get(r.get(s, "chatinfo"), "0")));
  await r.write("</option>");
  if (r.truth(r.get(s, "teamID"))) {
    await r.write("<option value=\"1\" selected>");
    await r.write(r.text(r.get(r.get(s, "chatinfo"), "1")));
    await r.write("</option>");
  }
  await r.write("</select>\r\n</span>\r\n<input type=\"text\" id=\"chatmsg\" name=\"chatmsg\" maxlength=\"60\" style=\"width:400px;height:22px;\" />\r\n<input type=\"submit\" id=\"send\" style=\"width:60px;height:24px;\" onclick=\"\r\n$('sendmode').value='send';\r\n$('chatlist').style.display='block';\r\n$('newslist').style.display='none';\r\n$('chattitle').innerHTML='聊天讯息';\r\nchat('send',");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write(");\r\nreturn false;\" value=\"发送\" />\r\n\r\n<!--<input type=\"button\" id=\"ref\" style=\"height:24px;\" onClick=\"if($('sendmode').value=='send'){$('sendmode').value='ref'};chat($('sendmode').value,");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write(");return false;\" value=\"刷新\">-->\r\n<input type=\"button\" id=\"switch\" style=\"height:24px;\" onclick=\"\r\nif($('sendmode').value=='news'){\r\n$('sendmode').value='ref';\r\n$('chatlist').style.display='block';\r\n$('newslist').style.display='none';\r\n$('chattitle').innerHTML='聊天讯息';\r\n}else{\r\n$('sendmode').value='news';\r\n$('chatlist').style.display='none';\r\n$('newslist').style.display='block';\r\n$('chattitle').innerHTML='进行状况';\r\n}\r\nchat($('sendmode').value,");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write(");\r\nreturn false;\" value=\"切换模式\" />\r\n</form>");
  if (r.truth((!r.truth((await r.call("defined", "IN_REPLAY")))))) {
    await r.write("<script type=\"text/javascript\">chat('ref',");
    await r.write(r.text(r.get(s, "chatrefresh")));
    await r.write(");</script>");
  }
  await r.write("<div id=\"chatfloatbox\" style=\"display:none; width:850px; height:360px; bottom: 5px; left:0px;\" onmouseleave=\"this.style.display='none';\">\r\n<div style=\"width:656px;height:100%;position: absolute;left:0px;top:0px;\">\r\n<div>");
  r.assign(r.slot(s, ["i"]), 0);
  if (r.truth((await r.call("is_array", r.get(s, "emoticon_list"))))) {
    {
      const a2 = r.copy(r.get(s, "emoticon_list"));
      for (const [k2, v2] of r.entries(a2)) {
      r.assign(r.slot(s, ["ei"]), k2);
        r.assign(r.slot(s, ["ev"]), v2);
        await r.write("<img class=\"emoticon\" src=\"img/emoticons/");
        await r.write(r.text(r.get(s, "ev")));
        await r.write("\" onclick=\"addtxt='[");
        await r.write(r.text(r.get(s, "ei")));
        await r.write("]';if($('chatmsg').value.length+addtxt.length<=$('chatmsg').getAttribute('maxlength')) $('chatmsg').value+='[");
        await r.write(r.text(r.get(s, "ei")));
        await r.write("]';\">");
        r.post(r.slot(s, ["i"]), 1);
        if (r.truth(r.equal(r.modulo(r.get(s, "i"), 8), 0))) {
          await r.write(r.text("</div><div>"));
        }
      }
    }
  }
  await r.write("</div>\r\n</div><div style=\"width:194px;height:100%;position: absolute;right:0px;top:0px;\">");
  if (r.truth((await r.call("is_array", r.get(s, "on_premise_chat"))))) {
    {
      const a3 = r.copy(r.get(s, "on_premise_chat"));
      for (const [k3, v3] of r.entries(a3)) {
      r.assign(r.slot(s, ["ci"]), k3);
        r.assign(r.slot(s, ["cv"]), v3);
        await r.write("<div style=\"margin:8px 0;\">\r\n<a class=\"white b\" onclick=\"$('chatmsg').value='[");
        await r.write(r.text(r.get(s, "ci")));
        await r.write("]';$('send').click();$('chatfloatbox').style.display='none';\">");
        await r.write(r.text(r.get(s, "cv")));
        await r.write("</a>\r\n</div>");
      }
    }
  }
  await r.write("</div>\r\n</div>\r\n</div>\r\n</td>\r\n</tr>\r\n</table> \r\n</div>");
  if (r.truth((await r.call("defined", "IN_REPLAY")))) {
    await r.write("</div><div class=\"skill_unacquired_hint\">\r\n<table border=\"0\" cellSpacing=0 cellPadding=0 height=100% width=100%>\r\n<tr><td valign=\"center\" align=\"center\">\r\n回放录像聊天记录暂未实现\r\n</td></tr>\r\n</table>\r\n</div></div>");
  }
return 1;
}
