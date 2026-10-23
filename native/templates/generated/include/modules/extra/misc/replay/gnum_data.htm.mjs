// Generated from include/modules/extra/misc/replay/gnum_data.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:gnum_replay;height:400;width:520;cancellable:1;margin-left:20px;margin-right:20px;margin-top:20px; margin-bottom:20px;"));
  await r.write("<div align=\"center\">\r\n<table CellPadding=0 CellSpacing=0>\r\n<tr>\r\n<td width=150px>\r\n<img style=\"float:left; margin-right:10px;\" src=\"img/story_0.gif\">\r\n</td>\r\n<td width=350px>\r\n<span class=\"evergreen b\" style=\"font-size:14px\">\r\n『是「时空■■」派你来的吗？请往这边来。<br>\r\n这些就是第<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "gnum")));
  await r.write("</span>回「计划」的玩家记忆录像。把全息磁盘接入精神界面，就可以「观看」了。<br>\r\n除了那些一次操作都没有进行就死掉的人，其他玩家的录像都在这里了。今后也请多多支持我们「通讯社」的工作。』\r\n</span>\r\n</td>\r\n</tr></table>\r\n<p>\r\n<br>\r\n观看全员录像（可以随意切换到任意玩家的视角，但录像文件相对较大）<br>\r\n<input type=\"button\" style=\"width:160px;\" value=\"观看全体玩家录像\" onclick=\"window.location.href='replay.php?repid=");
  await r.write(r.text(r.get(s, "room_gprefix")));
  await r.write(r.text(r.get(s, "gnum")));
  await r.write("'\"><br>\r\n<br>\r\n</p>\r\n观看单个玩家录像（不可切换视角，录像文件较小）<br>\r\n<table>\r\n<tr>\r\n<td class=\"b1\" width=200px>\r\n参与者\r\n</td>\r\n<td class=\"b1\" width=80px>\r\n行动数目\r\n</td>\r\n<td class=\"b1\" width=80px>\r\n操作\r\n</td>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "lis"))))) {
    {
      const a0 = r.copy(r.get(s, "lis"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["key"]), v0);
        await r.write("<tr>\r\n<td class=\"b3\" >");
        await r.write(r.text(r.get(r.get(s, "key"), "repname")));
        if (r.truth(((r.get(r.get(s, "key"), "is_winner") != null)))) {
          await r.write("<span class=\"red b\">&nbsp;(优胜者)</span>");
        }
        await r.write("</td>\r\n<td class=\"b3\">");
        await r.write(r.text(r.get(r.get(s, "key"), "repopcnt")));
        await r.write("</td>\r\n<td class=\"b3\">\r\n<input type=\"button\" style=\"width:80px;\" value=\"观看录像\" onclick=\"window.location.href='replay.php?repid=");
        await r.write(r.text(r.get(s, "room_gprefix")));
        await r.write(r.text(r.get(r.get(s, "key"), "link")));
        await r.write("'\">\r\n</td>\r\n</tr>");
      }
    }
  }
  await r.write("</table>\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("<script type=\"text/javascript\">bubblebox_show('gnum_replay');</script>");
return 1;
}
