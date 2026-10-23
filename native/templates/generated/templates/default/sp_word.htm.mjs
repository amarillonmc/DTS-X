// Generated from templates/default/sp_word.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想改变什么话？（留空为不修改）<br>\r\n\r\n<input type=\"hidden\" name=\"mode\" value=\"chgword\">\r\n<div>座右铭 : <input size=\"30\" type=\"text\" name=\"newmotto\" maxlength=\"60\" value=\"");
  await r.write(r.text(r.get(s, "motto")));
  await r.write("\"></div>\r\n<br />写下代表你性格的一句话，30个字以内。\r\n<div>留  言 : <input size=\"30\" type=\"text\" name=\"newkillmsg\" maxlength=\"60\" value=\"");
  await r.write(r.text(r.get(s, "killmsg")));
  await r.write("\"></div>\r\n<br />写下你杀死对手的留言，30个字以内。\r\n<div>遗  言 : <input size=\"30\" type=\"text\" name=\"newlastword\" maxlength=\"60\" value=\"");
  await r.write(r.text(r.get(s, "lastword")));
  await r.write("\"></div>\r\n<br />写下你不幸被害时的台词，30个字以内。\r\n<br />\r\n<br />\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
