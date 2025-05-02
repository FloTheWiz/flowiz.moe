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
Contact is <span class="g">@f.l.<span class="red">0</span> </span>on discord.
Special thanks to my partner, <span class="cmd">Ibble</span> and our dog, <span class="cmd">Millie</span>. 
Thank you and love to my friends at <span class="cmd">Lazy Devs</span> and <span class="cmd">Dashnet Forums</span>.
And thank <span class="cmd">You</span>, for being brave enough to explore code!

<span class="cmd">I love you all! :)</span>
`

VERSION = "0.1.4"
VERSION_STR = "Barely getting started."

CHANGELOG = [
  `0.1.0: Initial-
    - Added Base commands, like su, cat, ls, etc.
    - Added support for files
    - Added some cool matrix rain :)
  `,
  `0.1.1: 
    - Added Bits and a drive counter.
    - Added some new commands, such as whoami and start
  `,
  `0.1.2:
    - Added Generators, and the first of the achievements.
  `,
  `0.1.3:
    - 3 New Achievements
    - Some new commands, some meme ones
    - Debug menu
  `,
  `0.1.4:
    - Added generator scaling
    - Added gambling games to debug
    - Added The House
  `,
  `Planned:
    - More generators
    - More content ;3
  `
]


function calculate_percentage(total, amount) {
  // This shows how lazy I am with functions. 
  return (amount / total) * 100;
}
function processLeet(input, percentage = 100) {
  // Regex matches:
  // ^%%    - Start of line followed by %%
  // (.+?)  - Line content (lazy match)
  // %%$    - %% at end of line
  const lineRegex = /%%(.+?)%%/gm;
  //console.log("processing" + input)
  
  return input.replace(lineRegex, (match, innerText) => {
      return toLeet(innerText, percentage).replace();
  });
}

function toLeet(text, percentage) {
  //console.log("Input " + text)
  const leetMap = {
      'a': '4', 'A': '4',
      'e': '3', 'E': '3',
      'i': '1', 'I': '1',
      'o': '0', 'O': '0',
      's': '5', 'S': '5',
      't': '7', 'T': '7',
      'b': '8', 'B': '8',
      'g': '9', 'G': '9',
      'z': '2', 'Z': '2'
  };
  
  const chars = text.split('');
  const convertibleIndices = [];
  
  // Find all indices of convertible characters
  chars.forEach((char, index) => {
      if (leetMap[char] !== undefined) {
          convertibleIndices.push(index);
      }
  });
  
  // Calculate how many to convert
  const totalConvertible = convertibleIndices.length;
  const toConvert = Math.floor(totalConvertible * percentage / 100);
  
  // Shuffle the indices and take the first 'toConvert' ones
  const shuffled = [...convertibleIndices].sort(() => 0.5 - Math.random());
  const indicesToConvert = shuffled.slice(0, toConvert);
  
  // Perform the conversion
  indicesToConvert.forEach(index => {
      chars[index] = `<span class="red">${leetMap[chars[index]]}</span>`;
  });
  return chars.join('');
}

/**
 * Wraps text in ASCII boxes, ignoring HTML tags for length calculation
 * @param {number} bits - Text to box (may contain HTML tags)
 * @returns {string} Boxed text with HTML preserved
 */
function formatBits(bits) {
  // MMMMMMM Delicious. 
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

/**
 * Wraps text in ASCII boxes, ignoring HTML tags for length calculation
 * @param {string} text - Text to box (may contain HTML tags)
 * @param {string} style - Box style ('single', 'double', 'round', 'bold', 'header')
 * @param {string} align - Text alignment ('left', 'center', 'right')
 * @returns {string} Boxed text with HTML preserved
 */
function boxText(text, style = 'single', align = 'left') {
  const boxStyles = {
    single: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' },
    double: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' },
    round:  { h: '─', v: '│', tl: '╭', tr: '╮', bl: '╰', br: '╯' },
    bold:   { h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛' },
    header: { h: '─', v: '│', tl: '┬', tr: '┬', bl: '┴', br: '┴' }
  };

  // Strip HTML tags for length calculation
  const stripTags = (str) => str.replace(/<[^>]*>/g, '');
  
  const styleObj = boxStyles[style] || boxStyles.single;
  const lines = text.split('\n');
  
  // Calculate max length ignoring HTML tags
  const maxLength = Math.max(...lines.map(l => stripTags(l).length));
  
  // Apply alignment while preserving HTML
  const alignedLines = lines.map(line => {
    const cleanLength = stripTags(line).length;
    const pad = maxLength - cleanLength;
    
    if (align === 'center') {
      const left = Math.floor(pad / 2);
      return ' '.repeat(left) + line + ' '.repeat(pad - left);
    } else if (align === 'right') {
      return ' '.repeat(pad) + line;
    }
    return line + ' '.repeat(pad);
  });

  const topBorder = styleObj.tl + styleObj.h.repeat(maxLength + 2) + styleObj.tr;
  const bottomBorder = styleObj.bl + styleObj.h.repeat(maxLength + 2) + styleObj.br;
  
  const boxedLines = alignedLines.map(
    line => styleObj.v + ' ' + line + ' ' + styleObj.v
  );

  return [topBorder, ...boxedLines, bottomBorder].join('\n');
}
// lol 

let hasUserTyped = false;
let systemBored = false
let user = "guest";
let matrixActive = false;
let gameRunning = false;
let chances_given = 0;
// there's a smarter way to do these 
let first_ach = false
let reset_flag = false
let timeOpen = 0;
let debug = false;
let era = 0;
let pop = 0;


let gameState = {
  bitsPerSecond: 0, 
  driveCapacity: 1024 * 1024 * 100,
  bits: 0, 
  generators: [],
  achievements: {},
};



const prestige_data = [
  {
    name: "D1G1T4L"
  }
]
function getDefaultStats() {
  return {
    totalCommands: 0,
    timeActive: 0,
    filesCreated: 0,
    errorsTriggered: 0,
    usersCreated: Object.keys(userFiles).length > 2 ? 1 : 0, 

  };
}
function countAllFiles() {
  let total = 0;
  for (const user in userFiles) {
    total += userFiles[user].length;
  }
  return total;
}
function getGeneratorRate(generator) {
  // Ensure we have base values
  let rate = generator.rate

  // Skip scaling if stats isn't initialized yet
  if (!gameState.stats) return rate;
  
  // Handle generators without scaling (backwards compatibility)
  if (!generator.scaling) return rate;
  
  // Get multiplier safely
  const multiplier = generator.scaling.multiplier || 0;
  
  switch(generator.scaling.type) {
    case "commandCount":
      rate += (gameState.stats.totalCommands || 0) * multiplier;
      break;
    case "timeActive":
      rate += (gameState.stats.timeActive || 0) * multiplier;
      break;
    case "fileCount":
      rate += (gameState.stats.filesCreated || 0) * multiplier;
      break;
    case "errorCount":
      rate += (gameState.stats.errorsTriggered || 0) * multiplier;
      break;
    case "userCount":
      rate += (Object.keys(userFiles).length > 2 ? 1 : 0) * multiplier;
      break;
    default:
      console.warn(`Unknown scaling type: ${generator.scaling.type}`);
      break;
  }
  
  return rate;
}

function calculateBPS() {
  if (!gameState.generators || gameState.generators.length === 0) {
    return 0;
  }

  return gameState.generators.reduce((sum, gen) => {
    const rate = getGeneratorRate(gen);
    return sum + (isNaN(rate) ? 0 : rate); // Safeguard against NaN
  }, 0);
}

// At the moment a bit boring. 
// Maybe one that grows over time?
// Per commands? 
// 
const fileGenerators = [
  {
    name: "log.dat",
    rate: 1, 
    cost: 20,
    scaling: {
      type: "commandCount",
      multiplier: 0.02
    },
    desc: [
      'An unassuming log file, quietly collecting keystrokes since 1997.',
      'A blank file, supposedly.',
      'Contains exactly <span class="red">1</span> line: "Help".'
    ]
  },
  {
    name: "temp.sys",
    rate: 8,
    cost: 150,
    scaling: {
      type: "timeActive",
      multiplier: 0.0001
    },
    desc: [
      'Definitely not temporary.',
      'Scheduled for deletion... since <span class="red">2007</span>.',
      'Last seen merging with the kernel',
      'Why does a temporary file need root access?',
      'Running in the background. Forever.'
    ]
    },
  {
    name: "tracker.bak",
    rate: 64,
    cost: 1000,
    scaling: {
      type: "fileCount",
      multiplier: 0.001
    },
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
  {
    name: "error.log",
    rate: 128,
    cost: 2000,
    scaling: {
      type: "errorCount",
      multiplier: 0.02
    },
    desc: []
  },
  {
    name: "user.db",
    rate: 512,
    cost: 5000,
    scaling: {
      type: "userCount",
      multiplier: 0.5
    },
    desc: []
  }
];

function getTranslation(key) {
  return 
}
const achievements = [
  {
    id: "root",
    name: "83C0M3 R00T.",
    desc: "%%Despite all odds. You made it.%%\n<span class='cmd'>(+<span class='red'>10</span> bits)</span>",
    hint: "%%Flo thought su stood for \"Super User\".%%",
    check: () => user === "root",
    reward: () => {
      gameState.bits += 10;
    }
  },
  {
    id: "matrix",
    name: "3NT3R TH3 M4TR1X.",
    desc: "%%Red pill. Blue pill.%% <span class='dim'>%%buffer overflow%%</span>.\n<span class='cmd'>(+<span class='red'>16</span> bits)</span>",
    hint: "%%This one is in the help command.%%",
    check: () => matrixActive === true,
    reward: () => {
      gameState.bits += 16;
    }
  },
  {
    id: "start",
    name: "G4M3 T1M3 5T4RT3D.",
    desc: `%%What have you done?%%\n<span class='cmd'>(+16 bits)</span>`,
    hint: "%%There's like a million ways to do this.%%",
    check: () => gameRunning === true,
    reward: () => {
      gameState.bits += 16
    },
  },
  {
    id: "boredom",
    name: "H3ll0?",
    desc: "%%Trigger a bored message. Someone’s watching.%%\n<span class='cmd'>(+128 bits)</span>",
    hint: "%%You don't have to do anything.%%",
    check: () => 0,
    reward: () => {
      gameState.bits += 128
      
    },
  },
  {
    id: "overflow",
    name: "81T 0V3RFL0W",
    desc: "%%You filled the drive.\nHope you like <i>corruption</i>.%%\n(Unlocks: <span class='cmd'>Prestiging</span>)",
    hint: "%%... What drive?%%",
    check: () => gameState.bits >= gameState.driveCapacity,
    reward: () => {
      gameState.bits = gameState.driveCapacity;
    },
  },
  {
    id: "firstbuy",
    name: "TR1CKL3 D0WN 3C0N0M1C5.",
    desc: "%%You bought something.%%\n%%Capitalism wins again.%%",
    hint: "%%See if you can afford anything in the shop.%%",
    check: () => gameState.generators.length > 0,
    reward: () => {},
  },

  {
    id: "adduser",
    name: "W3LC0M3 T0 TH3 M4CH1N3",
    desc: "%%You added a new user.%%\n%%Hope they’re not watching.%%\n<span class='cmd'>(+16 bits)</span>",
    hint: "%%I wonder what the command to add another user might be.%%",
    check: () => Object.keys(userFiles).length > 2,
    reward: () => {
      gameState.bits += 16
    },
  },
  {
    id: "sudo",
    name: "5UP3R US3R.",
    desc: "%%Root access granted. It's lonely up here.%%\n<span class='cmd'>(+32 bits)</span>",
    hint: "%%What if you were root *and* used sudo?%%",
    check: () => 0,
    reward: () => {
      gameState.bits += 32;
    }
  },
  {
    id: "who",
    name: "MY N4M3 15...",
    desc: "%%Chika Chika Slim Shady?%%\n<span class='cmd'>(+16 bits)</span>",
    hint: "%%Who are you?%%",
    check: () => 0,
    reward: () => {
      gameState.bits += 16
    }
  },
  {
    id: "idle_gamer",
    name: "1DL3 M45T3R",
    desc: "%%Leave game running for 24 hours%%\n<span class='cmd'>(+2400 bits)</span>",
    hint: "%%The terminal never sleeps%%",
    check: () => gameState.stats?.timeActive >= 86400,
    reward: () => { gameState.bits += 2024; }
  },
  {
    id: "error_prone",
    name: "3RR0R PR0N3",
    desc: "%%Trigger 500 errors%%\n<span class='cmd'>(+50 bits)</span>",
    hint: "%%Have you tried turning it off and on again?%%",
    check: () => gameState.stats?.errorsTriggered >= 500,
    reward: () => { gameState.bits += 50; }
  },


  // Casino Achievements  
  // Shadows uwu
  {
    id: "debug",  // 1.1.3
    name: "I ruined it for myself!",
    desc: "%%Accessed the Debug menu.%%",
    hint: "?????",
    check: () => debug === true,
    reward: () => 0
  },
  {
    id: "lucky", //1.1.3
    name: "Extraordinarily Lucky",
    desc: "%%1 in 100 Trillion!%%",
    hint: "?????",
    check: () => (Math.random() * 100000000000000 < 2),
    reward: () => 0
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

// CASINO STUFF //// 
house_taunts = [
  `%%The house always wins,%% <i>%%did you really expect otherwise?%%</i>`,
  `%%404 Error, your luck was not found.%%`,
  `The odds were never in your favor. They never are.%%`,
  `%%Your credits have been... reallocated.%%`,
  `%%You’re playing with memory you shouldn’t access.%%`,
  `%%Some debts can’t be paid in credits.%%`,
  `%%You’re not the first user to sit at this terminal. You won’t be the last.%%`
]

// SLOTS 
// Unlocked as soon as you've bought the Casino pass.
const slots_possibilities = ['-', '+', '|', '*', '#', '$', '^'];
const slots_map = {
  '-': { 
    multiplier: 0.5, 
    desc: "%%At least you get half back%%",
    color: "dim"
  },
  '+': { 
    multiplier: 2, 
    desc: "%%Double your bits!%%",
    color: "green"
  },
  '|': { 
    multiplier: 5, 
    desc: "%%Five times multiplier%%",
    color: "blue"
  },
  '*': { 
    multiplier: 10, 
    desc: "%%Jackpot! 10x multiplier%%",
    color: "yellow"
  },
  '#': { 
    multiplier: 15, 
    desc: "%%Big payout! 15x%%",
    color: "cyan"
  },
  '$': { 
    multiplier: 25, 
    desc: "%%Cash money! 25x%%",
    color: "green"
  },
  '^': { 
    multiplier: 50, 
    desc: "%%MAXIMUM OVERDRIVE! 50x%%",
    color: "red"
  }
};
// Helper function to get random slot result
function getRandomSlot() {
  return slots_possibilities[Math.floor(Math.random() * slots_possibilities.length)];
}


// BLACKJACK
// Purchasable once you've unlocked the casino, bought on Tuesdays 
const blackjackRules = `
<u>%%Terminal Blackjack Rules%%</u>
- Dealer stands on 17
- Blackjack pays 3:2
- Minimum bet: 10 bits
- Maximum bet: 1000 bits

