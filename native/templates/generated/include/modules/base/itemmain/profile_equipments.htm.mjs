// Generated from include/modules/base/itemmain/profile_equipments.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<TABLE border=\"0\" cellSpacing=0 cellPadding=0 height=100% width=100%>\r\n<TR>\r\n<TD class=b1 width=\"60\"><span>装备种类</span></TD>\r\n<TD class=b1><span>名称</span></TD>\r\n<TD class=b1 width=\"70\"><span>属性</span></TD>\r\n<TD class=b1 width=\"40\"><span>效</span></TD>\r\n<TD class=b1 width=\"40\"><span>耐</span></TD>\r\n</tr>");
  if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
    (await r.include(r.template("MOD_WEAPON_PROFILE_WEP"), s));
  }
  if (r.truth((await r.call("defined", "MOD_ARMOR")))) {
    (await r.include(r.template("MOD_ARMOR_PROFILE_ARMOR"), s));
  }
  if (r.truth((await r.call("defined", "MOD_ARMOR_ART")))) {
    (await r.include(r.template("MOD_ARMOR_ART_PROFILE_ARMOR_ART"), s));
  }
  await r.write("</table>");
return 1;
}
