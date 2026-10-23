// Generated from include/modules/extra/club/clubbase/skillpage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))) {
    (await r.include(r.template("command"), s));
    await r.write("<input type=\"hidden\" id=\"skillpara1\" name=\"skillpara1\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara2\" name=\"skillpara2\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara3\" name=\"skillpara3\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara4\" name=\"skillpara4\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara5\" name=\"skillpara5\" value=\"\">");
  }
  if (r.truth((!r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))))) {
    (await r.call("bubblebox_start", (r.text((r.text("id:club") + r.text(r.get(s, "nowclub")))) + r.text(";height:584;width:568;cancellable:1;"))));
  } else {
    (await r.call("bubblebox_start", "id:clubskill;height:584;width:568;cancellable:1;"));
  }
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">");
  if (r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))) {
    await r.write("<!--于是经过各种边框，最后工作区的大小是height:584px width:509px--> ");
    if (r.truth(r.equal(r.get(s, "club"), 0))) {
      await r.write("<span class=\"yellow b\">你还没有选择内定称号，请在主界面中选择一个内定称号以获得称号技能。</span><br>");
    }
    (await r.module("player", "update_sdata"));
    await r.write("你目前有<span class=\"lime b\">");
    await r.write(r.text(r.get(s, "skillpoint")));
    await r.write("</span>点技能点供自由分配，升级时可以获取新的技能点。<br>\r\n以下是你的技能列表。<br><br>");
  } else {
    r.imports(s, "clubbase");
    await r.write("以下是");
    await r.write(r.text(r.get(r.get(s, "clubinfo"), r.get(s, "nowclub"))));
    await r.write("称号的技能列表。<br>\r\n技能点在升级时获得。鼠标移动到非开局解锁的技能上可以查看其描述。<br><br>");
  }
  await r.write("</p>\r\n<TABLE class=\"skilltable\" style=\"width:559px\">\r\n<tr>\r\n<td width=\"0\"></td>\r\n<TD class=b1 width=\"40\"><span>名称</span></TD>\r\n<TD class=\"b1\"><span></span></TD>\r\n</tr>");
  (await r.module("clubbase", "get_skillpage"));
  await r.write("</table>\r\n<br>\r\n<p>\r\n\r\n<input class=\"cmdbutton\" onclick=\"bubblebox_hide_all();\" value=\"返回主界面\" type=\"button\">\r\n\r\n&nbsp;&nbsp;&nbsp; 提示:点击技能界面外任意位置也可以返回主界面<br>\r\n</p>");
  (await r.call("bubblebox_end"));
  if (r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))) {
    await r.write("<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"bubblebox_show('clubskill');\">");
  }
  r.assign(r.slot(s, ["mode"]), "command");
return 1;
}
