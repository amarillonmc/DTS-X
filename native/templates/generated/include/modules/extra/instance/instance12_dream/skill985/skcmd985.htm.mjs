// Generated from include/modules/extra/instance/instance12_dream/skill985/skcmd985.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("skillbase", "skill_query", 985, r.get(s, "sdata"))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" ");
    if (r.truth((await r.module("skillbase", "skill_getvalue", 985, "rflag", r.get(s, "sdata"))))) {
      await r.write("disabled=\"true\"");
    }
    await r.write(" value=\"刷新\" onclick=\"$('pbx_choice').value='-1'; postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
