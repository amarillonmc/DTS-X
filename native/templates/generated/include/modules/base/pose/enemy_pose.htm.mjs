// Generated from include/modules/base/pose/enemy_pose.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<td class=\"b2\"><span>基础姿态</span></td>");
  r.imports(s, "pose");
  await r.write("<td class=\"b3\"><span>");
  if (r.truth(((r.get(r.get(s, "poseinfo"), r.get(r.get(s, "tdata"), "pose")) != null)))) {
    await r.write(r.text(r.get(r.get(s, "poseinfo"), r.get(r.get(s, "tdata"), "pose"))));
  } else {
    await r.write(r.text(r.get(r.get(s, "tdata"), "pose")));
  }
  await r.write("</span></td>\r\n\r\n");
return 1;
}
