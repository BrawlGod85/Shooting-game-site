// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// UI elements
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const ui = document.getElementById("ui");
const hpBar = document.getElementById("hp-bar");
const hpText = document.getElementById("hp-text");
const ammoBar = document.getElementById("ammo-bar");
const ammoText = document.getElementById("ammo-text");
const levelText = document.getElementById("level");
const xpText = document.getElementById("xp");

const keys = {};
let mouse = { x: 0, y: 0 };
let mouseDown = false;
let gameStarted = false;

// Player
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 40,
  speed: 5,
  color: "yellow",
  xp: 0,
  level: 1,
  weaponLevel: 1,
  maxHp: 150,
  hp: 150,
  ammo: 100
};

// Weapons
const weapons = [
  { name: "Basic Gun", damage: 15, speed: 10, color: "gray", bulletColor: "orange" },
  { name: "Blaster", damage: 25, speed: 12, color: "blue", bulletColor: "cyan" },
  { name: "Pulse Rifle", damage: 40, speed: 14, color: "green", bulletColor: "lime" },
  { name: "Plasma Cannon", damage: 55, speed: 16, color: "purple", bulletColor: "magenta" },
  { name: "Quantum Gun", damage: 75, speed: 18, color: "gold", bulletColor: "yellow" },
  { name: "Divine Blaster", damage: 100, speed: 20, color: "white", bulletColor: "lightblue" },
];

let enemies = [];
let bullets = [];
let enemyBullets = [];
let canShoot = true;

// Controls
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("mousemove", e => mouse = { x: e.clientX, y: e.clientY });
document.addEventListener("mousedown", () => { mouseDown = true; shootBullet(); });
document.addEventListener("mouseup", () => mouseDown = false);

// Start game
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  ui.classList.remove("hidden");
  canvas.style.display = "block";
  gameStarted = true;
  gameLoop();
});

// Move player
function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Boundaries
  if (player.x - player.size < 0) player.x = player.size;
  if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
  if (player.y - player.size < 0) player.y = player.size;
  if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

// Player shooting
function shootBullet() {
  if (!gameStarted || !canShoot || player.ammo <= 0) return;
  canShoot = false;
  setTimeout(() => canShoot = true, 200);

  player.ammo--;
  const weapon = weapons[player.weaponLevel - 1];
  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;
  const angle = Math.atan2(dy, dx);

  bullets.push({
    x: player.x + Math.cos(angle) * player.size,
    y: player.y + Math.sin(angle) * player.size,
    dx: Math.cos(angle) * weapon.speed,
    dy: Math.sin(angle) * weapon.speed,
    size: 6,
    color: weapon.bulletColor,
    damage: weapon.damage
  });
}

// Spawn enemies
function spawnEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 30,
    color: "red",
    hp: 30 + player.level * 5,
    maxHp: 30 + player.level * 5,
    fireRate: 0.01 // chance to shoot each frame
  });
}

// Enemy shooting
function shootEnemyBullet(enemy) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const angle = Math.atan2(dy, dx);
  enemyBullets.push({
    x: enemy.x,
    y: enemy.y,
    dx: Math.cos(angle) * 5,
    dy: Math.sin(angle) * 5,
    size: 6,
    color: "red",
    damage: 15
  });
}

// Update bullets
function updateBullets() {
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i,1);

    enemies.forEach((e,j) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < b.size + e.size) {
        e.hp -= b.damage;
        bullets.splice(i,1);
        if (e.hp <=0) {
          player.hp = Math.min(player.hp + 3, player.maxHp);
          player.ammo = Math.min(player.ammo + 3, 100);
          player.xp += 10;
          if (player.xp >= player.level * 20) {
            player.xp = 0;
            player.level++;
            if (player.level % 5 === 0) player.weaponLevel = Math.min(player.weaponLevel +1, weapons.length);
          }
          enemies.splice(j,1);
        }
      }
    });
  });
}

// Update enemy bullets
function updateEnemyBullets() {
  enemyBullets.forEach((b,i) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x <0 || b.x > canvas.width || b.y<0 || b.y>canvas.height) enemyBullets.splice(i,1);

    if (Math.hypot(b.x - player.x, b.y - player.y) < b.size + player.size) {
      player.hp -= b.damage;
      enemyBullets.splice(i,1);
      if (player.hp <=0) {
        alert("Game Over!");
        location.reload();
      }
    }
  });
}

// Draw everything
function draw() {
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI*2);
  ctx.fill();

  // Gun
  const weapon = weapons[player.weaponLevel - 1];
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(angle);
  ctx.fillStyle = weapon.color;
  ctx.fillRect(0, -5, player.size+20, 10);
  ctx.restore();

  // Player bullets
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.size,0,Math.PI*2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "black";
    ctx.fillRect(e.x - e.size, e.y - e.size -10, e.size*2, 5);
    ctx.fillStyle = "green";
    ctx.fillRect(e.x - e.size, e.y - e.size -10, (e.hp/e.maxHp)*e.size*2, 5);

    // Move toward player
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    const speed = 1 + player.level * 0.05;
    if(dist>0){
      e.x += (player.x - e.x)/dist*speed;
      e.y += (player.y - e.y)/dist*speed;
    }

    // Shooting
    if(Math.random() < e.fireRate) shootEnemyBullet(e);
  });

  // Enemy bullets
  enemyBullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
    ctx.fill();
  });
}

// Update UI
function updateUI() {
  hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
  hpText.textContent = `${player.hp}/${player.maxHp}`;
  ammoBar.style.width = (player.ammo) + "%";
  ammoText.textContent = player.ammo;
  levelText.textContent = player.level;
  xpText.textContent = player.xp;
}

// Main game loop
function gameLoop() {
  if(!gameStarted) return;
  movePlayer();
  if(mouseDown) shootBullet();
  updateBullets();
  updateEnemyBullets();
  draw();
  updateUI();
  if(Math.random()<0.02) spawnEnemy();
  requestAnimationFrame(gameLoop);
}
