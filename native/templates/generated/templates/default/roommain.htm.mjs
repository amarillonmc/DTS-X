// Generated from templates/default/roommain.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.equal(r.get(r.get(s, "roomdata"), "readystat"), 2)))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=40px colspan=2>\r\n<span style=\"font-size:30px; line-height:40px;\">房间");
    await r.write(r.text(r.get(s, "room_id")));
    await r.write("&nbsp;-&nbsp; ");
    await r.write(r.text((await r.call("room_get_vars", r.get(s, "roomdata"), "name"))));
    await r.write("</span>");
    if (r.truth(r.equal(r.get(s, "upos"), 0))) {
      await r.write("<div style=\"position:absolute; top:14px; right: 120px;\">\r\n<div class=\"glow_buttons\" onclick=\"bubblebox_show('persistent-rmeditbox');\">修改模式</div>\r\n</div>");
    }
    await r.write("<div style=\"position:absolute; top:14px; right: 16px;\">\r\n<div class=\"glow_buttons red\" onclick=\"$('command').value='leave';postCmd('roomcmd','roomcmd.php');\">离开房间</div>\r\n</div>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=8px colspan=2>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td width=515px>");
    (await r.include(r.template("roomteam"), s));
    await r.write("</td>\r\n<td class=\"b3\" width=85px>");
    if (r.truth((await r.call("room_get_vars", r.get(s, "roomdata"), "without-ready")))) {
      if (r.truth(r.equal(r.get(s, "upos"), 0))) {
        await r.write("<div class=\"glow_buttons h50 yellow\" onclick=\"$('command').value='start';postCmd('roomcmd','roomcmd.php');\">开始</div>");
      } else {
        await r.write("<div class=\"glow_buttons h50 grey forbidden\">开始</div>");
      }
    } else {
      if (r.truth((r.truth((r.truth(r.equal(r.get(r.get(s, "roomdata"), "readystat"), 1)) && r.truth((r.compare(r.get(s, "upos"), 0) >= 0)))) && r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "upos")), "ready"))))))) {
        await r.write("<div class=\"glow_buttons h50 yellow\" onclick=\"$('command').value='ready';postCmd('roomcmd','roomcmd.php');\">准备</div>");
      } else {
        if (r.truth((r.truth((r.truth(r.equal(r.get(r.get(s, "roomdata"), "readystat"), 1)) && r.truth((r.compare(r.get(s, "upos"), 0) >= 0)))) && r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "upos")), "ready"))))) {
          await r.write("<div class=\"glow_buttons h50 lime forbidden\">准备</div>");
        } else {
          await r.write("<div class=\"glow_buttons h50 grey forbidden\">准备</div>");
        }
      }
    }
    await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=7px colspan=2>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=20px colspan=2>");
    if (r.truth((r.truth((r.compare((await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")), 2) > 0)) && r.truth((r.truth((await r.call("room_creater_check", r.get(s, "upos")))) || r.truth(r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "upos")))))))))) {
      await r.write("<div class=\"glow_buttons\" style=\"float:left;left:25px;width:90px;\" onclick=\"$('command').value='pos_disable';$('para1').value='all';postCmd('roomcmd','roomcmd.php');\">");
      if (r.truth((await r.call("room_creater_check", r.get(s, "upos"))))) {
        await r.write("禁用所有空位");
      } else {
        await r.write("禁用本队空位");
      }
      await r.write("</div>");
    }
    await r.write("<span style=\"20px\" id=\"room_banner\">");
    if (r.truth((!r.equal(r.get(r.get(s, "roomdata"), "readystat"), 1)))) {
      if (r.truth(r.equal(r.get(s, "upos"), (-r.number(1))))) {
        await r.write("<span class=\"yellow b\">请点击一个空位置以进入。</span>");
      } else {
        await r.write("请等待人满后点击“准备”按钮。点击空位置可以移动到那里。");
      }
    } else {
      r.assign(r.slot(s, ["kicktimeleft"]), r.add(r.subtract(r.get(r.get(s, "roomdata"), "kicktime"), (await r.call("time"))), 1));
      if (r.truth((r.compare(r.get(s, "upos"), 0) >= 0))) {
        if (r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "upos")), "ready"))))) {
          await r.write("<span class=\"yellow b\">请点击“准备”按钮，<span id=\"roomkick_timer\">");
          await r.write(r.text(r.get(s, "kicktimeleft")));
          await r.write("</span>秒后没有准备的玩家将被自动踢出房间。</span>");
        } else {
          await r.write("请等待其他人准备，<span id=\"roomkick_timer\">");
          await r.write(r.text(r.get(s, "kicktimeleft")));
          await r.write("</span>秒后没有准备的玩家将被自动踢出房间。");
        }
      } else {
        await r.write("<span id=\"roomkick_timer\">");
        await r.write(r.text(r.get(s, "kicktimeleft")));
        await r.write("</span>秒后没有准备的玩家将被自动踢出房间。");
      }
    }
    await r.write("</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td height=15px colspan=2>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" colspan=\"2\">");
    if (r.truth((!r.identical(null, (await r.call("room_get_vars", r.get(s, "roomdata"), "game-option")))))) {
      r.assign(r.slot(s, ["game_option"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "game-option")));
      if (r.truth((await r.call("is_array", r.get(s, "game_option"))))) {
        {
          const a0 = r.copy(r.get(s, "game_option"));
          for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["gokey"]), k0);
            r.assign(r.slot(s, ["goval"]), v0);
            await r.write("<div>\r\n<span class=\"white b\">");
            await r.write(r.text(r.get(r.get(s, "goval"), "title")));
            await r.write("</span> ");
            if (r.truth(r.equal(r.get(r.get(s, "goval"), "type"), "number"))) {
              r.assign(r.slot(s, ["current_go"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "current_game_option")));
              r.assign(r.slot(s, ["nval"]), r.int(r.get(r.get(s, "current_go"), r.get(s, "gokey"))));
              await r.write("<input type=\"number\" name=\"");
              await r.write(r.text(r.get(s, "gokey")));
              await r.write("\" id=\"");
              await r.write(r.text(r.get(s, "gokey")));
              await r.write("\" value=\"");
              await r.write(r.text(r.get(s, "nval")));
              await r.write("\" min=\"");
              await r.write(r.text(r.get(r.get(s, "goval"), "min")));
              await r.write("\" max=\"");
              await r.write(r.text(r.get(r.get(s, "goval"), "max")));
              await r.write("\" style=\"width:50px\"");
              if (r.truth((!r.truth(r.get(r.get(s, "goval"), "tip-need-ok"))))) {
                await r.write("onclick=\"$('command').value='game-option';$('para1').value='");
                await r.write(r.text(r.get(s, "gokey")));
                await r.write("';$('para2').value=document.getElementById('");
                await r.write(r.text(r.get(s, "gokey")));
                await r.write("').value;postCmd('roomcmd','roomcmd.php');\"");
              }
              await r.write(">");
              if (r.truth(r.get(r.get(s, "goval"), "tip-need-ok"))) {
                await r.write("&nbsp;&nbsp;&nbsp;<input type=\"button\" value=\"确认\" onclick=\"$('command').value='game-option';$('para1').value='");
                await r.write(r.text(r.get(s, "gokey")));
                await r.write("';$('para2').value=document.getElementById('");
                await r.write(r.text(r.get(s, "gokey")));
                await r.write("').value;postCmd('roomcmd','roomcmd.php');\">\r\n&nbsp;&nbsp;&nbsp;当前");
                await r.write(r.text(r.get(r.get(s, "goval"), "title")));
                await r.write("已设置为<span class=\"yellow b\">");
                await r.write(r.text(r.get(s, "nval")));
                await r.write("</span>");
              }
            } else {
              if (r.truth((await r.call("is_array", r.get(r.get(s, "goval"), "options"))))) {
                {
                  const a1 = r.copy(r.get(r.get(s, "goval"), "options"));
                  for (const [k1, v1] of r.entries(a1)) {
                    r.assign(r.slot(s, ["oval"]), v1);
                    await r.write("<input type=\"");
                    await r.write(r.text(r.get(r.get(s, "goval"), "type")));
                    await r.write("\" name=\"");
                    await r.write(r.text(r.get(s, "gokey")));
                    await r.write("\" id=\"");
                    await r.write(r.text(r.get(s, "gokey")));
                    await r.write("_");
                    await r.write(r.text(r.get(r.get(s, "oval"), "value")));
                    await r.write("\"\r\nonchange=\"$('command').value='game-option';$('para1').value='");
                    await r.write(r.text(r.get(s, "gokey")));
                    await r.write("';$('para2').value='");
                    await r.write(r.text(r.get(r.get(s, "oval"), "value")));
                    await r.write("';postCmd('roomcmd','roomcmd.php');\"");
                    if (r.truth(r.equal(r.get(r.get(s, "oval"), "value"), r.get(r.get(r.get(s, "roomdata"), "current_game_option"), r.get(s, "gokey"))))) {
                      await r.write("checked");
                    }
                    await r.write(">\r\n<a onclick=\"$('");
                    await r.write(r.text(r.get(s, "gokey")));
                    await r.write("_");
                    await r.write(r.text(r.get(r.get(s, "oval"), "value")));
                    await r.write("').click();\" title=\"");
                    await r.write(r.text(r.get(r.get(s, "oval"), "title")));
                    await r.write("\">");
                    await r.write(r.text(r.get(r.get(s, "oval"), "name")));
                    await r.write("</a>&nbsp;&nbsp;&nbsp;");
                  }
                }
              }
            }
            if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "goval"), "tip-function")))))) && r.truth((await r.call("function_exists", r.get(r.get(s, "goval"), "tip-function"))))))) {
              r.assign(r.slot(s, ["tip_box_height"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "goval"), "tip-box-height")))))) ? r.get(r.get(s, "goval"), "tip-box-height") : "50px"));
              await r.write("<div class=\"gscroll\" style=\"padding:5px 0; text-align:center;overflow-x:hidden; overflow-y:auto;height:");
              await r.write(r.text(r.get(s, "tip_box_height")));
              await r.write("\">");
              await r.write(r.text((await r.namedCall(r.get(r.get(s, "goval"), "tip-function"), r.int(r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "current_game_option")), "lvl"))))));
              await r.write("</div>");
            }
            await r.write("</div>");
          }
        }
      }
    }
    await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td height=15px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  } else {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100% height=398px>\r\n<tr><td height=398px class=\"b3\">\r\n<span class=\"yellow b\">游戏即将开始，请等待几秒钟，页面将自动跳转至游戏界面<br>\r\n如果页面很久都没有跳转，请手动 <a href=\"game.php\">点击这里</a> 进入游戏<br></span>\r\n</td></tr></table>");
  }
return 1;
}
