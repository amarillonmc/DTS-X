// Generated from include/modules/extra/club/clubbase/npcskillpage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.truth((r.truth((r.compare(r.get(r.get(s, "edata"), "type"), 0) > 0)) && r.truth((!r.truth(r.get(s, "fog")))))) && r.truth((await r.module("skillbase", "skill_query", 460, r.get(s, "edata"))))))) {
    r.assign(r.slot(s, ["tdata", "showskill"]), 1);
    (await r.call("bubblebox_start", "id:npcskill;height:353;width:518;cancellable:1;"));
    await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n<br>\r\n<!--于是经过各种边框，最后工作区的大小是height:314px width:509px--> \r\n以下是该NPC<span class=\"yellow b\">独有</span>的技能列表。请注意描述文字中的“<span class=\"yellow b\">你</span>”指代的是这个NPC。<br><br>\r\n</p>\r\n<TABLE border=\"0\" cellSpacing=0 cellPadding=0 width=509px>\r\n<tr>\r\n<td width=\"0\"></td>\r\n<TD class=b1 width=\"40\"><span>名称</span></TD>\r\n<TD class=b1><span></span></TD>\r\n</tr>");
    (await r.module("clubbase", "get_npcskillpage", r.get(s, "edata")));
    await r.write("</table>\r\n<br>\r\n<p>\r\n\r\n<input class=\"cmdbutton\" onclick=\"bubblebox_hide_all();\" value=\"关闭技能列表\" type=\"button\">\r\n\r\n&nbsp;&nbsp;&nbsp; 提示:点击技能界面外任意位置也可以关闭技能列表<br>\r\n</p>");
    (await r.call("bubblebox_end"));
  }
return 1;
}
