// Generated from templates/default/register.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" align=\"center\">账号注册</div>\r\n\r\n<p align=\"center\">\r\n<span id=\"notice\"></span>\r\n<span id=\"info\" class=\"yellow b\"></span>\r\n</p>\r\n<center>\r\n<form method=\"post\" id=\"reg\" name=\"reg\">\r\n<input type=\"hidden\" name=\"cmd\" value=\"post_register\">\r\n<input type=\"hidden\" id=\"register_token\" name=\"register_token\" value=\"");
  await r.write(r.text(r.get(s, "register_token")));
  await r.write("\">\r\n<span class =\"yellow b\">账户基本资料</span>");
  (await r.include(r.template("userbasicdata"), s));
  await r.write("<br />\r\n<span class =\"yellow b\">账户个性化资料</span>");
  (await r.include(r.template("usergdicon"), s));
  await r.write("<br />");
  (await r.include(r.template("userwords"), s));
  await r.write("<br />");
  if (r.truth((!r.truth((!r.truth(r.get(s, "vq_question_arr"))))))) {
    await r.write("<div>\r\n<span class =\"yellow b\">验证问题</span><br />\r\n<span class =\"b\">以下词句来自帮助文档，其中一个选项填入空缺中能得到通顺的语句，其他选项则是随机生成的。<br>请选出最适合填入空缺的选项：</span><br /><br />\r\n<span class=\"grey b\">『</span><span class =\"evergreen b\" id=\"vq_question\">");
    await r.write(r.text(r.get(r.get(s, "vq_question_arr"), "question")));
    await r.write("</span><span class=\"grey b\">』</span><br /><br />");
    if (r.truth((await r.call("is_array", r.get(r.get(s, "vq_question_arr"), "answers"))))) {
      {
        const a0 = r.copy(r.get(r.get(s, "vq_question_arr"), "answers"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), k0);
          r.assign(r.slot(s, ["v"]), v0);
          await r.write("</span><input type=\"radio\" class=\"radio_comb\" id=\"vq_answer");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" name=\"vq_answer\" value=\"");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"$('vq_answer");
          await r.write(r.text(r.get(s, "i")));
          await r.write("').click()\" id=\"vq_answer_disp");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\">");
          await r.write(r.text(r.get(s, "v")));
          await r.write("</a>&nbsp;&nbsp;&nbsp;</span>");
        }
      }
    }
    await r.write("<br />\r\n</div>");
  }
  await r.write("<br />\r\n<div id=\"postreg\">\r\n<input type=\"submit\" class=\"b_button bc_white\" id=\"post\" onClick=\"postCmd('reg','register.php');return false;\" value=\"提交\">\r\n<input type=\"reset\" class=\"b_button bc_white\" id=\"reset\" name=\"reset\" value=\"重设\">\r\n</div>\r\n</form>\r\n</center>\r\n<br />");
  (await r.include(r.template("footer"), s));
return 1;
}
