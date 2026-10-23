// Generated from include/modules/extra/item_extra/item_recipe/choose_recipe.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"recipe\">\r\n<input type=\"hidden\" id=\"recipe_choice\" name=\"recipe_choice\" value='0'>\r\n请选择配方：<br><br>");
  r.assign(r.slot(s, ["ls"]), (await r.module("item_recipe", "get_learned_recipes")));
  if (r.truth((!r.truth(r.get(s, "ls"))))) {
    await r.write("<span class=\"yellow b\">你并没有学会任何配方。</span><br>");
  } else {
    await r.write(" ");
    r.assign(r.slot(s, ["recipe_mixinfo"]), (await r.module("item_recipe", "get_recipe_mixinfo")));
    if (r.truth((await r.call("is_array", r.get(s, "ls"))))) {
      {
        const a0 = r.copy(r.get(s, "ls"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
          await r.write(r.text(r.get(r.get(r.get(r.get(s, "recipe_mixinfo"), r.get(s, "i")), "result"), "0")));
          await r.write("\" style=\"width: 200px;\" onclick=\"$('recipe_choice').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
        }
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
