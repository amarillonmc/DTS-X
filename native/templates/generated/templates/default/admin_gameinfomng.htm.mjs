// Generated from templates/default/admin_gameinfomng.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"gameinfomng\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"gameinfomng\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n\r\n<table class=\"admin\">\r\n<tr>\r\n<th>游戏变量</th>\r\n<th>当前数据</th>\r\n<th>操作</th>\r\n</tr>\r\n\r\n<tr>\r\n<td>游戏局数</td>\r\n<td>");
  await r.write(r.text(r.get(s, "gamenum")));
  await r.write("</td>\r\n<td></td>\r\n</tr>\r\n<tr>\r\n<td>游戏状态</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "gstate"), r.get(s, "gamestate"))));
  await r.write("</td>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "gamestate"), 0))) {
    await r.write("<input type=\"submit\" value=\"准备开始\" onclick=\"$('command').value='gsedit_10'\"><br>\r\n<input type=\"submit\" value=\"开始游戏\" onclick=\"$('command').value='gsedit_20'\"><br>");
  } else {
    if (r.truth((r.compare(r.get(s, "gamestate"), 10) <= 0))) {
      await r.write("<input type=\"submit\" value=\"开始游戏\" onclick=\"$('command').value='gsedit_20'\"><br>\r\n<input type=\"submit\" value=\"结束游戏\" onclick=\"$('command').value='gsedit_0'\">");
    } else {
      if (r.truth(r.equal(r.get(s, "gamestate"), 20))) {
        await r.write("<input type=\"submit\" value=\"停止激活\" onclick=\"$('command').value='gsedit_30'\"><br>\r\n<input type=\"submit\" value=\"进入连斗\" onclick=\"$('command').value='gsedit_40'\"><br>\r\n<input type=\"submit\" value=\"进入死斗\" onclick=\"$('command').value='gsedit_50'\"><br>\r\n<input type=\"submit\" value=\"结束游戏\" onclick=\"$('command').value='gsedit_0'\">");
      } else {
        if (r.truth(r.equal(r.get(s, "gamestate"), 30))) {
          await r.write("<input type=\"submit\" value=\"进入连斗\" onclick=\"$('command').value='gsedit_40'\"><br>\r\n<input type=\"submit\" value=\"进入死斗\" onclick=\"$('command').value='gsedit_50'\"><br>\r\n<input type=\"submit\" value=\"结束游戏\" onclick=\"$('command').value='gsedit_0'\">");
        } else {
          if (r.truth(r.equal(r.get(s, "gamestate"), 40))) {
            await r.write("<input type=\"submit\" value=\"进入死斗\" onclick=\"$('command').value='gsedit_50'\"><br>\r\n<input type=\"submit\" value=\"结束游戏\" onclick=\"$('command').value='gsedit_0'\">");
          } else {
            if (r.truth(r.equal(r.get(s, "gamestate"), 50))) {
              await r.write("<input type=\"submit\" value=\"结束游戏\" onclick=\"$('command').value='gsedit_0'\">");
            }
          }
        }
      }
    }
  }
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  if (r.truth(r.get(s, "gamestate"))) {
    await r.write("当前游戏开始时间");
  } else {
    await r.write("下局游戏开始时间");
  }
  await r.write("</td>\r\n<td>\t\t\t\t\r\n<input type=\"text\" name=\"setyear\" size=\"4\" value=\"");
  await r.write(r.text(r.get(s, "styear")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "year")));
  await r.write("<input type=\"text\" name=\"setmonth\" size=\"2\" value=\"");
  await r.write(r.text(r.get(s, "stmonth")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "month")));
  await r.write("<input type=\"text\" name=\"setday\" size=\"2\" value=\"");
  await r.write(r.text(r.get(s, "stday")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "day")));
  await r.write("<input type=\"text\" name=\"sethour\" size=\"2\" value=\"");
  await r.write(r.text(r.get(s, "sthour")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "hour")));
  await r.write("<input type=\"text\" name=\"setmin\" size=\"2\" value=\"");
  await r.write(r.text(r.get(s, "stmin")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "min")));
  await r.write("</td>\r\n<td>");
  if (r.truth(r.get(s, "gamestate"))) {
    await r.write("<input type=\"submit\" value=\"无法设定\" disabled>");
  } else {
    await r.write("<input type=\"submit\" value=\"设定时间\" onclick=\"$('command').value='sttimeedit'\">");
  }
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>当前天气</td>\r\n<td>\r\n<select name=\"iweather\">");
  if (r.truth((await r.call("is_array", r.get(s, "wthinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "wthinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["n"]), k0);
        r.assign(r.slot(s, ["wth"]), v0);
        await r.write("<option value=\"");
        await r.write(r.text(r.get(s, "n")));
        await r.write("\" ");
        if (r.truth(r.equal(r.get(s, "weather"), r.get(s, "n")))) {
          await r.write("selected");
        }
        await r.write(">");
        await r.write(r.text(r.get(s, "wth")));
      }
    }
  }
  await r.write("</select>\r\n</td>\r\n<td><input type=\"submit\" value=\"更改天气\" onclick=\"$('command').value='wthedit'\"></td>\r\n</tr>\r\n<tr>\r\n<td>禁区列表</td>\r\n<td>");
  await r.write(r.text(r.get(s, "arealiststr")));
  await r.write("</td>\r\n<td></td>\r\n</tr>\r\n<tr>\r\n<td>下次禁区列表</td>\r\n<td>");
  await r.write(r.text(r.get(s, "nextarealiststr")));
  await r.write("</td>\r\n<td></td>\r\n</tr>\r\n<tr>\r\n<td>已有禁区数目</td>\r\n<td>");
  await r.write(r.text(r.get(s, "areanum")));
  await r.write("</td>\r\n<td></td>\r\n</tr>\r\n<tr>\r\n<td>下次禁区时间</td>\r\n<td>\r\n<input type=\"text\" name=\"areayear\" size=\"4\" disabled value=\"");
  await r.write(r.text(r.get(s, "aryear")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "year")));
  await r.write("<input type=\"text\" name=\"areamonth\" size=\"2\" disabled value=\"");
  await r.write(r.text(r.get(s, "armonth")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "month")));
  await r.write("<input type=\"text\" name=\"areaday\" size=\"2\" disabled value=\"");
  await r.write(r.text(r.get(s, "arday")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "day")));
  await r.write("<input type=\"text\" name=\"areahour\" size=\"2\" disabled value=\"");
  await r.write(r.text(r.get(s, "arhour")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "hour")));
  await r.write("<input type=\"text\" name=\"areamin\" size=\"2\" disabled value=\"");
  await r.write(r.text(r.get(s, "armin")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "min")));
  await r.write("</td>\r\n<td>\r\n<input type=\"submit\" value=\"立刻禁区\" onclick=\"$('command').value='areaadd'\"><br>\r\n<input type=\"submit\" value=\"60秒后禁\" onclick=\"$('command').value='areawarn'\">\r\n</td>\r\n</tr>\r\n<tr>\r\n<td>下局游戏类型</td>\r\n<td>\r\n<select name=\"sgtype\">");
  if (r.truth((await r.call("is_array", r.get(s, "sgtypelist"))))) {
    {
      const a1 = r.copy(r.get(s, "sgtypelist"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["n"]), v1);
        await r.write("<option value=\"");
        await r.write(r.text(r.get(s, "n")));
        await r.write("\" ");
        if (r.truth(r.equal(r.get(s, "gametype"), r.get(s, "n")))) {
          await r.write("selected");
        }
        await r.write(">");
        await r.write(r.text(r.get(r.get(s, "gtinfo"), r.get(s, "n"))));
      }
    }
  }
  await r.write("</select>\r\n</td>\r\n<td><input type=\"submit\" value=\"修改类型\" onclick=\"$('command').value='gametypeset'\"></td>\r\n</tr>\r\n<tr>\r\n<td>禁区解除</td>\r\n<td>\r\n<input type=\"radio\" name=\"ihack\" value=\"1\" ");
  if (r.truth(r.get(s, "hack"))) {
    await r.write("checked");
  }
  await r.write(">是&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"ihack\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "hack"))))) {
    await r.write("checked");
  }
  await r.write(">否\r\n</td>\r\n<td><input type=\"submit\" value=\"更改状态\" onclick=\"$('command').value='hackedit'\"></td>\r\n</tr>\r\n</table>\r\n</form> ");
return 1;
}
