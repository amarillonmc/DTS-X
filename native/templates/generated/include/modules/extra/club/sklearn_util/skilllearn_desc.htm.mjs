// Generated from include/modules/extra/club/sklearn_util/skilllearn_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div id=\"skl_util_");
  await r.write(r.text(r.get(s, "caller_id")));
  await r.write("_skilllearn_");
  await r.write(r.text(r.get(s, "___TEMP_now_skillid")));
  await r.write("\" class=\"skilllearn_desc_container\" style=\"display:none\">\r");
  await r.write(r.text(r.get(s, "showcont")));
  await r.write("</div>");
return 1;
}