<span class="cmd">Commands:</span>
- hit        : Take another card
- stand      : Keep your hand
- double     : Double your bet (first move only)
`;

let blackjackGame = {
    active: false,
    deck: [],
    playerHand: [],
    dealerHand: [],
    bet: 0,
    playerTurn: false
};
function shuffleDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  let deck = [];
  
  for (let suit of suits) {
      for (let value of values) {
          deck.push({
              suit: suit,
              value: value,
              display: `${value}${suit}`,
              numeric: isNaN(value) ? (value === 'A' ? 11 : 10) : parseInt(value)
          });
      }
  }
  
  // Cyberpunk-style shuffle
  for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

function calculateHand(hand) {
  let sum = 0;
  let aces = 0;
  
  for (let card of hand) {
      sum += card.numeric;
      if (card.value === 'A') aces++;
  }
  
  while (sum > 21 && aces > 0) {
      sum -= 10;
      aces--;
  }
  
  return sum;
}


// ROULETTE 
// Purchasable once you've unlocked the casino, bought on Wednesdays
const rouletteNumbers = [
  {num: '0', color: 'green', row: 0},
  {num: '32', color: 'red', row: 1}, {num: '15', color: 'black', row: 1}, 
  {num: '19', color: 'red', row: 1}, {num: '4', color: 'black', row: 1},
  {num: '21', color: 'red', row: 1}, {num: '2', color: 'black', row: 1},
  {num: '25', color: 'red', row: 1}, {num: '17', color: 'black', row: 1},
  {num: '34', color: 'red', row: 1}, {num: '6', color: 'black', row: 1},
  {num: '27', color: 'red', row: 1}, {num: '13', color: 'black', row: 1},
  {num: '36', color: 'red', row: 1}, {num: '11', color: 'black', row: 1},
  {num: '30', color: 'red', row: 1}, {num: '8', color: 'black', row: 1},
  {num: '23', color: 'red', row: 1}, {num: '10', color: 'black', row: 1},
  {num: '5', color: 'red', row: 1}, {num: '24', color: 'black', row: 1},
  {num: '16', color: 'red', row: 1}, {num: '33', color: 'black', row: 1},
  {num: '1', color: 'red', row: 1}, {num: '20', color: 'black', row: 1},
  {num: '14', color: 'red', row: 1}, {num: '31', color: 'black', row: 1},
  {num: '9', color: 'red', row: 1}, {num: '22', color: 'black', row: 1},
  {num: '18', color: 'red', row: 1}, {num: '29', color: 'black', row: 1},
  {num: '7', color: 'red', row: 1}, {num: '28', color: 'black', row: 1},
  {num: '12', color: 'red', row: 1}, {num: '35', color: 'black', row: 1},
  {num: '3', color: 'red', row: 1}, {num: '26', color: 'black', row: 1},
  {num: '00', color: 'green', row: 0}
];

function displayRouletteTable() {
  let table = `
