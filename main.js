function formatBits(bits) {
    const units = ["b", "B", "KB", "MB", "GB", "TB", "PB"];
    let value = bits;
    let index = 0;
    while (
      (index === 0 && value >= 8) ||
      (index > 0 && value >= 1024 && index < units.length - 1)
    ) {
      value = index === 0 ? value / 8 : value / 1024;
      index++;
    }
    return `${value.toFixed(2)} ${units[index]}`;
  }
  
  function saveState() {
    localStorage.setItem("userFiles", JSON.stringify(userFiles));
    localStorage.setItem("currentUser", user);
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
  
  function loadState() {
    const storedFiles = localStorage.getItem("userFiles");
    const storedUser = localStorage.getItem("currentUser");
    const storedGame = localStorage.getItem("gameState");
  
    if (storedFiles) userFiles = JSON.parse(storedFiles);
    if (storedUser) user = storedUser;
    if (storedGame) gameState = JSON.parse(storedGame);
  
    $(".terminal-input .prompt").html(
      `<span class="cmd">${user}</span>@flowiz:~$`,
    );
  }
  
  let hasUserTyped = false;
  let user = "guest";
  let matrixActive = false;
  let gameRunning = false;
  let gameState = {
    bits: 0,
    bitsPerSecond: 1,
    upgrades: 0,
  };
  let userFiles = {
    guest: [
      {
        name: "about.txt",
        text: `I'm Flo. I build cool things, usually in Python, sometimes not.`,
        size: `63B`,
      },
      {
        name: "projects.md",
        text: `# Unfinished Pinball -> [Pinball](<a class="cmd" href="https://flowiz.moe/tilted">https://flowiz.moe/tilted</a>)\n# V1RU5, an idle game -> [V1RU5](<button class="inline-btn cmd-btn" data-cmd="start">[Start Game]</button>)\n# Github -> [Github](<a class="cmd" href="https://github.com/FloTheWiz">FloTheWiz</a>)`,
        size: `153B`,
      },
      {
        name: "secret.txt",
        text: `eheheheheh`,
        size: `98B`,
      },
      {
        name: "art.txt",
        text: `<span class="cmd">Welcome to...</span>\n<br>Ff==  l     /OooO0\n|/    |     0     0\nFf=   l     0     0\nF     7\\    0     0\nF     L7==  \\Oo0oO/<br>t\\--T--/t H   H E3Ee\n    T     H   H E\n    T     HhhhH 3EEe\n    I     h   H E\n    I     H   H 3EE=e<br>W     W     W  1  ZZZZZ\n W   W W   W   I    ZZ\n  W W   W W    I  ZZ\n    W     W      1  ZZZZZ<span class="cmd">'s\n ... website :D</span>`,
        size: `478B`,
      },
    ],
    flo: [
      {
        name: "about.txt",
        text: `You're Flo. You're a wizard. (Daily Affirmations uwu)`,
        size: `38B`,
      },
      {
        name: "secret.txt",
        text: `Either you can read JS or you can use a terminal, either way you're friend :)`,
        size: `96B`,
      },
    ],
  };
  
  const bored = [
    "uhh hello?",
    "anyone home?",
    `it's not that hard just do <span class="cmd">ls</span> and <span class="cmd">cat [file]</span>`,
    "<span class='cmd'>owo </span>",
    "<span class='cmd'>uwu </span>",
    "do <span class='cmd'>adduser yourName </span> to create a user",
    "hi <span class='cmd'>mom!</span>",
  ];
  
  $(document).on("click", ".cmd-btn", function (e) {
    e.preventDefault();
    InputCommand($(this).attr("data-cmd"));
  });
  
  function InputCommand(input) {
    const command = input.trim();
    const $input = $("#command-line");
    $input.val(command);
    $input.trigger($.Event("keypress", { which: 13 }));
  }
  
  $(document).ready(function () {
    loadState();
    
    function startGameLoop() {
      if (gameRunning) return;
      gameRunning = true;
      printResponse("V1RU5 booting up...");
      setInterval(() => {
        gameState.bits += gameState.bitsPerSecond;
        saveState(); //
      }, 1000);
    }
    
    const $output = $("#terminal-output");
    const $input = $("#command-line");
  
    const commands = {
      help: `
  Available commands:
  - help             Show this help menu
  - ls               List files
  - cat [file]       View file contents
  - adduser [name]   Create a new user
  - ??????????       ?????????????????????
  - clear            Clear the terminal
  - reset            Clear website, also cookies
  - sudo             owo
  - matrix           Find out :)
          `,
      sudo: `Permission denied: You are not worthy.\n(Hint: You're not root!)`,
      su: `Welcome home, Admin.`,
    };
  
    function printResponse(text) {
      const lines = text.trim().split("\n");
      for (const line of lines) {
        $output.append(`<p>${line}</p>`);
      }
    }
    if (gameState.bits != 0) { startGameLoop(); }
    function startIdleTimers() {
      hasUserTyped = false;
      helpTimeout = setTimeout(() => {
        if (!hasUserTyped) {
          printResponse(
            `H-hey there, looks like you're uh having some trouble.<br>You can just start typing... Look, here's a help command.`,
          );
          printResponse(commands.help);
          startBoredomLoop();
        }
      }, 10000);
    }
  
    function startBoredomLoop() {
      boredInterval = setInterval(
        () => {
          if (!hasUserTyped) {
            const msg = bored[Math.floor(Math.random() * bored.length)];
            printResponse(`<i class="dim">${msg}</i>`);
          }
        },
        5 * 60 * 1000,
      );
    }
  
    function getUserFiles() {
      return userFiles[user] || [];
    }
  
    function executeCommand(input) {
      if (!input) {
        $output.append(
          `<p><span class="prompt"><span class="cmd">${user}</span>@flowiz:~$</span> ${$("<div>").text(input).html()}</p>`,
        );
        return;
      }
      if (!hasUserTyped) hasUserTyped = true;
  
      const [command, ...args] = input.trim().split(" ");
      const argStr = args.join(" ");
  
      $output.append(
        `<p><span class="prompt"><span class="cmd">${user}</span>@flowiz:~$</span> ${$("<div>").text(input).html()}</p>`,
      );
  
      switch (command) {
        case "clear":
          $output.empty();
          return;
  
        case "ls":
          const files = getUserFiles();
          const maxNameLength = Math.max(
            ...files.map((file) => file.name.length),
          );
          const listing = files
            .map((file) => {
              const paddedName = file.name.padEnd(maxNameLength + 6, " ");
              return `<span class="cmd">${paddedName}</span>${file.size}`;
            })
            .join("\n");
          printResponse(`Do <span class="cmd">cat [file]</span> to read a file.`);
          printResponse(listing);
          return;
  
        case "cat":
          const file = getUserFiles().find((f) => f.name === argStr);
          if (file) {
            printResponse(file.text);
          } else {
            printResponse(`cat: ${argStr}: No such file`);
          }
          return;
  
          case "su":
            let targetUser = args[0] || "flo";
          
            if (!userFiles[targetUser]) {
              printResponse(`su: user ${targetUser} does not exist`);
              return;
            }
          
            user = targetUser;
            $(".terminal-input .prompt").html(
              `<span class="cmd">${user}</span>@flowiz:~$`,
            );
          
            if (user === "flo") {
              printResponse(commands.su);
            } else {
              printResponse(`Switched to user: ${user}`);
            }
          
            saveState();
            return;


        case "whoami": 
          printResponse(user);
          return;
        case "adduser":
          console.log(args);
          if (user !== "flo") {
            printResponse(
              "Permission denied: You are not worthy.\n(Hint: You're not root!)",
            );
            return;
          }
          if (args.length < 1) {
            printResponse("Usage: adduser [username]");
            return;
          }
          const username = args[0];
          if (userFiles.hasOwnProperty(username)) {
            printResponse("User already exists.");
            return;
          }
  
          if (!username || username.toLowerCase() === "flo") {
            printResponse("Invalid username.");
            return;
          }
          user = username;
          userFiles[username] = [
            { name: "secret.txt", text: "Congratulations.", size: "0B" },
          ];
          $(".terminal-input .prompt").html(
            `<span class="cmd">${user}</span>@flowiz:~$`,
          );
          printResponse(`Added user: ${username}`);
          if (!gameRunning) startGameLoop();
          saveState();
          printResponse(`(Saved.)`)
          return;
  
        case "stats":
          if (!gameRunning) {
            printResponse("Pardon?");
            return;
          }
          const bitsFormatted = formatBits(gameState.bits);
          const rateFormatted = formatBits(gameState.bitsPerSecond);
          printResponse(
            `🧠 V1RU5 Status:\n(This is gonna do something soon promise)\nBits: <span class="cmd">${bitsFormatted}</span>\nRate: ${rateFormatted}/s`,
          );
          return;
  
        case "matrix":
          if (!matrixActive) {
            printResponse("Starting Matrix.");
            startMatrixRain();
          } else {
            printResponse(
              "Matrix already running. Press ESC to stop. (or click)",
            );
          }
          return;
  
        case "??????????":
          printResponse("???");
          return;
        case "":
          printResponse("\n");
        case "reset":
          localStorage.clear();
          location.reload();
          return;
        default:
          if (commands[command]) {
            printResponse(commands[command]);
          } else {
            printResponse(
              `command not found: ${command}\nType 'help' to see available commands.`,
            );
          }
          return;
      }
  
      $(".terminal-window").scrollTop($(".terminal-window")[0].scrollHeight);
    }
  
    $input.on("keydown", function (e) {
      hasUserTyped = true;
      if (e.key === "Enter") {
        const cmd = $input.val();
  
        executeCommand(cmd);
        $input.val("");
      }
    });
  
    startIdleTimers();
    function startMatrixRain() {
      matrixActive = true;
      const canvas = document.getElementById("matrix-canvas");
      const ctx = canvas.getContext("2d");
  
      canvas.style.display = "block";
      canvas.width = window.innerWidth * 0.75;
      canvas.height = window.innerHeight;
  
      const letters =
        "アァイィウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789#$%&";
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops = Array(Math.floor(columns)).fill(0);
  
      function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0";
        ctx.font = `${fontSize}px monospace`;
  
        for (let i = 0; i < drops.length; i++) {
          const text = letters[Math.floor(Math.random() * letters.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
  
      const interval = setInterval(drawMatrix, 33);
  
      function stopMatrix() {
        clearInterval(interval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
        matrixActive = false;
        document.removeEventListener("keydown", stopHandler);
        document.removeEventListener("click", stopHandler);
      }
  
      function stopHandler(e) {
        if (e.key === "Escape" || e.type === "click") {
          stopMatrix();
        }
      }
  
      document.addEventListener("keydown", stopHandler);
      document.addEventListener("click", stopHandler);
    }
  });
  
