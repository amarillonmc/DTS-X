// Generated from include/modules/extra/club/clubbase/skilldesc_end.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.global(s, "___TEMP_IN_SKLEARN_FLAG");
  if (r.truth((!r.truth(r.get(s, "___TEMP_IN_SKLEARN_FLAG"))))) {
    if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
      await r.write("</td></tr></table></div></div>");
    }
    await r.write("</td></tr>");
  }
return 1;
}
