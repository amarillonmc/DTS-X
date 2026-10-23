// Generated from include/modules/extra/club/skills/skill262/sk262ui.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "player");
  await r.write("你正在默默积蓄力量！<br>\r\n<span style=\"height:8px; display:block;\">&nbsp;</span>\r\n<div id=\"progressbar-border\">\r\n<div id=\"progressbar-inner3\"></div><div id=\"progressbar-text3\">0%</div>\r\n</div>   \r\n<span style=\"height:5px; display:block;\">&nbsp;</span>\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"\r\nxuli_setpercentage(0);\r\nxuli_tick = 0;\r\nxuli_pret = ");
  await r.write(r.text((await r.call("round", r.subtract(r.divide((await r.module("skill262", "skill262_get_pretime", r.get(s, "sdata"))), 100), 5)))));
  await r.write(";\r\nxuli_maxt = ");
  await r.write(r.text((await r.call("round", r.multiply(r.divide((await r.module("skill262", "skill262_get_maxdmgperc", r.get(s, "sdata"))), (await r.module("skill262", "skill262_get_dmgperc", r.get(s, "sdata")))), 10)))));
  await r.write(";\r\nif (xuli_flag==0)\r\n{\r\nxuli_flag = 1;\r\nsetInterval('xuli_tickfunc()',100);\r\n}\r\n\">\r\n");
return 1;
}
