// Generated from include/modules/extra/club/clubbase/skilldesc_start.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.global(s, "___TEMP_IN_SKLEARN_FLAG");
  if (r.truth((!r.truth(r.get(s, "___TEMP_IN_SKLEARN_FLAG"))))) {
    if (r.truth((!r.truth(((r.get(s, "who") != null)))))) {
      r.assign(r.slot(s, ["who"]), (r.truth(((r.get(s, "sdata") != null))) ? r.get(s, "sdata") : null));
    }
    r.assign(r.slot(s, ["___TEMP_THIS_SKILL_ACQUIRED"]), (await r.module("clubbase", "skill_query_unlocked", r.get(s, "___TEMP_SKILL_ID"), r.get(s, "who"))));
    await r.write("<tr><td width=\"0\"><br></td><td class=b1 width=40>");
  }
return 1;
}
