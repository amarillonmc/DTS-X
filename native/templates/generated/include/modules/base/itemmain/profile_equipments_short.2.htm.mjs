// Generated from include/modules/base/itemmain/profile_equipments_short.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack packtitle itmname forshort\">\r\n当前装备\r\n</div><div class=\"glow_buttons yellow profile_mode_button\" onclick=\"profile_mode_switch();\"><></div>\r\n</div>");
  if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
    (await r.include(r.template("MOD_WEAPON_PROFILE_WEP_SHORT"), s));
  }
  if (r.truth((await r.call("defined", "MOD_ARMOR")))) {
    (await r.include(r.template("MOD_ARMOR_PROFILE_ARMOR_SHORT"), s));
  }
  if (r.truth((await r.call("defined", "MOD_ARMOR_ART")))) {
    (await r.include(r.template("MOD_ARMOR_ART_PROFILE_ARMOR_ART_SHORT"), s));
  }
return 1;
}
