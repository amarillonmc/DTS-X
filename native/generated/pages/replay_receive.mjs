// Static native page from replay_receive.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("ignore_user_abort", 1));
  (await r.call("define", "CURSCRIPT", "replay_receive"));
  (await r.call("define", "IN_GAME", true));
  (r.truth((await r.call("defined", "GAME_ROOT"))) || r.truth((await r.call("define", "GAME_ROOT", (r.text((await r.call("dirname", "replay_receive.php"))) + r.text("/"))))));
  (await r.nativeInclude("request-bootstrap", s));
  (await r.nativeInclude("runtime-configuration", s));
  (await r.nativeInclude("runtime-configuration", s));
  r.assign(r.slot(s, ["valid"]), false);
  if (r.truth((r.truth(((r.get(r.get(r.globals, "_POST"), "sign") != null))) && r.truth(((r.get(r.get(r.globals, "_POST"), "pass") != null)))))) {
    {
      const a1 = r.copy(r.get(s, "replay_receive_list"));
      loop0: for (const [k1, v1] of r.entries(a1)) {
      r.assign(r.slot(s, ["rs"]), k1);
        r.assign(r.slot(s, ["rp"]), v1);
        if (r.truth((r.truth(r.identical(r.get(s, "rs"), r.get(r.get(r.globals, "_POST"), "sign"))) && r.truth(r.identical(r.get(s, "rp"), r.get(r.get(r.globals, "_POST"), "pass")))))) {
          r.assign(r.slot(s, ["valid"]), true);
          break loop0;
        }
      }
    }
  }
  if (r.truth((r.truth((!r.truth(r.get(s, "valid")))) && r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "storage_req"))))) {
    r.exit("Invalid Sign");
  }
  if (r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "storage_req"))) {
    r.assign(r.slot(s, ["objdir"]), (await r.call("dir_init", "./gamedata/remote_replays")));
    r.assign(r.slot(s, ["objdir2"]), r.get(r.get(r.globals, "_POST"), "sign"));
    (await r.call("dir_init", (r.text((r.text(r.get(s, "objdir")) + r.text("/"))) + r.text(r.get(s, "objdir2")))));
    r.assign(r.slot(s, ["objdir3"]), (await r.call("str_replace", ".dat", "", r.get(r.get(r.globals, "_POST"), "filename"))));
    (await r.call("dir_init", (r.text((r.text((r.text((r.text(r.get(s, "objdir")) + r.text("/"))) + r.text(r.get(s, "objdir2")))) + r.text("/"))) + r.text(r.get(s, "objdir3")))));
    r.assign(r.slot(s, ["objfile"]), (r.text((r.text((r.text((r.text((r.text((r.text(r.get(s, "objdir")) + r.text("/"))) + r.text(r.get(s, "objdir2")))) + r.text("/"))) + r.text(r.get(s, "objdir3")))) + r.text("/"))) + r.text(r.get(r.get(r.globals, "_POST"), "filename"))));
    if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(r.globals, "_POST"), "no-overlap")))))) && r.truth((await r.call("file_exists", r.get(s, "objfile"))))))) {
      r.exit((r.text(r.get(r.get(r.globals, "_POST"), "filename")) + r.text(" has already existed.")));
    }
    r.assign(r.slot(s, ["callbackurl"]), r.get(r.get(r.globals, "_POST"), "callurl"));
    r.assign(r.slot(s, ["context"]), r.array([["cmd", "storage_callback"], ["filename", r.get(r.get(r.globals, "_POST"), "filename")]]));
    r.assign(r.slot(s, ["content"]), (await r.call("curl_post", r.get(s, "callbackurl"), r.get(s, "context"))));
    if (r.truth((!r.truth(r.get(s, "content"))))) {
      r.exit("Some error occurred.");
    } else {
      (await r.call("file_put_contents", r.get(s, "objfile"), r.get(s, "content")));
    }
    r.assign(r.slot(s, ["datalibcont"]), "");
    r.assign(r.slot(s, ["datalibname"]), (r.truth((!r.truth((!r.truth(r.get(r.get(r.globals, "_POST"), "datalibname")))))) ? r.get(r.get(r.globals, "_POST"), "datalibname") : ""));
    if (r.truth(r.get(s, "datalibname"))) {
      r.assign(r.slot(s, ["context"]), r.array([["cmd", "storage_callback_datalib"], ["datalibname", r.get(s, "datalibname")]]));
      r.assign(r.slot(s, ["datalibcont"]), (await r.call("curl_post", r.get(s, "callbackurl"), r.get(s, "context"))));
      r.assign(r.slot(s, ["objdir_datalib"]), (await r.call("dir_init", (r.text((r.text((r.text(r.get(s, "objdir")) + r.text("/"))) + r.text(r.get(s, "objdir2")))) + r.text("/datalib")))));
      r.assign(r.slot(s, ["objfile_datalib"]), (r.text((r.text(r.get(s, "objdir_datalib")) + r.text("/"))) + r.text(r.get(s, "datalibname"))));
      (await r.call("file_put_contents", (await r.call("str_replace", ".dat", ".datalib.txt", r.get(s, "objfile"))), r.get(s, "datalibname")));
      if (r.truth((!r.truth((await r.call("file_exists", r.get(s, "objfile_datalib"))))))) {
        (await r.call("file_put_contents", r.get(s, "objfile_datalib"), r.get(s, "datalibcont")));
      }
    }
    await r.write(r.text("Successfully Received."));
  } else {
    if (r.truth((r.truth((r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "loadrep")) || r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "checkdatalib")))) || r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "loaddatalib"))))) {
      r.assign(r.slot(s, ["objdir"]), (r.text((r.text((r.text("./gamedata/remote_replays/") + r.text(r.get(r.get(r.globals, "_POST"), "sign")))) + r.text("/"))) + r.text((await r.call("str_replace", ".dat", "", r.get(r.get(r.globals, "_POST"), "filename"))))));
      r.assign(r.slot(s, ["objfile"]), (r.text((r.text(r.get(s, "objdir")) + r.text("/"))) + r.text(r.get(r.get(r.globals, "_POST"), "filename"))));
      if (r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "checkdatalib"))) {
        r.assign(r.slot(s, ["objfile"]), (await r.call("str_replace", ".dat", ".datalib.txt", r.get(s, "objfile"))));
      } else {
        if (r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "loaddatalib"))) {
          r.assign(r.slot(s, ["objfile"]), (r.text((r.text((r.text("./gamedata/remote_replays/") + r.text(r.get(r.get(r.globals, "_POST"), "sign")))) + r.text("/datalib/"))) + r.text(r.get(r.get(r.globals, "_POST"), "filename"))));
        }
      }
      if (r.truth((await r.call("file_exists", r.get(s, "objfile"))))) {
        (await r.call("ob_clean"));
        await r.write(r.text((await r.call("file_get_contents", r.get(s, "objfile")))));
      } else {
        await r.write(r.text((r.text(r.get(s, "objfile")) + r.text(" does not exist. "))));
      }
    } else {
      if (r.truth(r.identical((await r.call("strpos", r.get(r.get(r.globals, "_POST"), "cmd"), "storage_callback")), 0))) {
        if (r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "storage_callback"))) {
          r.assign(r.slot(s, ["objfile"]), (r.text("./gamedata/replays/") + r.text(r.get(r.get(r.globals, "_POST"), "filename"))));
        } else {
          if (r.truth(r.equal(r.get(r.get(r.globals, "_POST"), "cmd"), "storage_callback_datalib"))) {
            r.assign(r.slot(s, ["objfile"]), (r.text("./gamedata/javascript/") + r.text(r.get(r.get(r.globals, "_POST"), "datalibname"))));
          }
        }
        if (r.truth((await r.call("file_exists", r.get(s, "objfile"))))) {
          (await r.call("ob_clean"));
          await r.write(r.text((await r.call("file_get_contents", r.get(s, "objfile")))));
        } else {
          await r.write(r.text((r.text(r.get(s, "objfile")) + r.text(" does not exist. "))));
        }
      } else {
        await r.write(r.text("Bad command"));
      }
    }
  }
  return null;
}
