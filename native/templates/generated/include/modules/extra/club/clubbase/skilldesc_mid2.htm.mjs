// Generated from include/modules/extra/club/clubbase/skilldesc_mid2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.global(s, "___TEMP_IN_SKLEARN_FLAG");
  if (r.truth((!r.truth(r.get(s, "___TEMP_IN_SKLEARN_FLAG"))))) {
    await r.write("</tr></table>");
    if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
      await r.write("</div><div class=\"skill_unacquired_hint\">\r\n<table class=\"skilltable\">\r\n<tr><td valign=\"center\" align=\"center\">");
    }
  } else {
    await r.write(r.text("_____TEMP_SKLEARN_END_FLAG_____"));
  }
return 1;
}
