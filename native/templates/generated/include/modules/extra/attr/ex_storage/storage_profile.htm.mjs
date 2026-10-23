// Generated from include/modules/extra/attr/ex_storage/storage_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("attrbase", "check_itmsk", "^st")))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_storage\"  value=\"储物空间\" onclick=\"$('mode').value='special';$('command').value='storage';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
