/*
flowiz.moe main file - Flo the Wizard

                \||/
                |  @___oo
      /\  /\   / (__,,,,|
     ) /^\) ^\/ _)
     )   /^\/   _)
     )   _ /  / _)
 /\  )/\/ ||  | )_)
<  >      |(,,) )__)
 ||      /    \)___)\
 | \____(      )___) )___
  \______(_______;;; __;;;
|                           |
|=#=#=#=#=#=#=#=#=#=#=#=#=#=|
|===========================|
|     Here Be Dragons       |
|===========================|
|    You have been warned   |
|VVVVVVVVVVVVVVVVVVVVVVVVVVV|
*/
CREDITS = `
This website is made and maintained by <span class="cmd">Florence the Wizard.</span>
Contact is <span class="g">@f.l.0</span> on discord.
Special thanks to my partner, <span class="cmd">Ibble</span> and our dog, <span class="cmd">Millie</span>. 
Thank you and love to my friends at <span class="cmd">Lazy Devs</span> and <span class="cmd">Dashnet Forums</span>.
And thank <span class="cmd">You</span>, for being brave enough to explore code!

<span class="cmd">I love you all! :)</span>

`
VERSION = "0.1.3"
VERSION_STR = "Barely getting started."

function formatBits(bits) {
  // MMMMMMM Delicious. 
  const units = ["b", "B", "KB", "MB", "GB", "TB", "PB"];
  let value = bits;
  let index = 0;
  console.log(bits, index);
  while (
    (index === 0 && value >= 8) ||
    (index > 0 && value >= 1024 && index < units.length - 1)
  ) {
    value = index === 0 ? value / 8 : value / 1024;
    index++;
  }
  console.log(value, units[index]);
  return `${value.toFixed(2)} ${units[index]}`;
}
function updateDriveUI() {
  const used = gameState.bits;
  const total = gameState.driveCapacity;
  const pct = Math.min(100, (used / total) * 100);
  if (!gameRunning) { 
    $("#drive-ui").css("opacity", 0);
    return;
  }
  ///console.log("Used", used)
  $("#drive-used").text(formatBits(used));
  ///console.log("Total", total)
  $("#drive-capacity").text(formatBits(total));
  $("#drive-bar").css("width", `${pct}%`);
}

let hasUserTyped = false;
let user = "guest";
let matrixActive = false;
let gameRunning = false;
let preemptive = 0;

let gameState = {
  bitsPerSecond: 0, 
  driveCapacity: 1024 * 1024 * 100,
  bits: 0, 
  generators: [],
  achievements: {},
};


// At the moment a bit boring. 
// Maybe one that grows over time?
// Per commands? 
// 
const fileGenerators = [
  {
    name: "log.dat",
    rate: 1, 
    cost: 20,
    desc: [
      'An unassuming log file, quietly collecting keystrokes since 1997.',
      'A blank file, supposedly.',
      'Contains exactly 1 line: "Help".'
    ]
  },
  {
    name: "temp.sys",
    rate: 8,
    cost: 150,
    desc: [
      'Definitely not temporary.',
      'Scheduled for deletion... since 2007.',
      'Last seen merging with the kernel',
      'Why does a temporary file need root access?',
      'Running in the background. Forever.'
    ]
    },
  {
    name: "tracker.bak",
    rate: 64,
    cost: 1000,
    desc: [
      'Backed up. Tracked. Repeated.',
      'It\'s watching your cursor right now.',
      'Whispers to your RAM at night.',
      'Keeps a list of every file you\'ve ever opened',
      'Bak doesn\'t stand for backup. It stands for backlash.',
      'Connected to three unknown IPs.',
      'One Byte short of sanity'
    ]
  },
];


