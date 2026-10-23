// Static native page from updatelist.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "updatelist"));
  (await r.nativeInclude("request-bootstrap", s));
  if (r.truth((!r.truth(r.get(s, "y"))))) {
    (await r.include(r.template("updatelist_container"), s, false));
  } else {
    if (r.truth(r.get(s, "y"))) {
      r.assign(r.slot(s, ["gamedata"]), r.array([]));
      if (r.truth((await r.call("in_array", r.get(s, "y"), r.array([[r.APPEND, "2024"], [r.APPEND, "2023"], [r.APPEND, "2018"], [r.APPEND, "2017"], [r.APPEND, "2016"]]))))) {
        (await r.call("ob_start"));
        (await r.include(r.template((r.text("updatelist_") + r.text(r.get(s, "y")))), s, false));
        r.assign(r.slot(s, ["gamedata", "innerHTML", (r.text("cont") + r.text(r.get(s, "y")))]), (await r.call("ob_get_contents")));
        (await r.call("ob_clean"));
        (await r.call("ob_end_flush"));
        if (r.truth(((r.get(s, "error") != null)))) {
          r.assign(r.slot(s, ["gamedata", "innerHTML", "error"]), r.get(s, "error"));
        }
        r.assign(r.slot(s, ["jgamedata"]), (await r.call("gencode", r.get(s, "gamedata"))));
        await r.write(r.text(r.get(s, "jgamedata")));
      }
    }
  }
  return null;
}
