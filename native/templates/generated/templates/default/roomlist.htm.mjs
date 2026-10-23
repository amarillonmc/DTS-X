// Generated from templates/default/roomlist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<span class=\"evergreen b\">房间列表：</span><br>\r\n<div style=\"height:5px;\">&nbsp;</div><div class=\"gscroll\" style=\"width:520px;max-height:300px;\"> ");
  if (r.truth(r.equal((await r.call("count", r.get(s, "shroomlist"))), 0))) {
    await r.write("当前没有任何房间。");
    if (r.truth((r.truth(r.get(s, "cuser")) && r.truth(r.get(s, "cpass"))))) {
      await r.write("<input type=\"button\" onClick=\"bubblebox_show('persistent-newroombox');\" value=\"新建一个房间\">");
    }
    await r.write("<br>");
  } else {
    await r.write("<table CellSpacing=0 CellPadding=0>\r\n<tr>\r\n<td class=\"b1\" width=\"30px\">编号</td>\r\n<td class=\"b1\" width=\"80px\">游戏模式</td>\r\n<td class=\"b1\" width=\"60px\">状态</td>\r\n<td class=\"b1\" width=\"60px\">活跃人数</td>\r\n<td class=\"b1\" width=\"130px\">创建者/房主</td>\r\n<td class=\"b1\" width=\"100px\">运行时间</td>\r\n<td class=\"b1\" width=\"50px\">操作</td>\r\n</tr>");
    if (r.truth((await r.call("is_array", r.get(s, "shroomlist"))))) {
      {
        const a0 = r.copy(r.get(s, "shroomlist"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["value"]), v0);
          await r.write("<tr>\r\n<td class=\"b3\" height=\"30px\">");
          await r.write(r.text(r.get(r.get(s, "value"), "id")));
          await r.write("</td>\r\n<td class=\"b3\">");
          await r.write(r.text(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "value"), "roomtype")), "name")));
          await r.write("</td>\r\n<td class=\"b3\">");
          if (r.truth((r.truth((r.compare(r.get(r.get(s, "value"), "status"), 10) >= 0)) && r.truth((r.compare(r.get(r.get(s, "value"), "status"), 40) < 0))))) {
            await r.write("<span class=");
            if (r.truth(r.equal(r.get(r.get(s, "value"), "nowplayer"), r.get(r.get(s, "value"), "maxplayer")))) {
              await r.write("\"grey b\"");
            } else {
              await r.write("\"lime b\"");
            }
            await r.write(">等待中</span>");
          } else {
            await r.write("<span class=");
            if (r.truth(r.equal(r.get(r.get(s, "value"), "gamestate"), 20))) {
              await r.write("\"lime b\"");
            } else {
              await r.write("\"grey b\"");
            }
            await r.write(">");
            await r.write(r.text(r.get(r.get(s, "gstate"), r.get(r.get(s, "value"), "gamestate"))));
            await r.write("</span>");
          }
          await r.write("</td>\r\n<td class=\"b3\">");
          if (r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "value"), "roomtype")), "without-ready"))) {
            if (r.truth((!r.truth(r.get(r.get(s, "value"), "nowplayer"))))) {
              await r.write("<span class=\"grey b\">");
            } else {
              await r.write("<span class=\"white b\">");
            }
            await r.write(r.text(r.get(r.get(s, "value"), "nowplayer")));
          } else {
            if (r.truth((r.truth((r.compare(r.get(r.get(s, "value"), "status"), 10) >= 0)) && r.truth((r.compare(r.get(r.get(s, "value"), "status"), 40) < 0))))) {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "nowplayer"), r.get(r.get(s, "value"), "maxplayer")))) {
                await r.write("<span class=\"grey b\">");
              } else {
                if (r.truth(r.equal(r.add(r.get(r.get(s, "value"), "nowplayer"), 1), r.get(r.get(s, "value"), "maxplayer")))) {
                  await r.write("<span class=\"red b\" style=\"color:#ff0022;\">");
                } else {
                  if (r.truth(r.equal(r.add(r.get(r.get(s, "value"), "nowplayer"), 2), r.get(r.get(s, "value"), "maxplayer")))) {
                    await r.write("<span class=\"yellow b\">");
                  } else {
                    await r.write("<span class=\"white b\">");
                  }
                }
              }
              await r.write(r.text(r.get(r.get(s, "value"), "nowplayer")));
              await r.write("/");
              await r.write(r.text(r.get(r.get(s, "value"), "maxplayer")));
              await r.write("</span>");
            } else {
              await r.write("<span class=\"grey b\">-</span>");
            }
          }
          await r.write("</td>\r\n<td class=\"b3\">");
          if (r.truth((r.truth((!r.truth(r.get(r.get(r.get(s, "value"), "roomdata"), "roomfounder")))) || r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "value"), "roomtype")), "soleroom"))))) {
            await r.write("-");
          } else {
            await r.write(r.text(r.get(r.get(r.get(s, "value"), "roomdata"), "roomfounder")));
          }
          if (r.truth((r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(r.get(r.get(r.get(s, "value"), "roomdata"), "player"), "0"), "name")))))) && r.truth((!r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "value"), "roomtype")), "soleroom")))))) && r.truth((!r.equal(r.get(r.get(r.get(r.get(r.get(s, "value"), "roomdata"), "player"), "0"), "name"), r.get(r.get(r.get(s, "value"), "roomdata"), "roomfounder"))))))) {
            await r.write(" / ");
            await r.write(r.text(r.get(r.get(r.get(r.get(r.get(s, "value"), "roomdata"), "player"), "0"), "name")));
          }
          await r.write("</td>\r\n<td class=\"b3\">");
          r.assign(r.slot(s, ["t"]), r.get(r.get(s, "value"), "runningtime"));
          await r.write(r.text((r.text((r.text((r.truth((r.compare(r.get(s, "t"), 3600) >= 0)) ? (r.text((await r.call("floor", r.divide(r.get(s, "t"), 3600)))) + r.text("小时")) : "")) + r.text((await r.call("floor", r.divide(r.modulo(r.get(s, "t"), 3600), 60)))))) + r.text("分钟"))));
          await r.write("</td>\r\n<td class=\"b3\">");
          if (r.truth((r.truth((!r.truth(r.get(s, "cuser")))) || r.truth((!r.truth(r.get(s, "cpass"))))))) {
            await r.write("<span class=\"grey b\">-</span>");
          } else {
            if (r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))) {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "id"), r.get(s, "room_id")))) {
                await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"room_quit();\" value=\"退出\" />");
              } else {
                await r.write("<span class=\"grey b\">-</span>");
              }
            } else {
              await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"room_enter(");
              await r.write(r.text(r.get(r.get(s, "value"), "id")));
              await r.write(");\" value=\"");
              if (r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "value"), "roomtype")), "without-ready"))) {
                await r.write("进入");
              } else {
                if (r.truth((r.truth((r.truth((r.truth((r.compare(r.get(r.get(s, "value"), "status"), 10) >= 0)) && r.truth((r.compare(r.get(r.get(s, "value"), "status"), 40) < 0)))) && r.truth((r.compare(r.get(r.get(s, "value"), "nowplayer"), r.get(r.get(s, "value"), "maxplayer")) < 0)))) || r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "value"), "validlist")))))) && r.truth((await r.call("in_array", r.get(s, "cuser"), r.get(r.get(s, "value"), "validlist"))))))))) {
                  await r.write("进入");
                } else {
                  await r.write("旁观");
                }
              }
              await r.write("\" />");
            }
          }
          await r.write("</td>\r\n</tr>");
        }
      }
    }
    await r.write("</table>");
  }
  await r.write("</div><div style=\"height:5px;\">&nbsp;</div>");
  if (r.truth((r.truth((!r.truth(r.get(s, "cuser")))) || r.truth((!r.truth(r.get(s, "cpass"))))))) {
    await r.write("你尚未登陆，请先登陆。");
  } else {
    if (r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))) {
      await r.write("你现在在房间");
      await r.write(r.text((await r.call("room_prefix2id", r.get(s, "room_prefix")))));
      await r.write(" 中。");
      if (r.truth((r.truth(((r.get(r.get(s, "roomlist"), (await r.call("substr", r.get(s, "room_prefix"), 1))) != null))) && r.truth((r.compare(r.get(r.get(r.get(s, "roomlist"), (await r.call("substr", r.get(s, "room_prefix"), 1))), "status"), 40) >= 0))))) {
        await r.write("这个房间正在游戏中，请进入游戏。<br>\r\n如果你在游戏中已阵亡，你也可以<input type=\"button\" style=\"width:80px\" onclick=\"room_quit();\" value=\"退出房间\" />然后加入其他房间。<br>");
      } else {
        await r.write("<br><br>");
        (await r.include(r.template("room"), s));
      }
    } else {
      await r.write("你不在任何一个房间中。<br>\r\n请选择一个房间进入，或<input type=\"button\" onClick=\"bubblebox_show('persistent-newroombox');\" value=\"新建一个房间\" />");
    }
  }
  (await r.include(r.template("room_newroom"), s));
  await r.write("<div style=\"height:5px;\">&nbsp;</div>");
return 1;
}
