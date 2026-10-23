// Generated from templates/default/useradvdata.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table>\r\n<tr>\r\n<td style=\"text-align:center;vertical-align:top;\">");
  (await r.include(r.template("usergdicon"), s));
  await r.write("</td>\r\n<td>\r\n&nbsp;&nbsp;\r\n</td>\r\n<td style=\"text-align:center;vertical-align:top;\">");
  (await r.include(r.template("userwords"), s));
  await r.write("</td>\r\n</tr>");
  if (r.truth(r.equal("user", r.constant("CURSCRIPT")))) {
    await r.write("<tr>\r\n<td colspan=\"3\">\r\n<div style=\"text-align: center;\">如果已经入场，性别、头像、台词等修改将从下一局游戏开始生效。</div>\r\n</td>\r\n</tr>");
  }
  await r.write("</table>");
return 1;
}
