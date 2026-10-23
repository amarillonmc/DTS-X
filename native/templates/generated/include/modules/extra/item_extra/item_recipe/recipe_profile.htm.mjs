// Generated from include/modules/extra/item_extra/item_recipe/recipe_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["learnedrecipes"]), (await r.module("skillbase", "skill_getvalue", 1003, "learnedrecipes")));
  if (r.truth((!r.truth((!r.truth(r.get(s, "learnedrecipes"))))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_recipe\" value=\"配方合成\" onclick=\"$('command').value='recipe';$('subcmd').name='recipe';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
