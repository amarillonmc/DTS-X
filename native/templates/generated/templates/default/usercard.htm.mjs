// Generated from templates/default/usercard.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table align=\"center\" CellSpacing=0 CellPadding=1 width=\"250\" height=\"260\">\r\n<tr height=\"40\">\r\n<td class=b2 width=\"40\" height=\"40\">卡名</td>\r\n<td id=\"cname\" class=b3 width=\"210\" height=\"40\">");
  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cardChosen")), "name")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"40\">\r\n<td class=b2 width=\"40\" height=\"40\">罕贵</td>\r\n<td id=\"crare\" class=b3 width=\"210\" height=\"40\"><span class=\"");
  await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(s, "cardChosen")), "rare"))));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cardChosen")), "rare")));
  await r.write("</span></td>\r\n</tr>\r\n<tr height=\"40\">\r\n<td class=b2 width=\"40\" height=\"40\">系列</td>\r\n<td id=\"cpack\" class=b3 width=\"210\" height=\"40\">");
  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cardChosen")), "pack")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"70\">\r\n<td class=b2 width=\"40\" height=\"70\">介绍</td>\r\n<td id=\"cdesc\" class=b3 width=\"210\" height=\"70\">");
  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cardChosen")), "desc")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"70\">\r\n<td class=b2 width=\"40\" height=\"70\">效果</td>\r\n<td id=\"ceffect\" class=b3 width=\"210\" height=\"70\">");
  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cardChosen")), "effect")));
  await r.write("</td>\r\n</tr>\r\n</table>");
return 1;
}
