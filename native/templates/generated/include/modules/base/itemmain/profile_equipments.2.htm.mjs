// Generated from include/modules/base/itemmain/profile_equipments.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack packtitle itmk\" style=\"margin-left:5px\">\r\n装备种类\r\n</div><div class=\"profile_bar pack packtitle itmname\">\r\n名称\r\n</div><div class=\"profile_bar pack packtitle itmsk\">\r\n属性\r\n</div><div class=\"profile_bar pack packtitle itme\">\r\n效果值\r\n</div><div class=\"profile_bar pack packtitle itms\">\r\n耐久值\r\n</div>\r\n</div>");
  if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
    (await r.include(r.template("MOD_WEAPON_PROFILE_WEP"), s));
  }
  if (r.truth((await r.call("defined", "MOD_ARMOR")))) {
    (await r.include(r.template("MOD_ARMOR_PROFILE_ARMOR"), s));
  }
  if (r.truth((await r.call("defined", "MOD_ARMOR_ART")))) {
    (await r.include(r.template("MOD_ARMOR_ART_PROFILE_ARMOR_ART"), s));
  }
return 1;
}
