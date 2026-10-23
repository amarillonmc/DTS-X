// Generated from img/index.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\">\r\n<HTML>\r\n<HEAD><META http-equiv=refresh content=0;url=http://on.to/2Y></HEAD>\r\n<BODY></BODY>\r\n</HTML>\r\n");
return 1;
}
