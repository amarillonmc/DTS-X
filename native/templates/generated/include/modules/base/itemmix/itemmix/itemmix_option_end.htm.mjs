// Generated from include/modules/base/itemmix/itemmix/itemmix_option_end.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:200\" value=\"返回\" onclick=\"$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
