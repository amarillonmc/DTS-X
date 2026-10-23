// Generated from include/modules/extra/club/clubbase/profileskillpage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.module("clubbase", "get_profile_skill_buttons"));
return 1;
}
