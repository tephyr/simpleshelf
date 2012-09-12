function(new_doc, old_doc, userCtx) {
  if(!userCtx || userCtx.name === "demouser") {
      throw({forbidden: "User not allowed to add or edit documents."});
  }
}