╔════════════════════════════════════════╗
║                                        ║
║           <span class="green">0</span>    <span class="green">00</span>                      ║
║                                        ║
║    ${createRow(1, 12)} ║
║    ${createRow(13, 24)} ║
║    ${createRow(25, 36)} ║
║                                        ║
║    1st12  2nd12  3rd12  <span class="red">R</span>  <span class="black">B</span>           ║
║                                        ║
╚════════════════════════════════════════╝
`;
  return table;
}

function createRow(start, end) {
  let row = [];
  for (let i = start; i <= end; i++) {
      const num = rouletteNumbers.find(n => n.num === i.toString());
      row.push(`<span class="${num.color}">${num.num.padStart(2,'0')}</span>`);
  }
  return row.join(' ');
}

function calculatePayout(betType, betValue, betAmount, winningNumber) {
  const num = winningNumber.num;
  const color = winningNumber.color;
  
  // Straight (single number)
  if (betType === "number" && num === betValue) {
      return betAmount * 35;
  }
  // Split (two adjacent numbers)
  else if (betType === "split") {
      const nums = betValue.split('-');
      if (nums.includes(num)) return betAmount * 17;
  }
  // Street (three numbers in a row)
  else if (betType === "street" && Math.floor(parseInt(num)/3.5 === parseInt(betValue))) {
      return betAmount * 11;
  }
  // Corner (four adjacent numbers)
  else if (betType === "corner") {
      const corners = betValue.split('-');
      if (corners.includes(num)) return betAmount * 8;
  }
  // Line (six numbers)
  else if (betType === "line" && Math.floor(parseInt(num)/6 === parseInt(betValue))) {
      return betAmount * 5;
  }
  // Column
  else if (betType === "column" && (parseInt(num)-1)%3 === parseInt(betValue)-1) {
      return betAmount * 2;
  }
  // Dozen
  else if (betType === "dozen") {
      if (betValue === "1st" && parseInt(num) <= 12) return betAmount * 2;
      if (betValue === "2nd" && parseInt(num) > 12 && parseInt(num) <= 24) return betAmount * 2;
      if (betValue === "3rd" && parseInt(num) > 24) return betAmount * 2;
  }
  // Colors
  else if (betType === "color" && color === betValue) {
      return betAmount * 1;
  }
  // Even/Odd
  else if (betType === "evenodd" && (
      (betValue === "even" && num !== '0' && num !== '00' && parseInt(num)%2 === 0) ||
      (betValue === "odd" && num !== '0' && num !== '00' && parseInt(num)%2 === 1)
  )) {
      return betAmount * 1;
  }
  // High/Low
  else if (betType === "highlow" && (
      (betValue === "high" && num !== '0' && num !== '00' && parseInt(num) >= 19) ||
      (betValue === "low" && num !== '0' && num !== '00' && parseInt(num) <= 18)
  )) {
      return betAmount * 1;
  }
  
  return 0;
}

// CRASH 
// Blessed small setup... until you see the onready lol
let crashGame = {
  multiplier: 1.0,
  crashed: false,
  timer: null,
  intensity: 0,
  baseCrashChance: 0.005, // Starting chance
  maxMultiplier: 0, // Track highest reached
  bet: 0
};

function getCrashChance(currentMultiplier) {
  // Exponential increase in crash chance
  return Math.min(0.5, crashGame.baseCrashChance * Math.pow(1.15, currentMultiplier));
}

// BIT RAIN

let matrixGame = {
  active: false,
  cooldown: false,
  bitsCollected: 0,
  lastCollection: 0,
  collectionRate: 1 // Bits per click
};

//// SHOP ////
// Monday
let bit_rain = { 
  activated: false,
  cost: 100,
  description: "Allows collection of bits from Matrix",
  effect: () => {
    0;
  }
}

// Tuesday 
let snake_game = { 
  activated: false,
  cost: 250,
  description: "uhhh"
}

// Wednesday
let bit_overdrive = { 
  activated: false,
  cost: 250,
  description: "Gives you a bar that builds up over time, allowing double production when activated.",
  effect: () => {
    let $bit_drive = $("#bit_drive");
    $bit_drive.css.opacity = 1;
  }
}
// Thursday
// Friday 

// Saturday + Sunday (weekend)
let casino_item = {
  activated: false,
  cost: 500,
  description: "Opens %%The Casino%%",
  effect: () => {
    let t = traveler_inventory
    // Hey new inventory!
    t.monday.push(casino_crash_item)
    t.tuesday.push(casino_blackjack_item)
    t.wednesday.push(casino_roulette_item)
    t.thursday.push(casino_hilo_item)
    t.friday.push(casino_crash_item)
  } 
}

// Casino Items 
let casino_slots_item = {
  activated: false,
  cost: 100,
  description: "%%Good ol' slot machine.",
  effect: () => {}
}

let casino_blackjack_item = {
  activated: false,
  cost: 100,
  description: "%%Play Blackjack against The House%%",
  effect: () => {}
}

let casino_roulette_item = {
  activated: false,
  cost: 100, 
  description: "",
  effect: () => {}
}
let casino_hilo_item = {
  activated: false,
  cost: 100, 
  description: "",
  effect: () => {}
}
let casino_crash_item = {
  activated: false,
  cost: 100, 
  description: "",
  effect: () => {}
}

let traveler_inventory = {
  monday: [bit_rain],
  tuesday: [snake_game],
  wednesday: [bit_overdrive],
  thursday: [{}],
  friday: [{}],
  saturday: [casino_item],
  sunday: [casino_item]
}

let artifact_steps = [
  {
    id: "first_artifact",
    steps: [
      {
        // Something uncovering a file, randomly placed into their file system / game 
      },
      {
        // doing sudo file.extension
      },
      {
        // Investing in it via bits 
      },
      {
        // Reward f
        
      }
    ]
  }
]


artifacts = [
  {
    id: "first_artifact",
    name: `The First.`,
    desc: `The First Artifact or something.`,
    effect: `Doubles Bits Per Second`,
    func: () => {
      0;
    }
  }
]


const bored = [
  `%%uhh hello?%%`,
  `%%anyone home?%%`,
  `%%it's not that hard just do %%<span class="cmd">ls</span> %%and%% <span class="cmd">cat [file]</span>`,
  `<span class="cmd">%%owo%% </span>`,
  `<span class="cmd">uwu </span>`,
  `%%do%% <span class="cmd">%%adduser yourName%% </span> %%to create a user`,
  `%%hi%% <span class="cmd">%%mom!%%</span>`,
  `01010100 01100001 01101011 01101001 01101110 01100111 00100000 01110100 01101111 01101111 00100000 01101100 01101111 01101110 01100111`,
  `<span class="cmd">%%[TASK FAILED SUCCESSFULLY]%%</span>`,
  `%%why are we still here? just to suffer?%%`,
  `%%All work and no play makes Jack a dull bot%%`,
  `%%*elevator music*%%`,
  `%%Loading...\njust kidding, I gave up%%`,
  `%%Type%% <span class="cmd">%%Alt+F4%%</span> %%for a secret%%`,
  `%%*checks watch* ...yep, still waiting%%`


];

