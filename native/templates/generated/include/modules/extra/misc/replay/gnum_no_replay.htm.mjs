// Generated from include/modules/extra/misc/replay/gnum_no_replay.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:gnum_replay_error;height:100;width:500;cancellable:1;margin-left:20px;margin-right:20px;margin-top:20px; margin-bottom:20px;"));
  await r.write("<div align=\"center\">\r\n<table CellPadding=0 CellSpacing=0 height=100px>\r\n<tr>\r\n<td width=150px>\r\n<img style=\"float:left; margin-right:10px;\" src=\"img/story_0.gif\">\r\n</td>\r\n<td width=350px>\r\n<span class=\"evergreen b\" style=\"font-size:14px\">\r\n『额，不好意思，我们的记忆库中似乎并没有留存第<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "gnum")));
  await r.write("</span>回「计划」的记忆录像。<br>\r\n不知道是年代太久远了，还是毁于上次的「袭击」，还是系统判定并无价值、从一开始就没记录呢……啊，对不起，说了些让你困扰的话。<br>\r\n今后也请多多支持我们「通讯社」的工作。』\r\n</span>\r\n</td>\r\n</tr></table>\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("<script type=\"text/javascript\">bubblebox_show('gnum_replay_error');</script>");
return 1;
}
