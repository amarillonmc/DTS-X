// Generated from templates/default/replay.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<script type=\"text/javascript\" src=\"include/javascript/replay.20231107.js\"></script>\r\n<!-- Replay Game Word Lib Load Start -->\r\n<script type=\"text/javascript\" src=");
  await r.write(r.text((r.text((r.text("\"gamedata/javascript/") + r.text(r.get(s, "repdatalib")))) + r.text("\""))));
  await r.write("></script>\r\n<!-- Replay Game Word Lib Load End -->\r\n\r\n<!-- 录像文件载入进度条支持 START -->\r\n<style type=\"text/css\">\r\n#progressbar-border\r\n{\r\nwidth:100%;\r\nheight:15px;\r\nbackground-color: #000000;\r\nborder:1px solid #ffffff;\r\noverflow:hidden;\r\n}\r\n#progressbar-inner\r\n{\r\nwidth:0%;\r\nheight:15px;\r\nbackground: #ff3333; \r\n}\r\n#progressbar-text\r\n{\r\nposition:relative;\r\nleft: 230px;\r\ncolor: #ffffff;\r\ntop: -16px; \r\n}\r\n#progressbar-inner2\r\n{\r\nwidth:0%;\r\nheight:15px;\r\nbackground: #3333ff; \r\n}\r\n#progressbar-text2\r\n{\r\nposition:relative;\r\nleft: 230px;\r\ncolor: #ffffff;\r\ntop: -16px; \r\n}\r\n.noselect \r\n{\r\n    -webkit-touch-callout: none;\r\n    -webkit-user-select: none;\r\n    -khtml-user-select: none;\r\n    -moz-user-select: none;\r\n    -ms-user-select: none;\r\n    user-select: none;\r\n}\r\n</style>\r\n<!-- 录像文件载入进度条支持 END -->\r\n\r\n<!-- 回放控制板 START -->\r\n<div class=\"b3\" style=\"z-index:10000; margin:0 auto; width:1080px;\">\r\n\r\n<span class=\"noselect\" style=\"height:7px; display:block;\">&nbsp;</span>\r\n\r\n<!-- 录像进度条 START -->\r\n<div id=\"replay_bar\" style=\"cursor:pointer; margin:0 auto; width:1030px; height:25px;\" \r\nonmouseover=\"replay_bar_now_mouseon = 1; $('replay_bar').addEventListener('mousemove',replay_bar_mouse_move_handler); replay_bar_show_time_hint();\" \r\nonmouseout=\"replay_bar_now_mouseon = 0; if (replay_cursor_drag_flag==0) { $('replay_bar').removeEventListener('mousemove',replay_bar_mouse_move_handler); replay_bar_hide_time_hint(); }\" >\r\n\r\n<div style=\"z-index:10000; width:1030px; height:10px;\"></div>\r\n\r\n<!-- 时间轴 START -->\r\n<div style=\"z-index:10000; width:1000px; height:5px; left:15px\">\r\n\r\n<!-- 主轴 START -->\r\n<div class=\"noselect\" style=\"z-index:10000; width:1000px; height:5px;\">\r\n<img id=\"replay_bar_coreu2\" style=\"width:1000px;z-index:10000;filter:alpha(opacity=40); opacity:0.4;\"/>\r\n<img id=\"replay_bar_coreu1\" style=\"width:1000px;z-index:10000;filter:alpha(opacity=80); opacity:0.8;\"/>\r\n<img id=\"replay_bar_core\" style=\"width:1000px;z-index:10000;\"/>\r\n<img id=\"replay_bar_cored1\" style=\"width:1000px;z-index:10000;filter:alpha(opacity=80); opacity:0.8;\"/>\r\n<img id=\"replay_bar_cored2\" style=\"width:1000px;z-index:10000;filter:alpha(opacity=40); opacity:0.4;\"/>\r\n</div>\r\n<!-- 主轴 END -->\r\n\r\n<!-- 当前光标 START -->\r\n<div style=\"position:relative; left:-11px; top:-14px; text-align:left;\">\r\n<div id=\"replay_cursor\" style=\"cursor:move;z-index:10010;position:relative;left:0px;height:30px;width:24px;background-image:url(img/replay_cursor.png); background-position: center top; background-repeat: no-repeat; background-size: 16px 25px;\" ></div>\r\n</div>\r\n<!-- 当前光标 END -->\r\n</div>\r\n<!-- 时间轴 END -->\r\n\r\n<div style=\"z-index:10000; width:1030px; height:10px;\"></div>\r\n</div>\r\n\r\n<!-- 悬浮提示 START -->\r\n<div id=\"replay_hint\" class=\"b3\" style=\"z-index:20020; position:fixed; left:0px; top:0px; display:none; text-align:left;\">\r\n<div class=\"noselect\" style=\"filter:alpha(opacity=95); opacity:0.95; background-color:#000000\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<span id=\"replay_hint_inner\" style=\"margin-left:5px; margin-right:5px;\">\r\n</span>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</div>\r\n<!-- 悬浮提示 END -->\r\n\r\n<script type=\"text/javascript\">\r\n$('replay_cursor').addEventListener('mousedown',replay_cursor_mouse_down_handler);\r\n$('replay_cursor').addEventListener('mouseover',replay_cursor_mouse_over_handler);\r\n$('replay_cursor').addEventListener('mouseout',replay_cursor_mouse_out_handler);\r\n$('replay_bar').addEventListener('mousedown',replay_bar_mouse_down_handler);\r\n</script>\r\n<!-- 录像进度条 END -->\r\n\r\n<span class=\"noselect\" style=\"height:8px; display:block;\">&nbsp;</span>\r\n\r\n<!-- 录像操作界面 START -->\r\n<div align=\"left\">\r\n\r\n<table>\r\n<tr>\r\n\r\n<td width=\"8px\"></td>\r\n\r\n<!-- 播放按钮 START -->\r\n<td>\r\n<div class=\"noselect\" id=\"replay_start_selector\" style=\"cursor:pointer;border:1px #ffffff solid; height:30px;\" onmousedown=\"replay_start_handler();\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<div style=\"text-align:center;z-index:10020; \">&nbsp;播放&nbsp;</div>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</td>\r\n<!-- 播放按钮 END -->\r\n\r\n<td width=\"1px\"></td>\r\n\r\n<!-- 暂停按钮 START -->\r\n<td>\r\n<div class=\"noselect\" id=\"replay_pause_selector\" style=\"cursor:pointer;border:1px #ffffff solid; height:30px;\" onmousedown=\"replay_pause_handler();\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<div style=\"text-align:center;z-index:10020; \">&nbsp;暂停&nbsp;</div>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</td>\r\n<!-- 暂停按钮 END -->\r\n\r\n<!-- 后退按钮 START -->\r\n<td>\r\n<div class=\"noselect\" id=\"replay_bk_selector\" style=\"cursor:pointer;border:1px #ffffff solid; height:30px;\" onmousedown=\"replay_bk_handler();\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<div style=\"text-align:center;z-index:10020; \">&nbsp;后退1步&nbsp;</div>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</td>\r\n<!-- 后退按钮 END -->\r\n\r\n<!-- 前进按钮 START -->\r\n<td>\r\n<div class=\"noselect\" id=\"replay_fd_selector\" style=\"cursor:pointer;border:1px #ffffff solid; height:30px;\" onmousedown=\"replay_fd_handler();\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<div style=\"text-align:center;z-index:10020; \">&nbsp;前进1步&nbsp;</div>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</td>\r\n<!-- 前进按钮 END -->\r\n\r\n<td width=\"15px\"></td>\r\n\r\n<!-- 加速按钮 START -->\r\n<td>\r\n<div class=\"noselect\" id=\"replay_speed_selector\" style=\"cursor:pointer;border:1px #ffffff solid; font-size:16px; height:30px; width:31px;\" onmousedown=\"replay_switch_speed();\">\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<div style=\"text-align:center; font-weight:bold;z-index:10020; \">3x</div>\r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n</div>\r\n</td>\r\n<!-- 加速按钮 END -->\r\n\r\n<td width=\"15px\"></td>\r\n\r\n<!-- 时间显示 START -->\r\n<td>\r\n<div class=\"noselect\" style=\"z-index:10020;font-size:16px\">时间&nbsp;<span id=\"replay_now_player_time\"></span>&nbsp;/&nbsp;<span id=\"replay_tot_player_time\"></span></div><div class=\"noselect\" style=\"z-index:10020;font-size:16px\">时刻&nbsp;<span id=\"replay_now_global_sec\"></span></div>\r\n</td>\r\n<!-- 时间显示 END -->\r\n\r\n<!-- 玩家显示 START -->");
  if (r.truth(r.equal(r.get(s, "replay_player_num_tot"), 6))) {
    await r.write("<td width=\"1px\"></td>");
  } else {
    await r.write("<td width=\"15px\"></td>");
  }
  await r.write("<td>\r\n<div class=\"noselect\" style=\"z-index:10020;font-size:16px\">&nbsp;视角&nbsp;&nbsp;</div>\r\n</td>");
  if (r.truth((r.compare(r.get(s, "replay_player_num_tot"), 6) > 0))) {
    r.assign(r.slot(s, ["rep_show_more_player"]), 1);
  } else {
    r.assign(r.slot(s, ["rep_show_more_player"]), 0);
  }
  if (r.truth((await r.call("is_array", (await r.call("range", 0, (await r.call("min", (r.truth(r.equal(r.get(s, "rep_show_more_player"), 1)) ? 3 : 5), r.subtract(r.get(s, "replay_player_num_tot"), 1))))))))) {
    {
      const a0 = r.copy((await r.call("range", 0, (await r.call("min", (r.truth(r.equal(r.get(s, "rep_show_more_player"), 1)) ? 3 : 5), r.subtract(r.get(s, "replay_player_num_tot"), 1))))));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("<td ");
        if (r.truth(r.equal(r.get(s, "replay_player_num_tot"), 6))) {
          await r.write("width=95px");
        } else {
          await r.write("width=110px");
        }
        await r.write(">\r\n<div style=\"z-index:10020;cursor:pointer;height:32px; ");
        if (r.truth(r.equal(r.get(s, "replay_player_num_tot"), 6))) {
          await r.write("width:87px;");
        } else {
          await r.write("width:102px;");
        }
        await r.write("\" ");
        await r.write(r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text("onmouseover=\"$('replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("').style.boxShadow='0px 0px 6px #"))) + r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")))) + r.text("';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.MozBoxShadow='0px 0px 6px #"))) + r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")))) + r.text("';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.WebkitBoxShadow='0px 0px 6px #"))) + r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")))) + r.text("';\""))));
        await r.write(r.text((r.text((r.text((r.text((r.text((r.text((r.text(" onmouseout=\"$('replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("').style.boxShadow='none';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.MozBoxShadow='none';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.WebkitBoxShadow='none';\""))));
        await r.write(" onmousedown=\"replay_switch_player(");
        await r.write(r.text(r.get(s, "i")));
        await r.write(");\">\r\n<div ");
        await r.write(r.text((r.text((r.text("id=\"replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("_background\""))));
        await r.write(" style=\"height:30px; ");
        if (r.truth(r.equal(r.get(s, "replay_player_num_tot"), 6))) {
          await r.write("width:85px;");
        } else {
          await r.write("width:100px;");
        }
        await r.write(" filter:alpha(opacity=20); opacity:0.2; border:1px transparent; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px;\"></div><div ");
        await r.write(r.text((r.text((r.text("id=\"replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("\""))));
        await r.write(" style=\"position:relative; top:-31px; left:-1px; height:30px; ");
        if (r.truth(r.equal(r.get(s, "replay_player_num_tot"), 6))) {
          await r.write("width:85px;");
        } else {
          await r.write("width:100px;");
        }
        await r.write(" border:1px #");
        await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")));
        await r.write(" solid; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; color:#");
        await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")));
        await r.write("; text-align:center; line-height:30px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<div class=\"noselect\" style=\"margin-left:10px; margin-right:10px;overflow-x:hidden;overflow-y:hidden;white-space:nowrap;\">");
        await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "repname")));
        await r.write("</div>\r\n</div>\r\n</div>\r\n</td>");
      }
    }
  }
  if (r.truth(r.get(s, "rep_show_more_player"))) {
    await r.write("<td width=1px></td>\r\n<td id=\"replay_more_players_top_positioner\" style=\"cursor:pointer;\" onmouseover=\"$('replay_more_players').style.left=Number(jQuery('#replay_more_players_left_positioner').offset().left-jQuery(window).scrollLeft()+10).toString()+'px';\r\n$('replay_more_players').style.top=Number(jQuery('#replay_more_players_top_positioner').offset().top-jQuery(window).scrollTop()-4).toString()+'px';$('replay_more_players').style.display='block'; replay_more_player_mouse_on = 1;\"\r\nonmouseout=\"replay_more_player_mouse_on = 0; if (!replay_more_player_mouse_on && !replay_more_player_submenu_mouse_on) $('replay_more_players').style.display='none';\">\r\n<div class=\"noselect\" style=\"z-index:10020; z-index:10020;font-size:16px; margin-right:12px;\">更多玩家<span id=\"replay_more_players_left_positioner\">&raquo;</span></div><div id=\"replay_more_players\" style=\"z-index:10020; position:fixed; display:none;\" onmouseover=\"replay_more_player_submenu_mouse_on = 1;\" onmouseout=\"replay_more_player_submenu_mouse_on = 0; if (!replay_more_player_mouse_on && !replay_more_player_submenu_mouse_on) $('replay_more_players').style.display='none';\">\r\n<table CellSpacing=1 CellPadding=0>");
    r.assign(r.slot(s, ["rep_remain_player"]), r.subtract(r.get(s, "replay_player_num_tot"), 4));
    r.assign(r.slot(s, ["repcol"]), r.add(r.int((await r.call("floor", r.divide(r.subtract(r.get(s, "rep_remain_player"), 1), 10)))), 1));
    if (r.truth((await r.call("is_array", (await r.call("range", 4, r.subtract(r.get(s, "replay_player_num_tot"), 1))))))) {
      {
        const a1 = r.copy((await r.call("range", 4, r.subtract(r.get(s, "replay_player_num_tot"), 1))));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["i"]), v1);
          if (r.truth(r.equal(r.modulo(r.subtract(r.get(s, "i"), 4), r.get(s, "repcol")), 0))) {
            await r.write("<tr>");
          }
          await r.write("<td width=118px height=41px class=\"b3\" valign=middle ");
          await r.write(r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text("onmouseover=\"$('replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("').style.boxShadow='0px 0px 6px #"))) + r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")))) + r.text("';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.MozBoxShadow='0px 0px 6px #"))) + r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")))) + r.text("';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.WebkitBoxShadow='0px 0px 6px #"))) + r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")))) + r.text("';\""))));
          await r.write(r.text((r.text((r.text((r.text((r.text((r.text((r.text(" onmouseout=\"$('replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("').style.boxShadow='none';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.MozBoxShadow='none';$('replay_playerbutton_"))) + r.text(r.get(s, "i")))) + r.text("').style.WebkitBoxShadow='none';\""))));
          await r.write("  onmousedown=\"replay_switch_player(");
          await r.write(r.text(r.get(s, "i")));
          await r.write(");\">\r\n<div style=\"height:100%; width:100%; filter:alpha(opacity=75); opacity:0.75; background-color:#000000\">\r\n<span class=\"noselect\" style=\"height:5px; display:block;\">&nbsp;</span>\r\n<div style=\"margin-left:8px; z-index:10020;cursor:pointer;height:32px; width:102px;\">\r\n<div ");
          await r.write(r.text((r.text((r.text("id=\"replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("_background\""))));
          await r.write(" style=\"height:30px; width:100px; filter:alpha(opacity=20); opacity:0.2; border:1px transparent; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px;\"></div><div ");
          await r.write(r.text((r.text((r.text("id=\"replay_playerbutton_") + r.text(r.get(s, "i")))) + r.text("\""))));
          await r.write(" style=\"position:relative; top:-31px; left:-1px; height:30px; width:100px; border:1px #");
          await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")));
          await r.write(" solid; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; color:#");
          await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "color")));
          await r.write("; text-align:center; line-height:30px; filter:alpha(opacity=75); opacity:0.75; \">\r\n<div class=\"noselect\" style=\"margin-left:10px; margin-right:10px;overflow-x:hidden;overflow-y:hidden;white-space:nowrap;\">");
          await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), r.get(s, "i")), "repname")));
          await r.write("</div>\r\n</div>\r\n</div>\r\n</div>\r\n</td>");
          if (r.truth((r.truth(r.equal(r.modulo(r.subtract(r.get(s, "i"), 4), r.get(s, "repcol")), r.subtract(r.get(s, "repcol"), 1))) || r.truth(r.equal(r.get(s, "i"), r.subtract(r.get(s, "replay_player_num_tot"), 1)))))) {
            await r.write("</tr>");
          }
        }
      }
    }
    await r.write("</table>\r\n</div>\r\n</td>");
  }
  await r.write("<!-- 玩家显示 END -->\r\n</tr>\r\n</table>\r\n\r\n</div>\r\n<!-- 录像操作界面 END -->\r\n\r\n<span class=\"noselect\" style=\"height:7px; display:block;\">&nbsp;</span>\r\n\r\n</div>\r\n<!-- 回放控制板 END -->\r\n\r\n<!-- 录像载入进度气泡框 START -->");
  (await r.call("bubblebox_start", "id:replayhint;height:200;width:500;cancellable:0;margin-right:8px;"));
  await r.write("<table height=198px width=100%><tr><td align=\"left\" valign=\"middle\">\r\n<span>少女祈祷中... </span>");
  if (r.truth((r.compare(r.get(s, "replay_player_num_tot"), 1) > 0))) {
    await r.write("<span style=\"height:8px; display:block;\">&nbsp;</span>\r\n<div id=\"progressbar-border\">\r\n<div id=\"progressbar-inner2\"></div><div id=\"progressbar-text2\">0%</div>\r\n</div>   \r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<table width=100%>\r\n<tr><td>\r\n正在载入第<span id=\"replay_loader_now_player_num\">1</span>位玩家(共<span>");
    await r.write(r.text(r.get(s, "replay_player_num_tot")));
    await r.write("</span>位)……\r\n<div style=\"float:right;\">录像文件总大小: <span>");
    await r.write(r.text(r.get(s, "rfullsz")));
    await r.write("</span>KB</div>\r\n</td></tr>\r\n</table>\r\n<span style=\"height:7px; display:block;\">&nbsp;</span>");
  }
  await r.write("<span style=\"height:8px; display:block;\">&nbsp;</span>\r\n<div id=\"progressbar-border\">\r\n<div id=\"progressbar-inner\"></div><div id=\"progressbar-text\">0%</div>\r\n</div>   \r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<table>\r\n<tr><td width=200px>\r\n玩家: <span id=\"replay_loader_now_player\" class=\"lime b\">");
  await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), "0"), "repname")));
  await r.write("</span>\r\n</td><td width=200px>\r\n游戏局号: ");
  await r.write(r.text(r.get(s, "repgnum")));
  await r.write("</td></tr>\r\n<tr><td width=200px>\r\n录像文件大小: <span id=\"replay_loader_now_repsz\">");
  await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), "0"), "repsz")));
  await r.write("</span>\r\n</td><td width=200px>\r\n操作总数: <span id=\"replay_loader_now_opcnt\">");
  await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), "0"), "repopcnt")));
  await r.write("</span>\r\n</td></tr>\r\n</table>\r\n\r\n</td></tr></table>");
  (await r.call("bubblebox_end"));
  await r.write("<script type=\"text/javascript\">bubblebox_show('replayhint');</script>\r\n<!-- 录像载入进度气泡框 END -->\r\n\r\n<!-- 播放结束气泡框 START -->");
  (await r.call("bubblebox_start", "id:persistent-replay-endhint;height:200;width:500;cancellable:1;margin-right:8px;"));
  await r.write("<table height=198px width=100%><tr><td align=\"center\" valign=\"middle\">\r\n<span><font size=\"50px\">录像播放结束</font><br><br>\r\n<a href=\"#\" onclick=\"if (history.length>1) javascript:history.back(-1); else window.location.href='index.php';\">点击这里返回录像选择界面</a>，或点击气泡框外任意位置重新观看本录像\r\n</span>\r\n</td></tr></table>");
  (await r.call("bubblebox_end"));
  await r.write("<!-- 播放结束气泡框 END -->\r\n\r\n<!-- 载入录像 -->\r\n<script type=\"text/javascript\">\r\nreplay_player_num_tot = ");
  await r.write(r.text(r.get(s, "replay_player_num_tot")));
  await r.write(";\r\nreplay_game_starttime = ");
  await r.write(r.text(r.get(s, "rgstime")));
  await r.write(";");
  await r.write(r.text((r.text((r.text((r.text("___temp_s = new String('") + r.text(r.get(s, "jrepindexdata")))) + r.text("');"))) + r.text("\n"))));
  await r.write("replay_data_full = JSON.parse(JXG.decompress(___temp_s));\r\ndelete ___temp_s;\r\nreplay_player_now_num = 0;\r\njQuery.cachedScript(\"gamedata/replays/");
  await r.write(r.text(r.get(r.get(r.get(s, "repindexdata"), "0"), "repfileid")));
  await r.write(".replay.header.js\");\r\n</script>");
  (await r.include(r.template("game_interface"), s));
  (await r.include(r.template("footer"), s));
return 1;
}
