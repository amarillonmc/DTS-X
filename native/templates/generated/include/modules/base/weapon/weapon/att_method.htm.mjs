// Generated from include/modules/base/weapon/weapon/att_method.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "weapon");
  r.assign(r.slot(s, ["attmethod"]), (await r.module("weapon", "get_attack_method", r.get(s, "sdata"))));
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"z\" style=\"width:98\"  value=\"[Z]");
  await r.write(r.text(r.get(r.get(s, "attinfo"), r.get(s, "attmethod"))));
  await r.write("\" onclick=\"$('command').value='");
  await r.write(r.text(r.get(s, "attmethod")));
  await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  if (r.truth((await r.call("defined", "MOD_DUALWEP")))) {
    (await r.include(r.template("MOD_DUALWEP_SEC_ATT_METHOD"), s));
  }
return 1;
}
