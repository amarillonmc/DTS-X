// Generated from templates/default/admin_urlist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth(r.equal(r.get(s, "urcmd"), "list"))) {
    await r.write("<form method=\"post\" name=\"urpage\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"urlist\">\r\n<input type=\"hidden\" id=\"urcmd\" name=\"urcmd\" value=\"list\">");
    if (r.truth(r.equal(r.get(s, "pagecmd"), "check"))) {
      await r.write("<input type=\"hidden\" name=\"pagecmd\" value=\"check\">\r\n<input type=\"hidden\" name=\"urorder\" value=\"");
      await r.write(r.text(r.get(s, "urorder")));
      await r.write("\">\r\n<input type=\"hidden\" name=\"urorder2\" value=\"");
      await r.write(r.text(r.get(s, "urorder2")));
      await r.write("\">");
    } else {
      if (r.truth(r.equal(r.get(s, "pagecmd"), "find"))) {
        await r.write("<input type=\"hidden\" name=\"pagecmd\" value=\"find\">\r\n<input type=\"hidden\" name=\"checkinfo\" value=\"");
        await r.write(r.text(r.get(s, "checkinfo")));
        await r.write("\">\r\n<input type=\"hidden\" name=\"checkmode\" value=\"");
        await r.write(r.text(r.get(s, "checkmode")));
        await r.write("\">");
      }
    }
    await r.write("<input type=\"hidden\" name=\"start\" value=\"");
    await r.write(r.text(r.get(s, "start")));
    await r.write("\">\r\n<input type=\"hidden\" id=\"pagemode\" name=\"pagemode\" value=\"\">\r\n<input type=\"submit\" value=\"上一页\" onclick=\"$('pagemode').value='up';\">\r\n<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "resultinfo")));
    await r.write("</span>\r\n<input type=\"submit\" value=\"下一页\" onclick=\"$('pagemode').value='down';\">");
    if (r.truth(r.get(s, "urdata"))) {
      await r.write("<table class=\"admin\">\r\n<tr>\r\n<th>选</th>\r\n<th>账号</th>\r\n<th>密码</th>\r\n<th>权限</th>\r\n<th>最近登陆</th>\r\n<th>最近游戏</th>\r\n<th>ip</th>\r\n<th>分数</th>\r\n<th>性别</th>\r\n<th>头像</th>\r\n<th>切糕</th>\r\n<th>口头禅</th>\r\n<th>杀人留言</th>\r\n<th>遗言</th>\r\n<th>卡片</th>\r\n<th>成就</th>\r\n<th>操作</th>\r\n</tr>");
      if (r.truth(r.get(s, "urdata"))) {
        if (r.truth((await r.call("is_array", r.get(s, "urdata"))))) {
          {
            const a0 = r.copy(r.get(s, "urdata"));
            for (const [k0, v0] of r.entries(a0)) {
            r.assign(r.slot(s, ["n"]), k0);
              r.assign(r.slot(s, ["ur"]), v0);
              await r.write("<tr>");
              if (r.truth((r.truth((r.compare(r.get(r.get(s, "ur"), "groupid"), r.get(s, "mygroup")) >= 0)) && r.truth((!r.equal(r.get(r.get(s, "ur"), "username"), r.get(s, "cuser"))))))) {
                await r.write("<td><input type=\"checkbox\" id=\"user_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" name=\"user_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "uid")));
                await r.write("\" disabled=\"true\"></td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "ur"), "username")));
                await r.write("</td>\r\n<td><input type=\"text\" name=\"pass_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"20\" value=\"无法修改\" disabled=\"true\"></td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "urgroup"), r.get(r.get(s, "ur"), "groupid"))));
                await r.write("</td>\r\n<td>");
                await r.write(r.text((r.truth((!r.truth((!r.truth(r.get(r.get(s, "ur"), "lastvisit")))))) ? (await r.call("date", "Y-m-d H:i:s", r.get(r.get(s, "ur"), "lastvisit"))) : "未登录")));
                await r.write("</td>\r\n<td>");
                if (r.truth(r.equal("s", (await r.call("substr", r.get(r.get(s, "ur"), "lastgame"), 0, 1))))) {
                  await r.write("房间第");
                  await r.write(r.text((await r.call("substr", r.get(r.get(s, "ur"), "lastgame"), 1))));
                  await r.write("局");
                } else {
                  await r.write("第");
                  await r.write(r.text(r.get(r.get(s, "ur"), "lastgame")));
                  await r.write("局");
                }
                await r.write("</td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "ur"), "ip")));
                await r.write("</td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "ur"), "credits")));
                await r.write("</td>\r\n<td>\r\n<select name=\"gender_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" disabled=\"true\">\r\n<option value=\"0\" ");
                if (r.truth(r.equal(r.get(r.get(s, "ur"), "gender"), 0))) {
                  await r.write("selected");
                }
                await r.write(">");
                await r.write(r.text(r.get(r.get(s, "ursex"), "0")));
                await r.write("<option value=\"m\" ");
                if (r.truth(r.equal(r.get(r.get(s, "ur"), "gender"), "m"))) {
                  await r.write("selected");
                }
                await r.write(">");
                await r.write(r.text(r.get(r.get(s, "ursex"), "m")));
                await r.write("<option value=\"f\" ");
                if (r.truth(r.equal(r.get(r.get(s, "ur"), "gender"), "f"))) {
                  await r.write("selected");
                }
                await r.write(">");
                await r.write(r.text(r.get(r.get(s, "ursex"), "f")));
                await r.write("</select>\r\n</td>\r\n<td><input type=\"text\" name=\"icon_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"2\" maxlength=\"2\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "icon")));
                await r.write("\" disabled=\"true\"></td>\r\n<td><input type=\"text\" name=\"gold_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"5\" maxlength=\"20\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "gold")));
                await r.write("\" disabled=\"true\"></td>\r\n<td><input type=\"text\" name=\"motto_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"20\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "motto")));
                await r.write("\" disabled=\"true\"></td>\r\n<td><input type=\"text\" name=\"killmsg_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"20\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "killmsg")));
                await r.write("\" disabled=\"true\"></td>\r\n<td><input type=\"text\" name=\"lastword_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"20\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "lastword")));
                await r.write("\" disabled=\"true\"></td>\r\n<td>\r\n<input type=\"submit\" value=\"不可修改\" disabled=\"true\">\r\n</td>\r\n<td>\r\n<input type=\"submit\" value=\"不可修改\" disabled=\"true\">\r\n</td>\r\n<td>\r\n<input type=\"submit\" value=\"修改\" disabled=\"true\">\r\n</td>");
              } else {
                await r.write("<td><input type=\"checkbox\" id=\"user_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\"  name=\"user_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "uid")));
                await r.write("\"></td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "ur"), "username")));
                await r.write("</td>\r\n<td><input type=\"text\" name=\"pass_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"20\" value=\"\"></td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "urgroup"), r.get(r.get(s, "ur"), "groupid"))));
                await r.write("</td>\r\n<td>");
                await r.write(r.text((r.truth((!r.truth((!r.truth(r.get(r.get(s, "ur"), "lastvisit")))))) ? (await r.call("date", "Y-m-d H:i:s", r.get(r.get(s, "ur"), "lastvisit"))) : "未登录")));
                await r.write("</td>\r\n<td>");
                if (r.truth(r.equal("s", (await r.call("substr", r.get(r.get(s, "ur"), "lastgame"), 0, 1))))) {
                  await r.write("房间第");
                  await r.write(r.text((await r.call("substr", r.get(r.get(s, "ur"), "lastgame"), 1))));
                  await r.write("局");
                } else {
                  await r.write("第");
                  await r.write(r.text(r.get(r.get(s, "ur"), "lastgame")));
                  await r.write("局");
                }
                await r.write("</td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "ur"), "ip")));
                await r.write("</td>\r\n<td>");
                await r.write(r.text(r.get(r.get(s, "ur"), "credits")));
                await r.write("</td>\r\n<td>\r\n<select name=\"gender_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\">\r\n<option value=\"0\" ");
                if (r.truth(r.equal(r.get(r.get(s, "ur"), "gender"), 0))) {
                  await r.write("selected");
                }
                await r.write(">");
                await r.write(r.text(r.get(r.get(s, "ursex"), "0")));
                await r.write("<option value=\"m\" ");
                if (r.truth(r.equal(r.get(r.get(s, "ur"), "gender"), "m"))) {
                  await r.write("selected");
                }
                await r.write(">");
                await r.write(r.text(r.get(r.get(s, "ursex"), "m")));
                await r.write("<option value=\"f\" ");
                if (r.truth(r.equal(r.get(r.get(s, "ur"), "gender"), "f"))) {
                  await r.write("selected");
                }
                await r.write(">");
                await r.write(r.text(r.get(r.get(s, "ursex"), "f")));
                await r.write("</select>\r\n</td>\r\n<td><input type=\"text\" name=\"icon_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"2\" maxlength=\"2\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "icon")));
                await r.write("\"></td>\r\n<td><input type=\"text\" name=\"gold_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"5\" maxlength=\"20\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "gold")));
                await r.write("\"></td>\r\n<td><input type=\"text\" name=\"motto_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"60\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "motto")));
                await r.write("\"></td>\r\n<td><input type=\"text\" name=\"killmsg_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"60\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "killmsg")));
                await r.write("\"></td>\r\n<td><input type=\"text\" name=\"lastword_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" size=\"8\" maxlength=\"60\" value=\"");
                await r.write(r.text(r.get(r.get(s, "ur"), "lastword")));
                await r.write("\"></td>\r\n<td>\r\n<input type=\"button\" id=\"card_data");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" value=\"展开列表\" onclick=\"this.style.display='none';$('card_data_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("').style.display='block'\">\r\n<textarea cols=\"20\" rows=\"5\" style=\"overflow:auto;display:none;\" id=\"card_data_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" name=\"card_data_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\">");
                await r.write(r.text(r.get(r.get(s, "ur"), "card_data")));
                await r.write("</textarea>\r\n</td>\r\n<td>\r\n<input type=\"button\" id=\"achlist");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" value=\"展开列表\" onclick=\"this.style.display='none';$('a_achievements_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("').style.display='block'\">\r\n<textarea cols=\"20\" rows=\"5\" style=\"overflow:auto;display:none;\" id=\"a_achievements_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\" name=\"a_achievements_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("\">");
                await r.write(r.text(r.get(r.get(s, "ur"), "a_achievements")));
                await r.write("</textarea>\r\n</td>\r\n<td>\r\n<input type=\"submit\" value=\"修改\" onclick=\"$('urcmd').value='edit_");
                await r.write(r.text(r.get(s, "n")));
                await r.write("_");
                await r.write(r.text(r.get(r.get(s, "ur"), "uid")));
                await r.write("'\">\r\n</td>");
              }
              await r.write("</tr>");
            }
          }
        }
        await r.write("<tr>\r\n<td colspan=2><input type=\"checkbox\" name=\"user_all\" onchange=\"for(i=0; i<=");
        await r.write(r.text(r.get(s, "n")));
        await r.write(";i++){if(! $('user_'+i).disabled){if(this.checked==true){$('user_'+i).checked=true}else{$('user_'+i).checked=false}}}\">全选</td>\r\n<td colspan=15 style=\"text-align:center;\">\r\n<input type=\"submit\" name=\"submit\" value=\"封停选中玩家\" onclick=\"$('urcmd').value='ban'\">\r\n<input type=\"submit\" name=\"submit\" value=\"解封选中玩家\" onclick=\"$('urcmd').value='unban'\">\r\n<input type=\"submit\" name=\"submit\" value=\"删除选中玩家\" onclick=\"$('urcmd').value='del'\">\r\n</td>\r\n</tr>\r\n<tr>\r\n<td colspan=2></td>\r\n<td colspan=15 style=\"text-align:center;\">\r\n<br>\r\n标题：\r\n<input type=\"text\" name=\"stitle\" size=\"6\" maxlength=\"20\" value=\"发放奖励\">&nbsp;&nbsp;&nbsp;\r\n正文：\r\n<input type=\"text\" name=\"scontent\" size=\"20\" maxlength=\"30\" value=\"您获得了奖励，请查收！\">&nbsp;&nbsp;&nbsp;\r\n附件：\r\n<input type=\"text\" id=\"senclosure\" name=\"senclosure\" size=\"30\" maxlength=\"200\" value=\"getqiegao_0;getcard_0;getcardblink_0;getlogitem_0;getlogitemnum_0;\">&nbsp;&nbsp;&nbsp;\r\n<input type=\"submit\" name=\"submit\" value=\"发送站内邮件\" onclick=\"$('urcmd').value='sendmessage'\">\r\n<br>\r\n给附件添加卡片：");
        r.assign(r.slot(s, ["cards"]), (await r.call("get_var_in_module", "cards", "cardbase")));
        r.assign(r.slot(s, ["cis"]), (await r.call("get_var_in_module", "cardindex_bugprize", "cardbase")));
        if (r.truth((await r.call("is_array", r.get(s, "cis"))))) {
          {
            const a1 = r.copy(r.get(s, "cis"));
            for (const [k1, v1] of r.entries(a1)) {
              r.assign(r.slot(s, ["i"]), v1);
              await r.write("<a style=\"color: #000;\" onclick=\"$('senclosure').value=$('senclosure').value.replace(/getcard_\\d+?;/s, 'getcard_");
              await r.write(r.text(r.get(s, "i")));
              await r.write(";')\">");
              await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "i")), "name")));
              await r.write("</a>&nbsp;&nbsp;");
            }
          }
        }
        await r.write("<br>\r\n<br>\r\n</td>\r\n</tr>");
      }
      await r.write("</table>");
    }
    await r.write("</form>\r\n<form method=\"post\" name=\"backtolist\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"urlist\">\r\n<input type=\"hidden\" name=\"command\" value=\"\">\r\n<input type=\"submit\" name=\"submit\" value=\"返回玩家帐户管理\">\r\n</form>");
  } else {
    await r.write("<form method=\"post\" name=\"urlist\" onsubmit=\"admin.php\" enctype=\"multipart/form-data\">\r\n<input type=\"hidden\" name=\"mode\" value=\"urlist\">\r\n<input type=\"hidden\" name=\"pagecmd\" id=\"pagecmd\" value=\"\">\r\n<input type=\"hidden\" name=\"urcmd\" value=\"list\">\r\n<table class=\"admin\">\r\n<tr>\r\n<th>搜索指定帐户</th>\r\n<th>查看帐户列表</th>\r\n</tr>\r\n<tr>\r\n<td>\r\n条件：\r\n<select name=\"checkmode\">\r\n<option value=\"username\" selected>用户名\r\n<option value=\"ip\">用户IP\r\n</select>\r\n类似\r\n<input size=\"30\" type=\"text\" name=\"checkinfo\" id=\"checkinfo\" maxlength=\"30\" />\r\n</td>\r\n<td>\r\n按：\r\n<select name=\"urorder\">\r\n<option value=\"groupid\" selected>用户所属组\r\n<option value=\"lastgame\">最新游戏\r\n<option value=\"uid\">用户编号\r\n</select>\r\n<select name=\"urorder2\">\r\n<option value=\"DESC\" selected>降序排列\r\n<option value=\"ASC\">升序排列\r\n</select>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td style=\"text-align:center;\"><input style=\"width:100px;height:30px;\" type=\"submit\" value=\"搜索\" onclick=\"$('pagecmd').value='find';\"></td>\r\n<td style=\"text-align:center;\"><input style=\"width:100px;height:30px;\" type=\"submit\" value=\"查看\" onclick=\"$('pagecmd').value='check';\"></td>\r\n</tr>\r\n<tr>\r\n<td style=\"text-align:center;\">\r\n<select name=\"recover_file\">\r\n<option value=\"null\">请选择</option>");
    if (r.truth((await r.call("is_array", r.get(s, "user_backup_list"))))) {
      {
        const a2 = r.copy(r.get(s, "user_backup_list"));
        for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["ubi"]), k2);
          r.assign(r.slot(s, ["ubv"]), v2);
          await r.write("<option value=\"");
          await r.write(r.text(r.get(s, "ubv")));
          await r.write("\">");
          await r.write(r.text((r.truth((r.compare((await r.call("strlen", r.get(s, "ubv"))), 12) > 0)) ? (r.text((await r.call("substr", r.get(s, "ubv"), 0, 12))) + r.text("..")) : r.get(s, "ubv"))));
          await r.write(" ");
          await r.write(r.text(r.get(r.get(s, "user_backup_date_list"), r.get(s, "ubi"))));
          await r.write("</option>");
        }
      }
    }
    await r.write("</select>\r\n<input style=\"width:130px;height:30px;\" type=\"submit\" value=\"恢复用户数据\" onclick=\"$('pagecmd').value='recover';\">\r\n</td>\r\n\r\n<td style=\"text-align:center;\"><input style=\"width:150px;height:30px;\" type=\"submit\" value=\"下载用户数据备份\" onclick=\"$('pagecmd').value='download';\"></td>\r\n</tr>\r\n</table>\r\n\r\n</form>");
  }
return 1;
}
