// Generated from include/modules/base/itemmain/itmcommand_subpage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("DUMMY");
return 1;
}
