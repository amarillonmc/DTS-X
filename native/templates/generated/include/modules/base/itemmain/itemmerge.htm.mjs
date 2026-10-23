// Generated from include/modules/base/itemmain/itemmerge.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("你想要做什么？<br>\r\n<input type=\"hidden\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" id=\"cmdspare\" name=\"cmdspare\" value=\"\">\r\n<!-- <input type=\"radio\" name=\"command\" id=\"itemmerge\" value=\"itemmerge\" >\r\n<input type=\"radio\" name=\"command\" id=\"itemmove\" value=\"itemmove\" > -->\r\n请选择合并/移动/丢弃的两个道具：<br><br>\r\n<input type=\"hidden\" name=\"from\" id=\"from\" value=\"0\">\r\n<input type=\"hidden\" name=\"to\" id=\"to\" value=\"0\">\r\n<input type=\"hidden\" name=\"merge1\" id=\"merge1\" value=\"0\">\r\n<input type=\"hidden\" name=\"merge2\" id=\"merge2\" value=\"0\">\r\n<input type=\"hidden\" name=\"judge\" id=\"judge\" value=\"0\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n<div >\r\n    <ul>");
  r.assign(r.slot(s, ["loopn"]), r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
  if (r.truth((await r.call("is_array", r.get(s, "loopn"))))) {
    {
      const a0 = r.copy(r.get(s, "loopn"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["n"]), v0);
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "n")))))) {
          await r.write("        <li style=\"list-style:none\">\r\n            <button type=\"button\" class=\"item_noselecte\"  id=\"item");
          await r.write(r.text(r.get(s, "n")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "n")));
          await r.write("\" empty=\"false\" onclick=itemMoveAndMerge(this);>");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "n"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "n"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "n"))))));
          await r.write("</button><br>\r\n        </li>\r\n            ");
        } else {
          await r.write("        <li style=\"list-style:none\">\r\n            <button type=\"button\"  class=\"item_noselecte\"  id=\"item");
          await r.write(r.text(r.get(s, "n")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "n")));
          await r.write("\" empty=\"true\" onclick=itemMoveAndMerge(this);>空</button><br>\r\n        </li>\r\n            ");
        }
      }
    }
  }
  await r.write("</ul>\r\n</div>\r\n    <div class=\"merge_options\" >\r\n        <div class=\"option1\" style=\"width: 78%;\">\r\n            <p class=\"merge_text\">单个选中后可以点击该按钮进行丢弃</p>\r\n            <button type=\"button\" class=\"item_drop\"  onclick=itemDrop();>丢弃</button>\r\n        </div>\r\n        <div class=\"option2\" style=\"width: 100%;display:none\">\r\n            <p class=\"merge_text\">选中的物品有合并的可能，请选择合并或者移动</p>\r\n            <button type=\"button\" class=\"to_merge\" onclick=\"toMerge();\">合并</button>\r\n            <button type=\"button\" class=\"to_move\" onclick=\"toMove();\">移动</button>\r\n        </div>\r\n    </div>\r\n</div>\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('cmdspare').name='command';$('cmdspare').value='menu';$('command').value='';postCmd('gamecmd','command.php');this.disabled=true;exchange=[];drop = 0;\">");
return 1;
}
