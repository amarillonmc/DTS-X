// Generated from templates/default/winnerlist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<br>\r\n\r\n<form method=\"post\" name=\"list\" onsubmit=\"winner.php\">\r\n<input type=\"hidden\" id=\"user_prefix\" name=\"user_prefix\" value=\"");
  await r.write(r.text(r.get(s, "user_prefix")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"list\">\r\n<input type=\"hidden\" id=\"start\" name=\"start\" value=\"");
  await r.write(r.text(r.get(s, "gamenum")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"gnum\" name=\"gnum\" value=\"\">\r\n<center>\r\n<p>\r\n<input type=\"button\" value=\"查看 / 搜索 标准区\" onclick=\"document.list.user_prefix.value='';document.list.command.value='list';document.list.start.value='0';document.list.submit();\">\r\n<input type=\"button\" value=\"查看 / 搜索 房间区\" onclick=\"document.list.user_prefix.value='s';document.list.command.value='list';document.list.start.value='0';document.list.submit();\">\r\n</p>\r\n<p>\r\n<input type=\"checkbox\" id=\"winner_show_gtype_0\" name=\"winner_show_gtype_0\" ");
  if (r.truth(r.get(s, "winner_show_gtype_0"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_0').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "0")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_6\" name=\"winner_show_gtype_6\" ");
  if (r.truth(r.get(s, "winner_show_gtype_6"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_6').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "6")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_4\" name=\"winner_show_gtype_4\" ");
  if (r.truth(r.get(s, "winner_show_gtype_4"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_4').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "4")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_1\" name=\"winner_show_gtype_1\" ");
  if (r.truth(r.get(s, "winner_show_gtype_1"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_1').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "1")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_7\" name=\"winner_show_gtype_7\" ");
  if (r.truth(r.get(s, "winner_show_gtype_1"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_7').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "7")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_10\" name=\"winner_show_gtype_10\" ");
  if (r.truth(r.get(s, "winner_show_gtype_10"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_10').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "10")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_14\" name=\"winner_show_gtype_14\" ");
  if (r.truth(r.get(s, "winner_show_gtype_14"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_14').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "14")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_15\" name=\"winner_show_gtype_15\" ");
  if (r.truth(r.get(s, "winner_show_gtype_15"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_15').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "15")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_16\" name=\"winner_show_gtype_16\" ");
  if (r.truth(r.get(s, "winner_show_gtype_16"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_16').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "16")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_18\" name=\"winner_show_gtype_18\" ");
  if (r.truth(r.get(s, "winner_show_gtype_18"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_18').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "18")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_19\" name=\"winner_show_gtype_19\" ");
  if (r.truth(r.get(s, "winner_show_gtype_19"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_19').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "19")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_13\" name=\"winner_show_gtype_13\" ");
  if (r.truth(r.get(s, "winner_show_gtype_13"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_13').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "13")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_gtype_22\" name=\"winner_show_gtype_22\" ");
  if (r.truth(r.get(s, "winner_show_gtype_22"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_gtype_22').click();\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "22")));
  await r.write("</a>&nbsp;&nbsp;\r\n</p>\r\n<p>\r\n<input type=\"checkbox\" id=\"winner_show_wmode_2\" name=\"winner_show_wmode_2\" ");
  if (r.truth(r.get(s, "winner_show_wmode_2"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_wmode_2').click();\">");
  await r.write(r.text(r.get(r.get(s, "gwin"), "2")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_wmode_3\" name=\"winner_show_wmode_3\" ");
  if (r.truth(r.get(s, "winner_show_wmode_3"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_wmode_3').click();\">");
  await r.write(r.text(r.get(r.get(s, "gwin"), "3")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_wmode_5\" name=\"winner_show_wmode_5\" ");
  if (r.truth(r.get(s, "winner_show_wmode_5"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_wmode_5').click();\">");
  await r.write(r.text(r.get(r.get(s, "gwin"), "5")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_wmode_7\" name=\"winner_show_wmode_7\" ");
  if (r.truth(r.get(s, "winner_show_wmode_7"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_wmode_7').click();\">");
  await r.write(r.text(r.get(r.get(s, "gwin"), "7")));
  await r.write("</a>&nbsp;&nbsp;\r\n<input type=\"checkbox\" id=\"winner_show_wmode_8\" name=\"winner_show_wmode_8\" ");
  if (r.truth(r.get(s, "winner_show_wmode_8"))) {
    await r.write("checked");
  }
  await r.write("><a onclick=\"$('winner_show_wmode_8').click();\">");
  await r.write(r.text(r.get(r.get(s, "gwin"), "8")));
  await r.write("</a>&nbsp;&nbsp;\r\n搜索玩家：<input id=\"winner_show_winner\" name=\"winner_show_winner\" style=\"width: 120px;\" type=\"text\" value=\"");
  await r.write(r.text(r.get(s, "winner_show_winner")));
  await r.write("\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"搜索\" onclick=\"document.list.command.value='list';document.list.submit();\">\r\n</p>\r\n<p>");
  if (r.truth((r.compare(r.get(s, "result_num"), r.get(s, "winlimit")) > 0))) {
    if (r.truth((!r.equal(r.get(s, "start"), r.get(s, "largest_mark"))))) {
      await r.write("<a onclick=\"document.list.start.value = '");
      await r.write(r.text(r.get(s, "largest_mark")));
      await r.write("';document.list.command.value='list';document.list.submit();\">第");
      await r.write(r.text(r.get(s, "largest_mark")));
      await r.write("回</a>&nbsp;&nbsp;...&nbsp;&nbsp;");
    }
    if (r.truth((r.truth(r.get(s, "larger_mark")) && r.truth((r.compare(r.get(s, "larger_mark"), r.get(s, "largest_mark")) < 0))))) {
      await r.write("<a onclick=\"document.list.start.value = '");
      await r.write(r.text(r.get(s, "larger_mark")));
      await r.write("';document.list.command.value='list';document.list.submit();\">第");
      await r.write(r.text(r.get(s, "larger_mark")));
      await r.write("回</a>&nbsp;&nbsp;");
    }
    await r.write("<span class=\"evergreen b\">第");
    await r.write(r.text(r.get(s, "start")));
    await r.write("回</span>&nbsp;&nbsp;");
    if (r.truth((r.truth(r.get(s, "smaller_mark")) && r.truth((r.compare(r.get(s, "smaller_mark"), r.get(s, "smallest_mark")) > 0))))) {
      await r.write("<a onclick=\"document.list.start.value = '");
      await r.write(r.text(r.get(s, "smaller_mark")));
      await r.write("';document.list.command.value='list';document.list.submit();\">第");
      await r.write(r.text(r.get(s, "smaller_mark")));
      await r.write("回</a>&nbsp;&nbsp;");
    }
    if (r.truth((!r.equal(r.get(s, "start"), r.get(s, "smallest_mark"))))) {
      await r.write("...&nbsp;&nbsp;<a onclick=\"document.list.start.value = '");
      await r.write(r.text(r.get(s, "smallest_mark")));
      await r.write("';document.list.command.value='list';document.list.submit();\">第");
      await r.write(r.text(r.get(s, "smallest_mark")));
      await r.write("回</a>");
    }
    await r.write("&nbsp;&nbsp;&nbsp;<input id=\"winnermark\" style=\"width: 60px;\" type=\"text\" value=\"");
    await r.write(r.text(r.get(s, "start")));
    await r.write("\">\r\n&nbsp;<input style=\"width: 80px\" type=\"button\" value=\"跳转\" onclick=\"document.list.start.value = $('winnermark').value;document.list.command.value='list';document.list.submit();\">");
  }
  await r.write("</p>\r\n<br>\r\n<TABLE border=\"1\" cellspacing=\"0\" cellpadding=\"3\">\r\n<TR height=\"20\">\r\n<TD class=\"b1\"><span>回</span></TD>\r\n<TD class=\"b1\"><span>游戏模式</span></TD>\r\n<TD class=\"b1\"><span>胜利方式</span></TD>\r\n<TD class=\"b1\"><span>游戏结束时间</span></TD>\r\n<TD class=\"b1\"><span>参与者数</span></TD>\r\n<TD class=\"b1\"><span>优胜者名</span></TD>\r\n<TD class=\"b1\"><span>卡片</span></TD>\r\n<TD class=\"b1\"><span>头像</span></TD>\r\n<TD class=\"b1\"><span>胜利者留言</span></TD>\r\n<TD class=\"b1\"><span>使用武器</span></TD>\r\n<TD class=\"b1\"><span>VAPM/APM</span></TD>\r\n<TD class=\"b1\"><span>最高伤害</span></TD>\r\n<TD class=\"b1\"><span>杀人最多</span></TD>\r\n<TD class=\"b1\" colspan=2><span>查看信息</span></TD>\r\n</TR>");
  if (r.truth((await r.call("is_array", r.get(s, "winfo"))))) {
    {
      const a0 = r.copy(r.get(s, "winfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["gid"]), k0);
        r.assign(r.slot(s, ["info"]), v0);
        await r.write("<TR height=\"40\">\r\n<TD class=\"b2\"><span>");
        await r.write(r.text(r.get(s, "gid")));
        await r.write("</span></TD>\r\n<TD class=\"b3\">\r\n<span>");
        if (r.truth((r.truth((r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "gameurl"), "dianbo")), false))) && r.truth((r.compare(r.get(s, "gid"), 41956) <= 0)))) && r.truth((r.compare(r.get(s, "gid"), 26398) >= 0)))) && r.truth((!r.truth(r.get(r.get(s, "info"), "gametype"))))))) {
          await r.write(r.text(r.get(r.get(s, "gtinfo"), "4")));
        } else {
          await r.write(r.text(r.get(r.get(s, "gtinfo"), r.get(r.get(s, "info"), "gametype"))));
        }
        await r.write("</span>\r\n</TD>\r\n<TD class=\"b3\"><span>");
        if (r.truth((r.truth((r.compare(r.get(r.get(s, "info"), "winnernum"), 1) > 0)) && r.truth(r.equal(r.get(r.get(s, "info"), "wmode"), 2))))) {
          await r.write("团队幸存");
        } else {
          await r.write(r.text(r.get(r.get(s, "gwin"), r.get(r.get(s, "info"), "wmode"))));
        }
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "info"), "date")));
        await r.write("</span><br><span>");
        await r.write(r.text(r.get(r.get(s, "info"), "time")));
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "info"), "vnum")));
        await r.write("</span></TD>");
        if (r.truth((r.compare(r.get(r.get(s, "info"), "winnernum"), 1) > 0))) {
          await r.write("<TD class=\"b3\" colspan><span class=\"yellow b\">");
          await r.write(r.text(r.get(r.get(s, "info"), "winnerteamID")));
          await r.write("</span></TD>\r\n<TD class=\"b3\"><span></span></TD>\r\n<TD class=\"b3\"><span><img src=\"img/n_0.gif\" style=\"width:70;height:40;\"></span></TD>");
        } else {
          r.assign(r.slot(s, ["info", "urlname"]), (await r.call("htmlentities", (await r.call("urlencode", r.get(r.get(s, "info"), "winner"))))));
          await r.write("<TD class=\"b3\" style=\"white-space: nowrap;\">");
          if (r.truth(r.get(r.get(s, "info"), "winner"))) {
            await r.write("<a style=\"cursor:pointer;\" href=\"user_profile.php?playerID=");
            await r.write(r.text(r.get(r.get(s, "info"), "urlname")));
            await r.write("\"><span class=\"evergreen b\">");
            await r.write(r.text(r.get(r.get(s, "info"), "winner")));
            await r.write("</span></a>");
          } else {
            await r.write("<span class=\"grey b\">无</span>");
          }
          await r.write("</TD>\r\n<TD class=\"b3\">");
          if (r.truth(r.get(r.get(s, "info"), "winner"))) {
            if (r.truth(((r.get(r.get(s, "info"), "card") != null)))) {
              await r.write("<span class=\"");
              await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "info"), "card")), "rare"))));
              await r.write("\">");
              await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "info"), "card")), "name")));
              await r.write("</span>");
            } else {
              await r.write("<span></span>");
              await r.write(r.text(r.get(r.get(s, "info"), "cardname")));
              await r.write("</span>");
            }
          } else {
            await r.write("<span class=\"grey b\">-</span>");
          }
          await r.write("</TD>\r\n<TD class=\"b3\"><span><img src=\"img/");
          await r.write(r.text(r.get(r.get(s, "info"), "iconImg")));
          await r.write("\" style=\"width:70;height:40;\"></span></TD>");
        }
        if (r.truth((r.compare(r.get(r.get(s, "info"), "winnernum"), 1) > 0))) {
          r.assign(r.slot(s, ["t"]), (await r.call("explode", ",", r.get(r.get(s, "info"), "winnerlist"))));
          r.assign(r.slot(s, ["x"]), "");
          if (r.truth((await r.call("is_array", r.get(s, "t"))))) {
            {
              const a1 = r.copy(r.get(s, "t"));
              for (const [k1, v1] of r.entries(a1)) {
                r.assign(r.slot(s, ["key"]), v1);
                if (r.truth((!r.equal(r.get(s, "key"), "")))) {
                  r.update(r.slot(s, ["x"]), "concat", (r.text((r.text((r.text((r.text("<a style=\"cursor:pointer;\" href=\"user_profile.php?playerID=") + r.text((await r.call("htmlentities", (await r.call("urlencode", r.get(s, "key")))))))) + r.text("\"><span>"))) + r.text(r.get(s, "key")))) + r.text("</span></a>,")));
                }
              }
            }
          }
          await r.write("<TD class=\"b3\" colspan=2>队伍成员: ");
          await r.write(r.text((await r.call("substr", r.get(s, "x"), 0, (-r.number(1))))));
          await r.write("</TD>");
        } else {
          await r.write("<TD class=\"b3\" style=\"max-width:250px;\">");
          if (r.truth(r.get(r.get(s, "info"), "motto"))) {
            await r.write("<span class=\"white b\">");
            await r.write(r.text(r.get(r.get(s, "info"), "motto")));
            await r.write("</span>");
          } else {
            await r.write("<span class=\"grey b\">无</span>");
          }
          await r.write("</TD>\r\n<TD class=\"b3\" style=\"max-width:250px;\">");
          if (r.truth(r.get(r.get(s, "info"), "wep"))) {
            await r.write("<span class=\"white b\">");
            await r.write(r.text(r.get(r.get(s, "info"), "wep")));
            await r.write("</span>");
          } else {
            await r.write("<span class=\"grey b\">无</span>");
          }
          await r.write("</TD>");
        }
        await r.write("<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "info"), "apm_words")));
        await r.write("</span></TD>");
        r.assign(r.slot(s, ["info", "urlhdp"]), (await r.call("htmlentities", (await r.call("urlencode", r.get(r.get(s, "info"), "hdp"))))));
        r.assign(r.slot(s, ["info", "urlhkp"]), (await r.call("htmlentities", (await r.call("urlencode", r.get(r.get(s, "info"), "hkp"))))));
        await r.write("<TD class=\"b3\">");
        if (r.truth(r.get(r.get(s, "info"), "hdmg"))) {
          await r.write("<a style=\"cursor:pointer;\" href=\"user_profile.php?playerID=");
          await r.write(r.text(r.get(r.get(s, "info"), "urlhdp")));
          await r.write("\"><span>");
          await r.write(r.text(r.get(r.get(s, "info"), "hdp")));
          await r.write("</span></a>");
        } else {
          await r.write("<span class=\"grey b\">无</span>");
        }
        await r.write("</TD>\r\n<TD class=\"b3\">");
        if (r.truth(r.get(r.get(s, "info"), "hkill"))) {
          await r.write("<a style=\"cursor:pointer;\" href=\"user_profile.php?playerID=");
          await r.write(r.text(r.get(r.get(s, "info"), "urlhkp")));
          await r.write("\"><span>");
          await r.write(r.text(r.get(r.get(s, "info"), "hkp")));
          await r.write("</span></a>");
        } else {
          await r.write("<span class=\"grey b\">无</span>");
        }
        await r.write("</TD>");
        if (r.truth((await r.call("defined", "MOD_REPLAY")))) {
          await r.write("<TD class=\"b3\">\r\n<span>\r\n<input type=\"button\" style=\"width:80px;height:40px;-webkit-appearance:default-button;\" value=\"录像回放\" ");
          if (r.truth((r.truth(r.get(r.get(s, "info"), "wmode")) && r.truth((!r.equal(r.get(r.get(s, "info"), "wmode"), 4)))))) {
            await r.write("onclick=\"document.list.start.value = '");
            await r.write(r.text(r.get(s, "start")));
            await r.write("'; document.list.command.value='replay';document.list.gnum.value='");
            await r.write(r.text(r.get(s, "gid")));
            await r.write("';document.list.submit();$('loading').style.display = 'block';\"");
          } else {
            await r.write("disabled");
          }
          await r.write(">\r\n</span>\r\n</TD>");
        } else {
          await r.write("<td></td>");
        }
        await r.write("<TD class=\"b3\" width=60px>\r\n<span>\r\n<input type=\"button\" style=\"width:80px;height:20px;\" value=\"角色信息\" ");
        if (r.truth((r.truth((r.truth((r.truth((r.truth(r.get(r.get(s, "info"), "wmode")) && r.truth((!r.equal(r.get(r.get(s, "info"), "wmode"), 1))))) && r.truth((!r.equal(r.get(r.get(s, "info"), "wmode"), 4))))) && r.truth((!r.equal(r.get(r.get(s, "info"), "wmode"), 6))))) && r.truth((r.compare(r.get(r.get(s, "info"), "winnernum"), 1) <= 0))))) {
          await r.write("onclick=\"document.list.command.value='info';document.list.gnum.value='");
          await r.write(r.text(r.get(s, "gid")));
          await r.write("';document.list.submit();$('loading').style.display = 'block';\"");
        } else {
          await r.write("disabled");
        }
        await r.write(">\r\n<input type=\"button\" style=\"width:80px;height:20px;\" value=\"该局状况\" ");
        if (r.truth((r.truth(r.get(r.get(s, "info"), "wmode")) && r.truth((!r.equal(r.get(r.get(s, "info"), "wmode"), 4)))))) {
          await r.write("onclick=\"document.list.command.value='news';document.list.gnum.value='");
          await r.write(r.text(r.get(s, "gid")));
          await r.write("';document.list.submit();$('loading').style.display = 'block';\"");
        } else {
          await r.write("disabled");
        }
        await r.write(">\r\n</span>\r\n</TD>\r\n</TR>");
      }
    }
  }
  await r.write("</TABLE>\r\n</center>\r\n</form>\r\n<br>\r\n</form>");
  if (r.truth((r.truth(r.equal(r.get(s, "command"), "replay")) && r.truth((await r.call("defined", "MOD_REPLAY")))))) {
    (await r.module("replay", "get_replay_by_gnum", r.get(s, "gnum"), r.get(s, "rep_winmode")));
  }
return 1;
}