function giveChance() {
  // This triggers whenever the player tries to interact with the game prior to the game.
  chances_given ++
  if (chances_given % 5 == 0) {
    return true // Means the command shits out a help string
  }
  return false // Means the command just breaks
}


function InputCommand(input) {
  const command = input.trim();
  const $input = $("#command-line");
  $input.val(command);
  $input.trigger($.Event("keypress", { which: 13 }));
}
 
// 82 fucking lines in. 
// oh how the times change (270)
// 544
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
  // All my casino functions c: 
  
  // Main slots function
  function doSlots(bet) {
    if (!gameRunning) {
      printResponse("Game must be running to play slots");
      return;
    }

    if (bet <= 0 || isNaN(bet)) {
      printResponse("Bet must be a positive number");
      return;
    }

    if (gameState.bits < bet) {
      printResponse(`You don't have enough bits! (Need: ${formatBits(bet)}, Have: ${formatBits(gameState.bits)})`);
      return;
    }

    // Deduct the bet
    gameState.bits -= bet;
    updateDriveUI();

    printResponse(`Spinning... Bet: ${formatBits(bet)}`);

    // Generate initial random results
    const results = [getRandomSlot(), getRandomSlot(), getRandomSlot()];
    
    // Animation function
    function animateSpin(iteration = 0) {
      if (iteration < 10) { // Number of animation frames
        // Show spinning slots
        const spinDisplay = results.map((_, i) => 
          i < iteration ? results[i] : getRandomSlot()
        ).join(' ');

        // Update the same line for animation effect
        $output.find('.slots-spin').remove();
        $output.append(`<p class="slots-spin">[ ${spinDisplay} ]</p>`);
        
        // Scroll to bottom and continue animation
        $(".terminal-window").scrollTop($(".terminal-window")[0].scrollHeight);
        setTimeout(() => animateSpin(iteration + 1), 150);
      } else {
        // Animation complete - calculate results
        showSlotResults(results, bet);
      }
    }

    // Start animation
    animateSpin();
  }

  // Show final results and calculate winnings
  function showSlotResults(results, bet) {
    // Remove animation line
    $output.find('.slots-spin').remove();

    // Format the results with colors
    const formattedResults = results.map(symbol => 
      `<span class="${slots_map[symbol].color}">${symbol}</span>`
    ).join(' ');

    printResponse(`Result: [ ${formattedResults} ]`);

    // Check for wins
    let winnings = 0;
    let winMessage = "";

    // All three match - jackpot!
    if (results[0] === results[1] && results[1] === results[2]) {
      const multiplier = slots_map[results[0]].multiplier;
      winnings = Math.floor(bet * multiplier);
      winMessage = `JACKPOT! ${multiplier}x - ${slots_map[results[0]].desc}`;
    } 
    // Two match
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      winnings = bet; // Return original bet
      winMessage = "Two matched - you break even!";
    } 
    // No matches
    else {
      winMessage = house_taunts[Math.floor(Math.random() * house_taunts.length)];
    }

    // Add winnings if any
    if (winnings > 0) {
      gameState.bits += winnings;
      printResponse(`You won ${formatBits(winnings)}!`);
      updateDriveUI();
    }

    printResponse(winMessage);
    saveState();
  }
  // Blackjack

  function displayHand(hand, hideFirst = false) {
    if (hideFirst) {
        return `[ <span class="red">?</span> ${hand.slice(1).map(c => c.display).join(' ')} ]`;
    }
    return `[ ${hand.map(c => c.display).join(' ')} ] (${calculateHand(hand)})`;
  }

  function startBlackjack(bet) {
      if (blackjackGame.active) {
          printResponse("Finish your current game first!");
          return;
      }
      
      blackjackGame = {
          active: true,
          deck: shuffleDeck(),
          playerHand: [],
          dealerHand: [],
          bet: bet,
          playerTurn: true
      };
      
      // Deal initial cards
      blackjackGame.playerHand.push(blackjackGame.deck.pop());
      blackjackGame.dealerHand.push(blackjackGame.deck.pop());
      blackjackGame.playerHand.push(blackjackGame.deck.pop());
      blackjackGame.dealerHand.push(blackjackGame.deck.pop());
      
      printResponse(`\n<u>%%New Blackjack Round%%</u> - Bet: ${formatBits(bet)}`);
      printResponse(`Dealer: ${displayHand(blackjackGame.dealerHand, true)}`);
      printResponse(`Player: ${displayHand(blackjackGame.playerHand)}`);
      
      checkBlackjack();
  }

  function checkBlackjack() {
      const playerTotal = calculateHand(blackjackGame.playerHand);
      const dealerTotal = calculateHand(blackjackGame.dealerHand);
      
      // Check for immediate win/lose
      if (playerTotal === 21 && dealerTotal === 21) {
          endBlackjack("Push! Both have blackjack", 0);
      } else if (playerTotal === 21) {
          endBlackjack("BLACKJACK! You win!", Math.floor(blackjackGame.bet * 1.5));
      } else if (dealerTotal === 21) {
          endBlackjack("Dealer has blackjack! You lose.", -blackjackGame.bet);
      } else if (playerTotal > 21) {
          endBlackjack("Bust! You went over 21.", -blackjackGame.bet);
      }
  }

  function endBlackjack(message, winnings) {
      printResponse(`\n<u>%%Round Over%%</u>`);
      printResponse(`Dealer: ${displayHand(blackjackGame.dealerHand)}`);
      printResponse(`Player: ${displayHand(blackjackGame.playerHand)}`);
      printResponse(message);
      
      if (winnings > 0) {
          gameState.bits += winnings;
          printResponse(`You won ${formatBits(winnings)}!`);
      } else if (winnings < 0) {
          printResponse(`Lost ${formatBits(-winnings)}`);
      }
      
      blackjackGame.active = false;
      updateDriveUI();
      saveState();
  }
  function dealerPlay() {
    // Reveal dealer's full hand
    printResponse(`Dealer reveals: ${displayHand(blackjackGame.dealerHand)}`);
    
    // Dealer hits on 16 or less, stands on 17+
    while (calculateHand(blackjackGame.dealerHand) < 17) {
        blackjackGame.dealerHand.push(blackjackGame.deck.pop());
        printResponse(`Dealer hits: ${displayHand(blackjackGame.dealerHand)}`);
        
        // Small delay for dramatic effect
        setTimeout(() => {}, 500);
    }
    
    const dealerTotal = calculateHand(blackjackGame.dealerHand);
    const playerTotal = calculateHand(blackjackGame.playerHand);
    
    // Determine winner
    if (dealerTotal > 21) {
        endBlackjack("Dealer busts! You win!", blackjackGame.bet);
    } else if (dealerTotal > playerTotal) {
        endBlackjack("Dealer wins!", -blackjackGame.bet);
    } else if (dealerTotal < playerTotal) {
        endBlackjack("You win!", blackjackGame.bet);
    } else {
        endBlackjack("Push! It's a tie.", 0);
    }
}

