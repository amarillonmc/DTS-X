// Generated from include/modules/base/pose/pose_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<td class=\"b2\"><span>基础姿态</span></td>");
  r.imports(s, "pose");
  await r.write("<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "poseinfo"), r.get(s, "pose"))));
  await r.write("</span></td>");
return 1;
}
