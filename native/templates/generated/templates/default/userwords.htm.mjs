// Generated from templates/default/userwords.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table align=\"center\">\r\n<tr>\r\n<td>口头禅</td>\r\n<td><input size=\"30\" type=\"text\" name=\"motto\" maxlength=\"30\" value=\"");
  await r.write(r.text(r.get(s, "motto")));
  await r.write("\" placeholder=\"写下彰显个性的台词，30个字以内。\"></td>\r\n</tr>\r\n<tr>\r\n<td>杀人宣言</td>\r\n<td><input size=\"30\" type=\"text\" name=\"killmsg\" maxlength=\"30\" value=\"");
  await r.write(r.text(r.get(s, "killmsg")));
  await r.write("\" placeholder=\"写下杀死对手的留言，30个字以内\"></td>\r\n</tr>\r\n<tr>\r\n<td>遗言</td>\r\n<td><input size=\"30\" type=\"text\" name=\"lastword\" maxlength=\"30\" value=\"");
  await r.write(r.text(r.get(s, "lastword")));
  await r.write("\" placeholder=\"写下不幸被害时的台词，30个字以内\"></td>\r\n</tr>\r\n</table>");
return 1;
}
