fetch("https://sges.getalma.com/account/reset-password", {
    "credentials":"include",
    "headers":{
        "accept":"*/*","accept-language":"en-US,en;q=0.9","content-type":"application/json","x-requested-with":"XMLHttpRequest"
    },
    "referrer":"https://sges.getalma.com/parent/5d0229a6749ea43b46610e40/bio",
    "referrerPolicy":"no-referrer-when-downgrade",
    "body":"{\"Username\":\"todd.allain\",\"EmailAddress\":\"allaintt@aol.com\"}",
    "method":"POST",
    "mode":"cors"});

    fetch("https://sges.getalma.com/student/5d67e14d70a9a1462f24cdc3/save-note", {"credentials":"include","headers":{"accept":"*/*","accept-language":"en-US,en;q=0.9","content-type":"application/json","sec-fetch-mode":"cors","sec-fetch-site":"same-origin","x-requested-with":"XMLHttpRequest"},"referrer":"https://sges.getalma.com/student/5d67e14d70a9a1462f24cdc3/notes","referrerPolicy":"no-referrer-when-downgrade","body":"{\"UserId\":\"5d67e14d70a9a1462f24cdc3\",\"RoleId\":\"20\",\"Note\":\"Delete me\"}","method":"POST","mode":"cors"});