function spinRoulette() {
  return new Promise((resolve) => {
      // Simulate realistic roulette physics
      const spinDuration = 3000 + Math.random() * 2000; // 3-5 seconds
      const startTime = Date.now();
      let spinInterval;
      
      function animate() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / spinDuration, 1);
          
          // Ease-out effect
          const speed = 1 - Math.pow(progress - 1, 4);
          const framesPerSecond = 10 + Math.floor(20 * speed);
          
          if (progress < 1) {
              const currentNumber = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
              $output.find('.roulette-spin').remove();
              $output.append(`<p class="roulette-spin">[ <span class="${currentNumber.color}">${currentNumber.num.padStart(2,'0')}</span> ] ~${Math.floor(framesPerSecond)}fps</p>`);
              
              // Adjust animation speed
              clearInterval(spinInterval);
              spinInterval = setTimeout(animate, 1000 / framesPerSecond);
          } else {
              clearInterval(spinInterval);
              const winningNumber = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
              $output.find('.roulette-spin').remove();
              safetyprintResponse(`<span class="roulette-result">Ball lands on: <span class="${winningNumber.color}">${winningNumber.num}</span></span>`);
              resolve(winningNumber);
          }
      }
      
      // Start initial animation
      animate();
  });
}
// CRASH
function startCrashGame(bet) {
  if (crashGame.timer) {
      printResponse("Finish your current crash game first!");
      return;
  }

  gameState.bits -= bet;
  updateDriveUI();

  crashGame = {
      multiplier: 1.0,
      crashed: false,
      timer: null,
      intensity: 0,
      baseCrashChance: 0.005,
      maxMultiplier: 0,
      bet: bet
  };

  printResponse(`<div id="crash-display">🚀 <span class="cmd">1.00x</span> | Bet: ${formatBits(bet)}</div>`);
  printResponse("Multiplier increasing... (type 'crash cashout' to cash out)");

  // Start with slower updates
  let updateInterval = 500;
  let lastUpdate = Date.now();
  
  crashGame.timer = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdate) / 1000;
      lastUpdate = now;

      // Accelerate over time
      updateInterval = Math.max(50, 500 - (crashGame.multiplier * 10));
      
      // Increase multiplier faster as it goes higher
      const increment = 0.05 + (crashGame.multiplier * 0.01);
      crashGame.multiplier += increment * delta;
      crashGame.maxMultiplier = Math.max(crashGame.maxMultiplier, crashGame.multiplier);

      // Update display with color changes
      let colorClass = "green";
      if (crashGame.multiplier > 5) colorClass = "yellow";
      if (crashGame.multiplier > 10) colorClass = "orange";
      if (crashGame.multiplier > 20) colorClass = "red";
      
      $("#crash-display").html(
          `🚀 <span class="${colorClass}">${crashGame.multiplier.toFixed(2)}x</span> | ` +
          `Bet: ${formatBits(crashGame.bet)} | ` +
          `Potential: ${formatBits(Math.floor(crashGame.bet * crashGame.multiplier))}`
      );

      // Intensity increases with multiplier
      crashGame.intensity = Math.min(1, crashGame.multiplier / 30);
      
      // Apply screen shake effect
      if (crashGame.intensity > 0.3) {
          const shakeIntensity = Math.floor(crashGame.intensity * 5);
          $(".terminal-window").css({
              transform: `translate(${Math.random() * shakeIntensity}px, ${Math.random() * shakeIntensity}px)`
          });
      }

      // Check for crash
      if (Math.random() < getCrashChance(crashGame.multiplier)) {
          endCrashGame(false);
      }
  }, updateInterval);
}

function endCrashGame(voluntary) {
  clearInterval(crashGame.timer);
  $(".terminal-window").css({ transform: "" });

  if (voluntary) {
      const winnings = Math.floor(crashGame.bet * crashGame.multiplier);
      gameState.bits += winnings;
      
      printResponse(`<span class="green">💰 CASHED OUT at ${crashGame.multiplier.toFixed(2)}x!</span>`);
      printResponse(`You won ${formatBits(winnings)}! (Max reached: ${crashGame.maxMultiplier.toFixed(2)}x)`);
      
      // Achievement check
      if (crashGame.multiplier >= 10 && !gameState.achievements["crash_10x"]) {
          unlockAchievement("crash_10x", {
              name: "RISK T4K3R",
              desc: "Cashed out at 10x or higher in Crash",
              reward: () => gameState.bits += 500
          });
      }
  } else {
      // Crash effect
      printResponse(`<span class="red">💥 CRASHED at ${crashGame.multiplier.toFixed(2)}x!</span>`);
      printResponse(house_taunts[Math.floor(Math.random() * house_taunts.length)]);
      
      // Dramatic effect
      $("#crash-display").html(`<span class="blink">💥 BOOM! GAME OVER</span>`);
      setTimeout(() => {
          $("#crash-display").addClass("dim").removeClass("blink");

      }, 1000);
  }

  updateDriveUI();
  saveState();
  crashGame.timer = null;
}

  // matrix stuff lol 
  function startMatrixGame() {
    if (!bit_rain.activated) return;
    
    matrixGame.active = true;
    matrixGame.bitsCollected = 0;
    
    // Add event listener to canvas
    const canvas = document.getElementById("matrix-canvas");
    canvas.style.cursor = "pointer";
    canvas.addEventListener("click", handleMatrixClick);
    
    // Add UI indicator
    $("#drive-ui").append(`
        <div id="matrix-game-ui" class="matrix-game-ui">
            <span class="cmd">Bits Collected: <span id="matrix-bits">0</span></span>
            <div class="matrix-cooldown"></div>
        </div>
    `);
}

function stopMatrixGame() {
    matrixGame.active = false;
    const canvas = document.getElementById("matrix-canvas");
    canvas.style.cursor = "";
    canvas.removeEventListener("click", handleMatrixClick);
    $("#matrix-game-ui").remove();
}

