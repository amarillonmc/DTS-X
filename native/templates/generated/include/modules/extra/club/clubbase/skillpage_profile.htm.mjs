// Generated from include/modules/extra/club/clubbase/skillpage_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"v\"  value=\"[V]技能表\" onclick=\"$('mode').value='special';$('command').value='viewskills';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
