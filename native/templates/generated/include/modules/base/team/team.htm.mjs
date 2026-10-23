// Generated from include/modules/base/team/team.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"team\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"");
  await r.write(r.text(r.get(s, "teamcmd")));
  await r.write("\">\r\n<div>队伍名称 : <input size=\"15\" type=\"text\" name=\"nteamID\" maxlength=\"30\"></div><div>15个字以内。<div><br>\r\n<div>队伍密码 : <input size=\"15\" type=\"text\" name=\"nteamPass\" maxlength=\"30\"></div><div>15个字以内。<div><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]取消\" onclick=\"$('mode').value='command';$('command').value='';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
