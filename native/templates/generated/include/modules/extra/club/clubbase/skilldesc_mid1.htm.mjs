// Generated from include/modules/extra/club/clubbase/skilldesc_mid1.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.global(s, "___TEMP_IN_SKLEARN_FLAG");
  if (r.truth((!r.truth(r.get(s, "___TEMP_IN_SKLEARN_FLAG"))))) {
    await r.write("</td><td>");
    if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
      await r.write("<div style=\"position:relative; height:100%; width:100%;\" onmouseover=\"skill_unacquired_mouseover.call(this,event)\" onmouseout=\"skill_unacquired_mouseout.call(this,event)\">\r\n<div class=\"skill_unacquired\">");
    }
    await r.write("<table class=\"skilltable\">\r\n<tr>");
  } else {
    await r.write(r.text("_____TEMP_SKLEARN_START_FLAG_____"));
  }
return 1;
}