const achievements = [
  {
    id: "root",
    name: "Become Root",
    desc: "Despite all odds. You made it.\n<span class='cmd'>(+10 bits)</span>",
    hint: "Flo thought su stood for \"Super User\".",
    check: () => user === "root",
    reward: () => {
      gameState.bits += 10;
    }
  },
  {
    id: "matrix",
    name: "Enter The Matrix",
    desc: "Red pill. Blue pill. <span class='cmd'>buffer overflow</span>.\n<span class='cmd'>(+16 bits)</span>",
    hint: "This one is in the help command.",
    check: () => matrixActive === true,
    reward: () => {
      gameState.bits += 16;
    }
  },
  {
    id: "start",
    name: "Game time started.",
    desc: `Holy shit you did it.\n<span class='cmd'>(+16 bits)</span>`,
    hint: "There's like a million ways to do this.",
    check: () => gameRunning === true,
    reward: () => {
      gameState.bits += 16
    },
  },
  {
    id: "boredom",
    name: "Hello?",
    desc: "Trigger a bored message. Someone’s watching.\n<span class='cmd'>(+128 bits)</span>",
    hint: "You don't have to do anything.",
    check: () => gameState.achievements["boredom"] !== true && hasUserTyped === false,
    reward: () => {
      gameState.bits += 128
      
    },
  },
  {
    id: "overflow",
    name: "Bit Overflow",
    desc: "You filled the drive.\nHope you like <i>corruption</i>.\n(Unlocks: <span class='cmd'>Prestiging</span>)",
    hint: "... What drive?",
    check: () => gameState.bits >= gameState.driveCapacity,
    reward: () => {
      gameState.bits = gameState.driveCapacity;
    },
  },
  {
    id: "firstbuy",
    name: "Impulse Buyer",
    desc: "You bought something.\nCapitalism wins again.",
    hint: "See if you can afford anything in the shop.",
    check: () => gameState.generators.length > 0,
    reward: () => {},
  },

  {
    id: "adduser",
    name: "Welcome, User",
    desc: "You added a new user.\nHope they’re not watching.\n<span class='cmd'>(+16 bits)</span>",
    hint: "I wonder what the command to add another user might be.",
    check: () => Object.keys(userFiles).length > 2,
    reward: () => {
      gameState.bits += 16
    },
  },
  {
    id: "sudo",
    name: "Super User Mode",
    desc: "Root access granted. It's lonely up here.\n<span class='cmd'>(+32 bits)</span>",
    hint: "What if you were root *and* used sudo?",
    check: () => 1===2,
    reward: () => {
      gameState.bits += 32;
    }
  },
  {
    id: "who",
    name: "My name is...",
    desc: "Chika Chika Slim Shady?\n<span class='cmd'>(+16 bits)</span>",
    hint: "Who are you?",
    check: () => 1===2,
    reward: () => {
      gameState.bits += 16
    }
  },
];


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
  root: [
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
    {
      name: "whatnow.md",
      text: "<span class='red'>So... You've made it this far. Can you add your own user account?</span>",
      size: `63B`,
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



function InputCommand(input) {
  const command = input.trim();
  const $input = $("#command-line");
  $input.val(command);
  $input.trigger($.Event("keypress", { which: 13 }));
}
 
// 82 fucking lines in. 
// oh how the times change (270)
/// COMMAND FUNCTIONALITY
//
/*

               _     __,..---""-._                 ';-,
        ,    _/_),-"`             '-.                `\\
       \|.-"`    -_)                 '.                ||
       /`   a   ,                      \              .'/
       '.___,__/                 .-'    \_        _.-'.'
          |\  \      \         /`        _`""""""`_.-'
             _/;--._, >        |   --.__/ `""""""`
           (((-'  __//`'-......-;\      )
                (((-'       __//  '--. /
                          (((-'    __//
                                 (((-'



*/
$(document).ready(function () {
  const commands = {
    help: `
  Available commands:
  - help             Show this help menu
  - ls               List files
  - cat [file]       View file contents
  - adduser [name]   Create a new user
  - ??????????       ?????????????????????
  - clear            Clear the terminal
  - reset            Clear website, also save
  - sudo             owo
  - matrix           Find out :)
          `,
    sudo: `Permission denied: You are not worthy.\n(Hint: You're not root!)`,
    su: `Welcome home, Admin.`,
    shop: `Use <span class="cmd">buy [index]</span> to purchase a generator.\nGenerators create data every second.`,

  };


  function saveState() { // This doesn't NEED to be in this function
    // Could be a modular design based on keys etc but this keeps order.
    localStorage.setItem("userFiles", JSON.stringify(userFiles));
    localStorage.setItem("currentUser", user);
    localStorage.setItem("gameState", JSON.stringify(gameState));
    localStorage.setItem("lastPlayedTime", Date.now());
    console.log("Saved state");
  }
  
  function loadState() {
    const storedFiles = localStorage.getItem("userFiles");
    const storedUser = localStorage.getItem("currentUser");
    const storedGame = localStorage.getItem("gameState");
    const lastPlayed = parseInt(localStorage.getItem("lastPlayedTime") || 0);
  
    if (storedFiles) userFiles = JSON.parse(storedFiles);
    if (storedUser) user = storedUser;
    if (storedGame) gameState = JSON.parse(storedGame);
    if (storedGame) console.log("Found a Save. Loading.")
    // Calculate offline bits earned
    if (lastPlayed && gameState.bitsPerSecond) { // However....

      const now = Date.now();
      const secondsOffline = Math.floor((now - lastPlayed) / 1000);
      const earnedOffline = secondsOffline * gameState.bitsPerSecond;
      gameState.bits += earnedOffline;
      
      printResponse(
        `<i class="dim">Recovered <span class="cmd">${formatBits(earnedOffline)}</span> while you were gone...</i>`
      );

      startGameLoop();
    }
  
    $(".terminal-input .prompt").html(
      `<span class="cmd">${user}</span>@flowiz:~$`
    );
  }
  
  $(document).on("click", ".cmd-btn", function (e) { //  Start button.
    e.preventDefault();
    if (!gameRunning){
      startGameLoop();
      userFiles['guest'].push({ name: "secret.txt", text: "Congratulations.", size: "0B" });
    }
  });

  // Game loop owo
  /*


  */
  function startGameLoop() {
    if (gameRunning) return;
    console.log("Starting game loop");
    gameRunning = true;
    $("#drive-ui").css("opacity", 1);
    commands.help = `
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
  
  - stats            See V1RU5 stats.
  - shop             See the shop  
  - buy [index]      Buy a generator
  - ach              See Achievements
    `
    printResponse("<span class='red'>V1RU5</span> booting up...\nThe <span class='cmd'>help</span> command has been updated.");
    requestAnimationFrame(gameLoop);
  }
  let lastTick = Date.now();

  function gameLoop() {
    if (!gameRunning) return;
  
    const now = Date.now();
    const delta = (now - lastTick) / 1000;
  
    if (delta >= 1) {
      const bps = gameState.generators.reduce((sum, g) => sum + g.rate, 0);
      gameState.bitsPerSecond = bps;
  
      const added = Math.min(bps * delta, gameState.driveCapacity - gameState.bits);
      gameState.bits += added;
  
      if (added > 0) {
        updateSecretFileDisplay();
        updateDriveUI();

      }
  
      lastTick = now;
      checkAchievements();
      saveState();
    }
  
    requestAnimationFrame(gameLoop);
  }
  

  const $output = $("#terminal-output");
  const $input = $("#command-line");

  loadState();
  updateDriveUI();

  function checkAchievements() {
    achievements.forEach((ach) => {
      // ensure gameState.achievements exists
      if (!gameState.achievements) gameState.achievements = {};
      if (!gameState.achievements[ach.id] && ach.check()) {
        gameState.achievements[ach.id] = true;
        printResponse(`Achievement unlocked: <span class="g">${ach.name}</span>\n<i>${ach.desc}</i>`);
        if (ach.reward) ach.reward();
      }
    });
  }
  function unlockAchievement(id) {
    const a = achievements.find(a => a.id === id);
    if (!a || gameState.achievements[id]) return; // already unlocked or doesn't exist
    a.reward();
    gameState.achievements[id] = true;
    printResponse(`Achievement Unlocked: <span class="g">${a.name}\n<i>${a.desc}</i>`);
  }
  


  function printResponse(text) {
    const lines = text.trim().split("\n");
    for (const line of lines) {
      $output.append(`<p>${line}</p>`);
    }
  }
  // If we found save data, begin game loop
 

  function updateSecretFileDisplay() {
    const files = getUserFiles();
    const secret = files.find(f => f.name === "secret.txt");
  
    if (secret) {
      secret.size = formatBits(gameState.bits);
      secret.text = `Virus detected...\nTotal infected: ${formatBits(gameState.bits)}`;
    }
  }
  function startIdleTimers() {
    // These "help" new players if they haven't typed.
    hasUserTyped = false;
    helpTimeout = setTimeout(() => {
      if (!hasUserTyped) {
        printResponse(
          `<span class="dim">H-hey there, looks like you're uh having some trouble.<br>You can just start typing... Look, here's a help command.</span>`,
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
        unlockAchievement("boredom")
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
    // this... is a monster of a switch statement. (⇀‸↼‶)⊃━☆ﾟ.*･｡ﾟ 
    switch (command) {
      case "clear":
        $output.empty();
        break;

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
        break;

      case "cat":
        const file = getUserFiles().find((f) => f.name === argStr);
        if (file) {
          printResponse(file.text);
        } else {
          printResponse(`cat: ${argStr}: No such file`);
        }
        break;

      case "su":
        let targetUser = args[0] || "root";

        if (!userFiles[targetUser]) {
          printResponse(`su: user ${targetUser} does not exist`);
          break;
        }

        user = targetUser;
        $(".terminal-input .prompt").html(
          `<span class="cmd">${user}</span>@flowiz:~$`,
        );

        if (user === "root") {
          unlockAchievement("root");
          printResponse(commands.su);
        } else {
          printResponse(`Switched to user: ${user}`);
        }

        //saveState();
        break;

      case "sudo":
        if (user === "root") { 
          unlockAchievement("sudo")
          printResponse("Oh no...")
        }
        else {
          printResponse(commands.sudo)
        }
        break;

      case "whoami":
        printResponse(user);
        unlockAchievement("who")
        break;

      case "adduser":
        console.log(args);
        if (user !== "root") {
          printResponse(
            "Permission denied: You are not worthy.\n(Hint: You're not root!)",
          );
          break;
        }
        if (args.length < 1) {
          printResponse("Usage: adduser [username]");
          break;
        }
        const username = args[0];
        if (userFiles.hasOwnProperty(username)) {
          printResponse("User already exists.");
          break;
        }

        if (!username || username.toLowerCase() === "root") {
          printResponse("Invalid username.");
          break;
        }

        if (!gameRunning){
          startGameLoop();
          printResponse(`Added user: ${username}`);
          user = username;
          $(".terminal-input .prompt").html(
            `<span class="cmd">${user}</span>@flowiz:~$`,
          );
          updateDriveUI();
          userFiles[username] = [
            { name: "secret.txt", text: "<span class='red'>Thank You.</span>", size: "0B" },
          ];
        
        }
        saveState();
        printResponse(`(Saved.)`);
        break;

      case "start": 
          if (gameRunning) {
            printResponse("Game is already running.");
          } else {
            startGameLoop();
          }
          updateDriveUI();
          break; 

      case "stats":
        if (!gameRunning) {
          printResponse("Pardon?");
          break;
        }
        const bitsFormatted = formatBits(gameState.bits);
        const rateFormatted = formatBits(gameState.bitsPerSecond);
        if (gameState.bitsPerSecond === 0) {
          printResponse(
            `🧠 <span class="red">V1RU5</span> Status:\nThe Virus is hungry, do <span class="cmd">'shop'</span> to see options.\nBits: <span class="cmd">${bitsFormatted}</span>\nRate: ${rateFormatted}/s`,
          );
          break;
        }
        printResponse(
          `🧠 <span class="red">V1RU5</span> Status:\n(This is gonna do something soon promise)\nBits: <span class="cmd">${bitsFormatted}</span>\nRate: ${rateFormatted}/s`,
        );
        break;
        
      case "shop":
        printResponse(`<u>Available Generators</u>:`);
        fileGenerators.forEach((gen, i) => {
          printResponse(`${i}: <span class="cmd">${gen.name}</span> | Rate: ${gen.rate}B/s | Cost: ${formatBits(gen.cost)}`);
        });
        break;
      
      case "buy":
        const index = parseInt(args[0]);
        const gen = fileGenerators[index];
        if (!gen) {
          printResponse("Invalid generator index.");
          break;
        }
        if (gameState.bits < gen.cost) {
          printResponse(`You need ${formatBits(gen.cost)} but only have ${formatBits(gameState.bits)}.`);
          break;
        }
      
        gameState.bits -= gen.cost;
        if (!gameState.generators) gameState.generators = [];
        gameState.generators.push({ ...gen });
      
        // Scale price up for future purchases
        gen.cost = Math.floor(gen.cost * 1.5);
      
        printResponse(`Purchased <span class="cmd">${gen.name}</span>!`);
        break;

      case "debug":
        gameState.bits += 5000;
        updateSecretFileDisplay();
        break;
      
      case "achievements":
      case "ach":
        let html = `<div class="achievement-grid">`;
        for (const a of achievements) {
          const unlocked = gameState.achievements[a.id];
          html += `
            <div class="achievement-icon ${unlocked ? "unlocked" : "locked"}"
                  onclick="showAchievementDetails('${a.id}')"
                  title="${a.name}">
              🏆 ${a.name} - ${unlocked ? a.desc: a.hint} 
              </div>`
        }
        html += `</div>`;
        $output.append(html);
        break;

      // FUN 
      case "matrix":
        if (!matrixActive) {
          printResponse("Starting Matrix.");
          startMatrixRain();
        } else {
          printResponse(
            "Matrix already running. Press ESC to stop. (or click)",
          );
        }
        break;

      // bants 
      case "??????????":
        printResponse("???");
        break;

      case "tilted":
      case "pinball":
        printResponse("<a href='https://flowiz.moe/tilted'>https://flowiz.moe/tilted</a>");
        break;
      case "awa":
        printResponse("♡＾▽＾♡<span class='g'>awa awa!</span>");
        break;

      case "author":
      case "owner":
      case "credits":
        printResponse(CREDITS);
        break;
      
      case "version":
      case "ver":
        printResponse(`Version: <span class="red">${VERSION}:"${VERSION_STR}"</span>`);
        break;
      case "":
        printResponse("\n");
        break; 

      case "reset":
        printResponse("Resetting state of website.");
        localStorage.clear();
        location.reload();
        break;

      default:
        if (commands[command]) {
          printResponse(commands[command]);
        } else {
          printResponse(
            `command not found: ${command}\nType 'help' to see available commands.`,
          );
        }
        break;
    }
    if (!gameRunning) checkAchievements();
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

console.log("flowiz.moe v0.1.2 - https://flowiz.moe");
console.log(`%c
                                                                  
                _                      ____                       
              /   \\                  /      \\                     
             '      \\              /          \\                   
            |       |Oo          o|            |                  
            \`    \  |OOOo......oOO|   /        |                   
             \`    \\OOOOOOOOOOOOOOO\//        /                     
              \\ _o\OOOOOOOOOOOOOOOO//. ___ /                       
           ______OOOOOOOOOOOOOOOOOOOOOOOo.___                     
            --- OO'* \`OOOOOOOOOO'*  \`OOOOO--                      
                OO.   OOOOOOOOO'    .OOOOO o                      
                \`OOOooOOOOOOOOOooooOOOOOO'OOOo                    
              .OO "OOOOOOOOOOOOOOOOOOOO"OOOOOOOo                  
          __ OOOOOO\`OOOOOOOOOOOOOOOO"OOOOOOOOOOOOo                
         ___OOOOOO___"OOOOOOOOOOO"_OOOOOOOOOOOOOOOO               
           OOOOO^OOO/\`(____)/"O\\OOOOOOOOOO^OOOOOO                 
           OOOOO OO/00/000000\O000\\0OOOOOOO OOOOOO                 
           OOOOO O0000000000000000 ppppoooooOOOOOO                
           \`OOOOO 0000000000000000 QQQQ "OOOOOOO"                 
            o"OOOO 000000000000000oooooOOoooooooO'                
            OOo"OOOO.00000000000000000000OOOOOOOO'                
           OOOOOO QQQQ 0000000000000000000OOOOOOO                 
          OOOOOO00eeee00000000000000000000OOOOOOOO.               
         OOOOOOOO000000000000000000000000OOOOOOOOOO               
         OOOOOOOOO00000000000000000000000OOOOOOOOOO               
         \`OOOOOOOOO000000000000000000000OOOOOOOOOOO               
           "OOOOOOOO0000000000000000000OOOOOOOOOOO'               
             "OOOOOOO00000000000000000OOOOOOOOOO"                 
  .ooooOOOOOOOo"OOOOOOO000000000000OOOOOOOOOOO"                   
.OOO"""""""""".oOOOOOOOOOOOOOOOOOOOOOOOOOOOOo                     
OOO         QQQQO"'                     \`"QQQQ                    
OOO                                                               
\`OOo.                                                             
  \`"OOOOOOOOOOOOoooooooo.__                                       
                                                                  
          Loading . . .                                           
                                                                  `, `font-family: monospace;background: #222; color: #bada55`);

console.log(`%c
_______         _____  _  _  _ _____ ______   _______  _____  _______
|______ |      |     | |  |  |   |    ____/   |  |  | |     | |______
|       |_____ |_____| |__|__| __|__ /_____ . |  |  | |_____| |______
                                                         
   
`, `font-family: monospace`);
