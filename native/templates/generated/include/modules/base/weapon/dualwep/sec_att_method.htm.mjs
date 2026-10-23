// Generated from include/modules/base/weapon/dualwep/sec_att_method.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "dualwep");
  r.assign(r.slot(s, ["secattmethod"]), (await r.module("dualwep", "get_sec_attack_method", r.get(s, "sdata"))));
  if (r.truth((!r.equal(r.get(s, "secattmethod"), "")))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" style=\"width:98\"  value=\"");
    await r.write(r.text(r.get(r.get(s, "attinfo"), r.get(s, "secattmethod"))));
    await r.write("\" onclick=\"$('command').value='");
    await r.write(r.text(r.get(s, "secattmethod")));
    await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  await r.write("   \r\n");
return 1;
}
