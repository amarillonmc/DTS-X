// Generated from templates/default/messages.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"position:relative\">\r\n<div id=\"loading\"></div><div>");
  if (r.truth((r.truth(r.equal("showdel", r.get(s, "mode"))) && r.truth((!r.truth(r.get(s, "info"))))))) {
    await r.write("<div><span class=\"yellow b\">当前在垃圾箱。</span><span class=\"grey b\">系统会定期清空垃圾箱中1个月以上的邮件</span></div>");
  }
  if (r.truth((r.truth(r.equal("showdel", r.get(s, "mode"))) || r.truth(r.equal("recover", r.get(s, "mode")))))) {
    await r.write("<div style=\"display:inline-block;width:160px\"></div>\r\n<input type=\"button\" class=\"b_button bc_black\" value=\"返回邮箱\" onclick=\"$('mode').value='showmail';postCmd('message_cmd', 'messages.php');this.disabled=true;\" />&nbsp;&nbsp;&nbsp;");
    if (r.truth((!r.truth((!r.truth(r.get(s, "messages"))))))) {
      await r.write("<input type=\"button\" class=\"b_button bc_black\" value=\"全选/反选\" onclick=\"jQuery('.message_sl').each(function(){this.click();});\" />&nbsp;\r\n<input type=\"button\" class=\"b_button bc_black\" style=\"width:114px\" value=\"恢复\" onclick=\"\r\nvar recflag=0;\r\njQuery('.message_sl').each(function(){\r\nif(this.checked){recflag=1;return false;}\r\n});\r\nif(recflag){\r\nif($('mode').value!='recover') {\r\n$('rec_confirm').style.display='inline';\r\nthis.value='确认恢复';\r\n$('mode').value='recover';\r\n}else{\r\n$('rec_confirm').style.display='none';\r\npostCmd('message_cmd', 'messages.php');this.disabled=true;\r\n$('mode').value='';\r\n}\r\n}\r\n\" />&nbsp;\r\n<input type=\"button\" class=\"b_button bc_black\" style=\"width:114px\" value=\"彻底删除\" onclick=\"\r\nvar del2flag=0;\r\njQuery('.message_sl').each(function(){\r\nif(this.checked){del2flag=1;return false;}\r\n});\r\nif(del2flag){\r\nif($('mode').value!='del2') {\r\n$('del2_confirm').style.display='inline';\r\n$('rec_confirm').style.display='none';\r\nthis.value='确认删除';\r\n$('mode').value='del2';\r\n}else{\r\n$('del2_confirm').style.display='none';\r\npostCmd('message_cmd', 'messages.php');this.disabled=true;\r\n$('mode').value='';\r\n}\r\n}\r\n\" />");
    }
    await r.write("<div style=\"display:inline-block;width:160px\">\r\n<span class=\"yellow b\" id=\"rec_confirm\" style=\"display:none\">每条");
    await r.write(r.text(r.get(s, "message_rec_cost")));
    await r.write("切糕，确认恢复？</span>\r\n<span class=\"yellow b\" id=\"del2_confirm\" style=\"display:none\">确认彻底删除？</span>\r\n</div>");
  } else {
    await r.write("<div style=\"display:inline-block;width:80px\"></div>\r\n<input type=\"button\" class=\"b_button bc_black\" value=\"查看已删邮件\" onclick=\"$('mode').value='showdel';postCmd('message_cmd', 'messages.php');this.disabled=true;\" />&nbsp;&nbsp;&nbsp;");
    if (r.truth((!r.truth((!r.truth(r.get(s, "messages"))))))) {
      await r.write("<input type=\"button\" class=\"b_button bc_black\" value=\"全选/反选\" onclick=\"jQuery('.message_sl').each(function(){this.click();});\" />\r\n<input type=\"button\" class=\"b_button bc_black\" value=\"查收附件\" onclick=\"$('mode').value='check';postCmd('message_cmd', 'messages.php');this.disabled=true;\" />\r\n<input type=\"button\" class=\"b_button bc_black\" style=\"width:114px\" value=\"删除\" onclick=\"\r\nvar delflag=0;\r\njQuery('.message_sl').each(function(){\r\nif(this.checked){delflag=1;return false;}\r\n});\r\nif(delflag){\r\nif($('mode').value!='del') {\r\n$('del_confirm').style.display='inline';\r\nthis.value='确认删除';\r\n$('mode').value='del';\r\n}else{\r\n$('del_confirm').style.display='none';\r\npostCmd('message_cmd', 'messages.php');this.disabled=true;\r\n$('mode').value='';\r\n}\r\n}\r\n\" />");
    }
    await r.write("<div style=\"display:inline-block;width:80px\"><span class=\"yellow b\" id=\"del_confirm\" style=\"display:none\">确认删除？</span></div>");
  }
  await r.write("</div><div class=\"gscroll\" style=\"max-width:1210px;max-height:640px;overflow-x:hidden;overflow-y:auto;vertical-align:top\">");
  if (r.truth((!r.truth(r.get(s, "messages"))))) {
    await r.write("<span class=\"grey b\">一条信息都没有呢</span>");
  } else {
    r.assign(r.slot(s, ["i"]), 0);
    if (r.truth((await r.call("is_array", r.get(s, "messages"))))) {
      {
        const a0 = r.copy(r.get(s, "messages"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["mi"]), k0);
          r.assign(r.slot(s, ["mv"]), v0);
          if (r.truth(r.equal(r.modulo(r.get(s, "i"), 4), 0))) {
            await r.write("<div class=\"message_line\">");
          }
          await r.write("<div class=\"message_ib\">\r\n<div class=\"message_box\" onclick=\"$('message_sl");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("').click();if($('message_sl");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("').checked) {$('sign");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("').style.display='block';} else {$('sign");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("').style.display='none';}\">\r\n<div class=\"message_title_bar\">\r\n<img id=\"sign");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("\" class=\"message_sign\" src=\"img/message_sl_sign.png\">\r\n<input type=\"checkbox\" name=\"sl");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("\" id=\"message_sl");
          await r.write(r.text(r.get(s, "mi")));
          await r.write("\" style=\"display:none\" class=\"message_sl\" value=\"1\" />\r\n<span class=\"message_title\">");
          await r.write(r.text(r.get(r.get(s, "mv"), "title")));
          await r.write("</span> <div class=\"message_hint\">");
          await r.write(r.text(r.get(r.get(s, "mv"), "hint")));
          await r.write("</div>\r\n</div><div class=\"message_cont\"><span>");
          await r.write(r.text(r.get(r.get(s, "mv"), "content")));
          await r.write("</span></div>\r\n<hr class=\"message_hr\">\r\n<div class=\"message_encl\">\r\n<div class=\"message_encl_hint\">");
          await r.write(r.text(r.get(r.get(s, "mv"), "encl_hint")));
          await r.write("</div><div style=\"text-align:center\">\r\n<span>");
          await r.write(r.text(r.get(r.get(s, "mv"), "encl_disp")));
          await r.write("</span>\r\n</div>\r\n</div>\r\n<hr class=\"message_hr\">\r\n<div class=\"grey b message_date\">");
          if (r.truth(((r.get(r.get(s, "mv"), "del_time_disp") != null)))) {
            await r.write("<span>删除时间: ");
            await r.write(r.text(r.get(r.get(s, "mv"), "del_time_disp")));
            await r.write("</span>");
          } else {
            await r.write("<span>");
            await r.write(r.text(r.get(r.get(s, "mv"), "time_disp")));
            await r.write("</span>");
          }
          await r.write("</div>\r\n</div>\r\n</div>");
          if (r.truth((r.truth(r.equal(r.modulo(r.get(s, "i"), 4), 3)) || r.truth(r.equal(r.get(s, "i"), r.subtract((await r.call("count", r.get(s, "messages"))), 1)))))) {
            await r.write("</div>");
          }
          r.post(r.slot(s, ["i"]), 1);
        }
      }
    }
  }
  await r.write("</div>\r\n</div>");
return 1;
}