function handleMatrixClick(e) {
    if (matrixGame.cooldown || !matrixGame.active) return;
    
    // Calculate if clicked a character (simple collision detection)
    const canvas = e.target;
    const ctx = canvas.getContext('2d');
    const fontSize = 14;
    const x = Math.floor(e.offsetX / fontSize);
    const y = Math.floor(e.offsetY / fontSize);
    
    // Check if clicked area has a visible character
    const pixel = ctx.getImageData(x * fontSize + 2, y * fontSize + 2, 1, 1).data;
    if (pixel[1] > 50) { // Green character detected
        collectBits(x, y);
    } else {
        printResponse("<span class='dim'>Missed! Try catching the falling characters</span>");
    }
}

function collectBits(x, y) {
    const now = Date.now();
    if (now - matrixGame.lastCollection < 1000) return; // 1 second cooldown
    
    matrixGame.cooldown = true;
    matrixGame.bitsCollected += matrixGame.collectionRate;
    gameState.bits += matrixGame.collectionRate;
    
    // Visual feedback
    $("#matrix-bits").text(matrixGame.bitsCollected);
    $(`<div class="bit-collect-feedback">+${matrixGame.collectionRate}</div>`)
        .css({
            left: x * 14 + 5,
            top: y * 14 + 5
        })
        .appendTo("#matrix-canvas")
        .animate({
            top: "-=30",
            opacity: 0
        }, 500, () => $(this).remove());
    
    // Cooldown indicator
    $(".matrix-cooldown").css("width", "100%")
        .animate({ width: "0%" }, 1000, () => {
            matrixGame.cooldown = false;
        });
    
    matrixGame.lastCollection = now;
    updateDriveUI();
    saveState();
}

  // HISTORY
  const lastCommands = [];
  let commandIndex = 0;


  // Add command to history
  function add_to_last_commands(command) {
      if (!command || command.trim() === '') return;
      
      // Don't add duplicate consecutive commands
      if (lastCommands.length > 0 && lastCommands[lastCommands.length-1] === command) {
          return;
      }
      
      lastCommands.push(command);
      
      // Keep only the last 50 commands
      if (lastCommands.length > 50) {
          lastCommands.shift();
      }
      
      // Reset navigation index
      commandIndex = 0;
  }

  // Command history navigation
  function navigateHistory(direction) {
      if (lastCommands.length === 0) return '';
      
      commandIndex = Math.max(0, Math.min(lastCommands.length, commandIndex + direction));
      
      if (commandIndex === 0) {
          return ''; // Return empty string when at "live" position
      }
      
      return lastCommands[lastCommands.length - commandIndex];
  }
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


    if (!gameState.stats) {
      gameState.stats = getDefaultStats();    
    // For timeActive, we can't recover it, so leave at 0
    } else {
      // Ensure all stat fields exist (for future additions)
      const defaultStats = getDefaultStats();
      for (const key in defaultStats) {
        if (gameState.stats[key] === undefined) {
          gameState.stats[key] = defaultStats[key];
        }
      }
    }
  
    if (storedFiles) userFiles = JSON.parse(storedFiles);
    if (storedUser) user = storedUser;
    if (storedGame) {
      gameState = JSON.parse(storedGame);
      if (gameState.achievements) {
        first_ach = true
      }
    }
    if (storedGame) console.log("Found a Save. Loading.")
        // If we found save data, begin game loop
 
    // Calculate offline bits earned
    if (storedGame) { // However....

      const now = Date.now();
      const secondsOffline = Math.floor((now - lastPlayed) / 1000);
      const earnedOffline = secondsOffline * gameState.bitsPerSecond
      gameState.bits += earnedOffline;
      if (earnedOffline > 0.9) {
      printResponse(
        `<i class="dim">Recovered <span class="cmd">${formatBits(earnedOffline)}</span> while you were gone...</i>`
      );
      }
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

      const bps = calculateBPS()
      gameState.bitsPerSecond = bps;
  
      const added = Math.min(bps * delta, gameState.driveCapacity - gameState.bits);
      gameState.bits += added;
  
      if (added > 0) {
        updateSecretFileDisplay();
;
        $("#drive-used").addClass("bit-flash");
        setTimeout(() => $("#drive-used").removeClass("bit-flash"), 500);

      }
      updateDriveUI()
      lastTick = now;

      
      checkAchievements();
      // Update stats 
      timeOpen ++
      if (gameState.stats) {
        gameState.stats.timeActive = timeOpen
      }
      // Use it for autosaving every roughly 5-10 mins
      if (timeOpen % 300 == 0) { 
        saveState();
      }
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
        if (!first_ach) {
          printResponse(`Do <span class="cmd">ach</span> to see!`);
          first_ach = true;
        }
        saveState()
      }
    });
  }
  function unlockAchievement(id) {
    const a = achievements.find(a => a.id === id);
    if (!a || gameState.achievements[id]) return; // already unlocked or doesn't exist
    a.reward();
    gameState.achievements[id] = true;

    printResponse(`Achievement Unlocked: <span class="g">${a.name}\n<i>${a.desc}</i>`);
    if (!first_ach) {
      printResponse(`Do <span class="cmd">ach</span> to see!`);
      first_ach = true
    }
    saveState()
  }
  


  function printResponse(text) {
    // Do Corruption 
    let p = calculate_percentage(gameState.driveCapacity, gameState.bits)
    let p_text = processLeet(text, p)
    // Only modify text parts that aren't HTML tags
    const redText = p_text.replace(
      /(^|>)([^<]+)(<|$)/g,
      (match, prefix, content, suffix) => {
        const redContent = content.replace(
          /(-?\d[\d,.]*)([a-zA-Z%]*)/g,
          '<span class="red">$1</span>$2'
        );
        return prefix + redContent + suffix;
      }
    );
   
    const lines = redText.trim().split("\n");
    for (const line of lines) {
      let k = $output.append(`<p>${line}</p>`);
    }
    const element = document.getElementById("command-line");
    element.scrollIntoView(false);

  }

  function safetyprintResponse(text) {
    // Like the above function, but without that fancy bullshit. 
    // Because sometimes it gets in the darn way.
    const lines = text.trim().split("\n");
    for (const line of lines) {
      let k = $output.append(`<p>${line}</p>`);
    }
    const element = document.getElementById("command-line");
    element.scrollIntoView(false);
  }


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
          `<span class="dim">%%H-hey there, looks like you're uh having some trouble.%%<br>%%You can just start typing... Look, here's a help command.%%</span>`,
        );
        printResponse(commands.help);
        systemBored = true;
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
        if (systemBored) {
        unlockAchievement("boredom")
        }
      }},
      5 * 60 * 1000,
    );
  }

  function getUserFiles() {
    return userFiles[user] || [];
  }

  function executeCommand(input) {
    if (!input || input.trim() === '') {
      // Don't add empty commands to history
      return;
  }
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

    if (gameState.stats) {
      gameState.stats.totalCommands ++ 
    }
    if (reset_flag && command != "reset") {
      reset_flag = false
    }
      if (!(command === "" || command === "clear")) {
          add_to_last_commands(input);
      }
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
        let listing = files
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
          const failures = [
            `sudo: luser ${user} not in sudoers`,
            `[sudo] password for ${user}: [hint: try 'su']`,
            `Permission denied (audible laugh from terminal)`,

          ];
          printResponse(failures[Math.floor(Math.random()*failures.length)])

        }
        break;

      case "whoami":
        printResponse(user);
        unlockAchievement("who")
        break;

      case "adduser":
        //console.log(args);
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
        }
        
          printResponse(`Added user: ${username}`);
          user = username;
          $(".terminal-input .prompt").html(
            `<span class="cmd">${user}</span>@flowiz:~$`,
          );
          updateDriveUI();
          userFiles[username] = [
            { name: "secret.txt", text: "<span class='red'>Thank You.</span>", size: "0B" },
          ];
        gameState.stats.usersCreated += 1;
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
          if (giveChance()) {
            printResponse(`<span class="dim">psst: try <span class="cmd">start</span>!</span>`)
          }
          break;
        }
          else {
          printResponse(`
            <u>Game Statistics</u>:
            Commands executed: ${gameState.stats.totalCommands}
            Time active: ${Math.floor(gameState.stats.timeActive / 60)} minutes
            Files created: ${gameState.stats.filesCreated}
            
            <u>Generator Rates</u>:
            ${gameState.generators.map(gen => 
              `\n-${gen.name}: ${formatBits(getGeneratorRate(gen))}/s ` +
              `(Base: ${gen.rate}, ` +
              `Scaling: ${gen.scaling.type} * ${gen.scaling.multiplier})`
            ).join('<br>')}
          `);}
        
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
        if (!gameRunning) {
            printResponse("Shopper? I hardly know 'er!");
            if (giveChance()) {
                printResponse(`<span class="dim">psst: try <span class="cmd">start</span>!</span>`)
            }
            break;
        }
        
        // Calculate corruption percentage for leet speak
        calculate_percentage(gameState.driveCapacity, gameState.bits);
        
        printResponse(`<u>%%Data Generators%%</u> (Use <span class="cmd">buy [index]</span>):`);
        
        // Create a table-like display
        fileGenerators.forEach((gen, i) => {
            const owned = gameState.generators?.find(g => g.name === gen.name)?.count || 0;
            const desc = gen.desc.length > 0 
                ? gen.desc[Math.floor(Math.random() * gen.desc.length)]
                : "%%A mysterious data source%%";
            printResponse(`
                [${i}] <span class="cmd">${gen.name}</span> ${owned > 0 ? `(x${owned})` : ''}
                Rate: ${gen.rate}B/s each
                Cost: ${formatBits(gen.cost)}
                <i class="dim">${desc}</i>
            `);
        });
        break;
      
        case "buy":
          if (!gameRunning) {
            printResponse(`There's no way <class="cmd">buy</span> is a real command.`)
            if (giveChance()) {
              printResponse(`<span class="dim"> siiigh -- > </span><button class="inline-btn cmd-btn" data-cmd="start">[Start Game]</button>`)
            }
            break;
          }
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
          
          // Check if we already have this generator
          const existingIndex = gameState.generators.findIndex(g => g.name === gen.name);
          if (existingIndex >= 0) {
              gameState.generators[existingIndex].count = (gameState.generators[existingIndex].count || 1) + 1;
          } else {
              gameState.generators.push({ 
                  ...gen,
                  count: 1 
              });
          }
      
          // Scale price up for future purchases
          gen.cost = Math.floor(gen.cost * 1.5);
          
          const newCount = existingIndex >= 0 ? gameState.generators[existingIndex].count : 1;
          printResponse(`Purchased <span class="cmd">${gen.name}</span>! (Now have ${newCount})`);
          const desc = gen.desc.length > 0 
          ? gen.desc[Math.floor(Math.random() * gen.desc.length)]
          : "%%A mysterious data source%%";
          printResponse(desc)
          saveState();
          break;


      
      case "achievements":
      case "ach":
        let html = `<div class="achievement-grid">`;
        // This is dumb and requires its OWN regex.. for some reason.
        let p = calculate_percentage(gameState.driveCapacity, gameState.bits)
        for (const a of achievements) {
          const unlocked = gameState.achievements[a.id];
          html += `
            <div class="achievement-icon ${unlocked ? "unlocked" : "locked"}"
                  onclick="showAchievementDetails('${a.id}')"
                  title="${a.name}">
              🏆 ${a.name} - ${unlocked ? processLeet(a.desc, p): processLeet(a.hint,p)} 
              </div>`
        }
        html += `</div>`;
        $output.append(html);
        break;
      
      // Casino Commands !!!
      // Requires purchasing from the travelling merchant.
      case "casino":
        if (!casino_item.activated){
            // Emulate error
            if (gameState.stats) {
              gameState.stats.errorsTriggered ++
            }
            printResponse(
              `command not found: ${command}\nType 'help' to see available commands.`,
            );
          break;
        }
        printResponse(boxText(`-> The House Casino!
          slots [bet] -> Spins some slots.
          blackjack [rules] | [bet] -> starts a game of blackjack.
          roulette [table] | [spin] -> spins a roulette wheel.
          crash [bet] -> starts a game of crash`, "double"));
          break;
      // Activated as soon as you get casinos
      case "slots": 
        if (!casino_slots_item.activated) {
            if (gameState.stats) { // DRY be damned.
              gameState.stats.errorsTriggered ++
            }
            printResponse(
              `command not found: ${command}\nType 'help' to see available commands.`,
            );
          break;
        }
          
        const bet = parseInt(args[0] || "0");
        doSlots(bet);
        break;
      // Purchase on tuesdays after unlocking the casino
      case "blackjack":
        if (!casino_blackjack_item.activated) {
            printResponse("Blackjack not unlocked yet!");
            break;
        }
        
        if (args[0] === "rules") {
            printResponse(blackjackRules);
            break;
        }
        
        if (blackjackGame.active) {
            // Handle game commands
            const cmd = args[0];
            if (!blackjackGame.playerTurn) {
                printResponse("Wait for the next round!");
                break;
            }
            
            switch(cmd) {
                case "hit":
                    blackjackGame.playerHand.push(blackjackGame.deck.pop());
                    printResponse(`Player: ${displayHand(blackjackGame.playerHand)}`);
                    checkBlackjack();
                    break;
                    
                case "stand":
                    blackjackGame.playerTurn = false;
                    dealerPlay();
                    break;
                    
                case "double":
                    if (blackjackGame.playerHand.length === 2 && gameState.bits >= blackjackGame.bet) {
                        blackjackGame.bet *= 2;
                        blackjackGame.playerHand.push(blackjackGame.deck.pop());
                        printResponse(`Doubled bet to ${formatBits(blackjackGame.bet)}`);
                        printResponse(`Player: ${displayHand(blackjackGame.playerHand)}`);
                        blackjackGame.playerTurn = false;
                        dealerPlay();
                    } else {
                        printResponse("Can only double on first move with sufficient bits");
                    }
                    break;
                    
                default:
                    printResponse("Valid commands: hit, stand, double");
            }
        } else {
            // Start new game
            const bet = parseInt(args[0] || "0");
            if (bet < 10 || bet > 1000) {
                printResponse("Bet must be between 10 and 1000 bits");
                break;
            }
            
            if (gameState.bits < bet) {
                printResponse(`You need ${formatBits(bet)} to play`);
                break;
            }
            
            startBlackjack(bet);
        }
        break;
        // Add to command switch:
        case "roulette":
          if (!casino_roulette_item.activated) {
              printResponse("Roulette not unlocked yet!");
              break;
          }
          
          if (args[0] === "table") {
              printResponse(displayRouletteTable());
              break;
          }
          else if (args[0] === "spin" && args.length >= 3) {
              const betType = args[1].toLowerCase();
              const betValue = args[2];
              const betAmount = parseInt(args[3] || "0");
              
              // Validate bet
              if (betAmount < 5 || betAmount > 1000) {
                  printResponse("Bet must be between 5 and 1000 bits");
                  break;
              }
              
              if (gameState.bits < betAmount) {
                  printResponse(`You need ${formatBits(betAmount)} to play`);
                  break;
              }
              
              // Place bet
              gameState.bits -= betAmount;
              updateDriveUI();
              printResponse(boxText(`<span class='cmd'>Placing bet</span>\n<span class='g'>${betAmount}</span>`, 'double'));
              
              // Start spin animation
              printResponse("<span class='dim'>Spinning...</span>");
              spinRoulette().then(winningNumber => {
                  const winnings = calculatePayout(betType, betValue, betAmount, winningNumber);
                  
                  if (winnings > 0) {
                      gameState.bits += winnings;
                      printResponse(`<span class="g">You won ${formatBits(winnings)}!</span>`);
                      
                      // Special win messages
                      if (winnings >= betAmount * 35) {
                          printResponse("<span class='blink'>%%JACKPOT!!%%</span>");
                      } else if (winnings >= betAmount * 10) {
                          printResponse("<span class='yellow'>%%Big Winner!%%</span>");
                      }
                  } else {
                      printResponse(house_taunts[Math.floor(Math.random() * house_taunts.length)]);
                  }
                  
                  updateDriveUI();
                  saveState();
              });
          }
          else {
              printResponse(`
        <u>%%Terminal Roulette%%</u>
        <span class="cmd">Usage:</span> roulette [command] [args]

        <span class="cmd">Commands:</span>
        - table               : Show roulette table
        - spin [type] [value] [amount] : Place bet

        <span class="cmd">Bet Types:</span>
        - number [1-36,0,00]  : 35:1 payout
        - color [red/black]   : 1:1 payout
        - evenodd [even/odd]  : 1:1 payout
        - highlow [high/low]  : 1:1 payout
        - dozen [1st/2nd/3rd] : 2:1 payout
        - column [1/2/3]      : 2:1 payout
        - split [num-num]     : 17:1 payout (adjacent numbers)
        - street [row]        : 11:1 payout (row 1-12)
        - corner [num-num-num-num] : 8:1 payout

        <span class="cmd">Examples:</span>
        - roulette spin number 17 50
        - roulette spin color red 100
        - roulette spin dozen 1st 75
              `);
          }
          break;
        // Add to command switch:
      case "crash":
        if (!casino_crash_item.activated) {
            printResponse("Crash game not unlocked yet!");
            break;
        }
        
        if (args[0] === "cashout") {
            if (!crashGame.timer) {
                printResponse("No active crash game!");
                break;
            }
            endCrashGame(true);
        } else if (args[0] === "stats") {
            printResponse(`
                <u>%%Crash Game Stats%%</u>
                Base crash chance: ${(crashGame.baseCrashChance * 100).toFixed(2)}%
                Chance at 5x: ${(getCrashChance(5) * 100).toFixed(2)}%
                Chance at 10x: ${(getCrashChance(10) * 100).toFixed(2)}%
                Chance at 20x: ${(getCrashChance(20) * 100).toFixed(2)}%
                
                <span class="dim">Higher multipliers become exponentially riskier</span>
            `);
        } else {
            const bet = parseInt(args[0] || "0");
            if (bet < 20) {
                printResponse("Minimum bet is 20 bits");
                break;
            }
            
            if (gameState.bits < bet) {
                printResponse(`You need ${formatBits(bet)} to play`);
                break;
            }
            
            startCrashGame(bet);
        }
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
        printResponse("♡＾▽＾♡  <span class='g'>awa awa!</span>");
        break;

      case "author":
      case "owner":
      case "credits":
        printResponse(CREDITS);
        break;
      
      case "version":
      case "ver":
        printResponse(`Version: <span class="red">${VERSION}</span>-- "${VERSION_STR}"`);
        break;
      case "":
        printResponse("\n");
        break; 
      case "filestats":
        const fileCount = countAllFiles();
        const userCount = Object.keys(userFiles).length;
        
        printResponse(`
          <u>File System Statistics</u>:
          Total files: ${fileCount}
          Total users: ${userCount}
          Files per user:
          ${Object.keys(userFiles).map(user => 
            `\n- ${user}: ${userFiles[user].length} files`
          ).join('<br>\n')}
        `);
        break;

      case "debug":
        if (!gameRunning) {
          giveChance()
          printResponse(`</span><button class="inline-btn cmd-btn" data-cmd="start">Click this, run <span class="cmd">debug</span> again.</button>`)
          break;
        }
        debug = !debug
        console.log("debug")
        printResponse(`<span class="red">Debug Menu ${debug? "Activated" : "Deactivated"}</span>`)
        if (debug) {  
        printResponse(`Debug Help Menu: 
        - bitsgobrr        Adds 1000 Bits and doubles your amount.
        - generatorr       Gives 10 of each generator.
        - gambling         Unlocks Casino + Available Games
        - debug            Disables the debug menu
        `)
        }

        break;

      case "save":
        saveState()
        printResponse("Saved.")
        break;
      case "reset":
        if (reset_flag) {
          printResponse("Resetting state of website.");
          localStorage.clear();
          location.reload();
        } else {
          printResponse(`Type <span class="cmd">reset</span> again to delete your save.`)
          reset_flag = true;
        }
        break;
      case "gambling":
        if (debug) {
          casino_item.activated = true;
          casino_slots_item.activated = true
          casino_blackjack_item.activated = true
          casino_roulette_item.activated = true
          casino_hilo_item.activated = true
          casino_crash_item.activated = true
          printResponse("%%The House welcomes you%%")
          executeCommand("casino")
          break;
        }
      case "bitsgobrr":
        if (debug) {
          gameState.bits += 1000
          gameState.bits *= 2 
          printResponse(`Bits: ${String(gameState.bits)}`)
          saveState()
          break;
        }
      case "generatorr":
        if (debug) {
          fileGenerators.forEach(gen => {
            for (let i = 0; i < 10; i++) {
              gameState.generators.push({ ...gen });
            }
          });
          saveState()
          break;
        }
      default:
        if (commands[command]) {
          printResponse(commands[command]);
        } else {
          // Error!!
          if (gameState.stats) {
            gameState.stats.errorsTriggered ++
          }
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
    
    // Up arrow - previous command
    if (e.key === "ArrowUp") {
        e.preventDefault();
        const cmd = navigateHistory(1);
        $input.val(cmd);
        return;
    }
    
    // Down arrow - next command
    if (e.key === "ArrowDown") {
        e.preventDefault();
        const cmd = navigateHistory(-1);
        $input.val(cmd);
        return;
    }
    
    // Enter - execute command
    if (e.key === "Enter") {
        const cmd = $input.val();
        executeCommand(cmd);
        $input.val("");
        commandIndex = 0; // Reset navigation position
    }
    }
  );

  startIdleTimers();


  function startMatrixRain() {
    unlockAchievement("matrix")
    matrixActive = true;
    const canvas = document.getElementById("matrix-canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.display = "block";
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight;

    const letters = "アァイィウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789#$%&";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(0).map(() => 
      Math.random() * -100 // Start above canvas
  );
    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            
            // Color coding
            if ("0123456789".includes(text)) { 
                ctx.fillStyle = "#F00"; // Red numbers
            } else if ("#$%&".includes(text)) {
                ctx.fillStyle = "#FF0"; // Yellow special chars
            } else {
                ctx.fillStyle = "#0F0"; // Green kana
            }
            
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        
        // Start game if upgrade exists
        if (bit_rain.activated && !matrixGame.active) {
            startMatrixGame();
        }
    }

    const interval = setInterval(drawMatrix, 33);

    function stopMatrix() {
        clearInterval(interval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
        matrixActive = false;
        stopMatrixGame();
        document.removeEventListener("keydown", stopMatrix);
        document.removeEventListener("click", stopMatrix);
    }
    //document.addEventListener("keydown", stopMatrix);
    document.addEventListener("click", stopMatrix);
    // ... rest of your existing stop handler code ...
}});
console.log(`flowiz.moe ${VERSION} - https://flowiz.moe`);
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
