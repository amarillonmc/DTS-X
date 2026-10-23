// Generated from include/modules/base/explore/explore.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"zz\" value=\"[Z]探索\" onclick=\"$('command').value='search';postCmd('gamecmd','command.php');this.disabled=true;\" ");
  if (r.truth((!r.truth((await r.module("map", "check_can_enter", r.get(s, "pls"))))))) {
    await r.write("disabled");
  }
  await r.write(">\r\n<span id=\"moveto_box\"><select id=\"moveto\" name=\"moveto\" onchange=\"$('command').value='move';replay_record_DOM_path(this.options[this.selectedIndex]);postCmd('gamecmd','command.php');this.disabled=true;\">");
  (await r.include(r.template("move"), s));
  await r.write("</select></span>\r\n<br /> \r\n");
return 1;
}
