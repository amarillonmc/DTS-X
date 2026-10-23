// Generated from include/modules/base/itemmain/itmcommand.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"itemmerge\"  value=\"包裹管理\" onclick=\"$('command').value='itemmain';$('subcmd').name='itemcmd';$('subcmd').value='itemmerge';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
