const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000
});

const FIELD = { width: 1000, height: 700 };
let lobbies = {};

// ========== ВСЕ 70 РЕЖИМОВ ==========
const ALL_MODES = [
    // 1-10: Базовые
    { id: 0, name: "🟢 Нормальный", category: "base", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 1, name: "🔴 Огромный мяч", category: "base", ballSize: 24, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 2, name: "⚡ Супер скорость", category: "base", ballSize: 12, playerSpeed: 9, friction: 0.98, kickPower: 12, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 3, name: "❄️ Лёд", category: "base", ballSize: 12, playerSpeed: 5, friction: 0.996, kickPower: 10, goalWidth: 150, ice: true, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 4, name: "🎈 Воздушный мяч", category: "base", ballSize: 12, playerSpeed: 5, friction: 0.992, kickPower: 8, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 5, name: "🐢 Черепахи", category: "base", ballSize: 12, playerSpeed: 3, friction: 0.985, kickPower: 8, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 6, name: "🎯 Точный удар", category: "base", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 18, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 7, name: "🪶 Перо", category: "base", ballSize: 12, playerSpeed: 5, friction: 0.999, kickPower: 5, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 8, name: "🧱 Стена", category: "base", ballSize: 12, playerSpeed: 4, friction: 0.96, kickPower: 4, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 9, name: "🌀 Турбо", category: "base", ballSize: 12, playerSpeed: 7, friction: 0.985, kickPower: 20, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    // 11-20: Специальные
    { id: 10, name: "🔄 Реверс", category: "special", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: true, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 11, name: "🎪 Батут", category: "special", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 12, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 1.4, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 12, name: "📏 Узкие ворота", category: "special", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 80, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 13, name: "🏓 Пинг-понг", category: "special", ballSize: 12, playerSpeed: 6, friction: 0.99, kickPower: 14, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 14, name: "🌪️ Вихрь", category: "special", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: true, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 15, name: "🔨 Молот", category: "special", ballSize: 12, playerSpeed: 4, friction: 0.97, kickPower: 22, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 16, name: "🦋 Бабочка", category: "special", ballSize: 12, playerSpeed: 5, friction: 0.99, kickPower: 8, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: true, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: true, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 17, name: "⛓️ Цепь", category: "special", ballSize: 12, playerSpeed: 5, friction: 0.95, kickPower: 6, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 18, name: "🔥 Фаербол", category: "special", ballSize: 14, playerSpeed: 5, friction: 0.987, kickPower: 12, goalWidth: 150, ice: false, fire: true, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 19, name: "🌟 Легендарный", category: "special", ballSize: 12, playerSpeed: 10, friction: 0.99, kickPower: 18, goalWidth: 200, ice: true, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: true, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    // 21-30: Магические
    { id: 20, name: "🧲 Магнит", category: "magic", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 8, goalWidth: 150, ice: false, fire: false, magnet: true, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 21, name: "🦘 Кенгуру", category: "magic", ballSize: 12, playerSpeed: 5, friction: 0.98, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 1.6, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 22, name: "💣 Бомба", category: "magic", ballSize: 16, playerSpeed: 5, friction: 0.985, kickPower: 14, goalWidth: 150, ice: false, fire: true, magnet: false, chaos: true, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 23, name: "🎲 Хаос", category: "magic", ballSize: 12, playerSpeed: 8, friction: 0.96, kickPower: 15, goalWidth: 150, ice: true, fire: true, magnet: true, chaos: true, teleport: true, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: true, randomSpin: true, bounce: 1.2, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 24, name: "🏃 Марафон", category: "magic", ballSize: 12, playerSpeed: 3, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: true, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 25, name: "🛡️ Щит", category: "magic", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 8, goalWidth: 100, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 26, name: "⚡ Молния", category: "magic", ballSize: 12, playerSpeed: 6, friction: 0.99, kickPower: 15, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: true, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 27, name: "🎭 Маскировка", category: "magic", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: true, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 28, name: "🔮 Магия", category: "magic", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: true, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: true, bounce: 0.85, marathon: false, disguise: false, magic: true, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 29, name: "💀 Смертельный", category: "magic", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    // 31-40: Препятствия
    { id: 30, name: "🔫 Лазеры", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: true, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 31, name: "🪤 Капканы", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: true, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 32, name: "🌊 Цунами", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: true, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 33, name: "🤖 Дроны", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: true, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 34, name: "💨 Ветряки", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: true, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 35, name: "🎰 Слот", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: true, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 36, name: "☠️ Ад", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: true, magnet: false, chaos: true, teleport: false, lasers: true, traps: true, waves: true, drones: true, wind: true, slot: false, hell: true, reverse: true, randomSpin: true, bounce: 1.3, marathon: false, disguise: true, magic: true, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 37, name: "🌿 Высокая трава", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: true, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 38, name: "🧱 Лабиринт", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: true, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 39, name: "🫥 Невидимые игроки", category: "obstacle", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: true, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    // 41-50: СМЕШНЫЕ
    { id: 40, name: "🐔 Курица", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 8, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: true, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 41, name: "💩 Скользкий", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.99, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: true, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 42, name: "🎈 Гелий", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: true, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 43, name: "🍌 Банановая кожура", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: true, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 44, name: "🎺 Туман", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: true, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 45, name: "🐌 Улитка", category: "funny", ballSize: 12, playerSpeed: 2, friction: 0.99, kickPower: 4, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.5, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 46, name: "🦄 Единорог", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: true, star: false, pixel: false, echo: false, future: false },
    { id: 47, name: "⭐ Звезда", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: true, pixel: false, echo: false, future: false },
    { id: 48, name: "🎨 Краски", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: true, star: false, pixel: false, echo: false, future: false },
    { id: 49, name: "🎮 8-bit", category: "funny", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: true, echo: false, future: false },
    // 51-60: ПРИКОЛЬНЫЕ
    { id: 50, name: "🔊 Эхо", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: true, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 51, name: "🔮 Будущее", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: true },
    { id: 52, name: "🏆 Турнир", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false, tournament: true },
    { id: 53, name: "🔄 Вращающееся поле", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: true, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 54, name: "🧬 Клонирование", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: true, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 55, name: "📡 Радар", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false, radar: true },
    { id: 56, name: "🎯 Гравитация", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: false, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: false, bounce: 0.85, marathon: false, disguise: false, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: true, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 57, name: "🎪 Цирк", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: true, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: false, hell: false, reverse: false, randomSpin: true, bounce: 1.2, marathon: false, disguise: true, magic: false, grass: false, invisible: false, walls: false, rotate: false, clone: true, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: true, star: false, pixel: false, echo: false, future: false },
    { id: 58, name: "🎰 Джекпот", category: "cool", ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, ice: false, fire: false, magnet: false, chaos: true, teleport: false, lasers: false, traps: false, waves: false, drones: false, wind: false, slot: true, hell: false, reverse: false, randomSpin: true, bounce: 0.85, marathon: false, disguise: false, magic: true, grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false, chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false, star: false, pixel: false, echo: false, future: false },
    { id: 59, name: "🌟 Мега-микс", category: "cool", ballSize: 20, playerSpeed: 9, friction: 0.95, kickPower: 20, goalWidth: 200, ice: true, fire: true, magnet: true, chaos: true, teleport: true, lasers: true, traps: true, waves: true, drones: true, wind: true, slot: true, hell: true, reverse: true, randomSpin: true, bounce: 1.5, marathon: true, disguise: true, magic: true, grass: true, invisible: true, walls: true, rotate: true, clone: true, gravity: true, chicken: true, slippery: true, helium: true, banana: true, fog: true, rainbow: true, star: true, pixel: true, echo: true, future: true }
];

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/ball.jpg', (req, res) => { res.sendFile(path.join(__dirname, 'ball.jpg')); });

function generateLobbyCode() { return Math.floor(1000 + Math.random() * 9000).toString(); }

function createLobby(selectedModes = null) {
    let code;
    do { code = generateLobbyCode(); } while (lobbies[code]);
    lobbies[code] = {
        code: code,
        players: {},
        ball: { x: 500, y: 350, vx: 0, vy: 0 },
        redScore: 0,
        blueScore: 0,
        currentModes: null,
        availableModes: selectedModes || [], // если null - все режимы
        lastGoalTime: 0,
        createdAt: Date.now(),
        gameActive: true,
        speedBoost: 0,
        slotTimer: 0,
        slotEffect: null
    };
    lobbies[code].currentModes = getRandomModes(lobbies[code].availableModes);
    return code;
}

function getRandomModes(availableModesIds) {
    let modesPool = ALL_MODES;
    if (availableModesIds && availableModesIds.length > 0) {
        modesPool = ALL_MODES.filter(m => availableModesIds.includes(m.id));
        if (modesPool.length === 0) modesPool = ALL_MODES;
    }
    
    const count = Math.min(Math.floor(Math.random() * 8) + 5, modesPool.length);
    const shuffled = [...modesPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    const combined = {
        name: selected.slice(0, 5).map(m => m.name.split(' ')[0]).join('+'),
        activeModes: selected.map(m => m.id),
        ballSize: 12, playerSpeed: 5, friction: 0.985, kickPower: 10, goalWidth: 150, bounce: 0.85,
        ice: false, fire: false, magnet: false, chaos: false, teleport: false, reverse: false,
        randomSpin: false, marathon: false, disguise: false, magic: false, lasers: false, traps: false,
        waves: false, drones: false, wind: false, slot: false, hell: false,
        grass: false, invisible: false, walls: false, rotate: false, clone: false, gravity: false,
        chicken: false, slippery: false, helium: false, banana: false, fog: false, rainbow: false,
        star: false, pixel: false, echo: false, future: false
    };
    
    for (const mode of selected) {
        if (mode.ballSize > combined.ballSize) combined.ballSize = mode.ballSize;
        if (mode.playerSpeed > combined.playerSpeed) combined.playerSpeed = mode.playerSpeed;
        if (mode.friction < combined.friction) combined.friction = mode.friction;
        if (mode.kickPower > combined.kickPower) combined.kickPower = mode.kickPower;
        if (mode.goalWidth < combined.goalWidth) combined.goalWidth = mode.goalWidth;
        if (mode.bounce && mode.bounce > combined.bounce) combined.bounce = mode.bounce;
        
        if (mode.ice) combined.ice = true;
        if (mode.fire) combined.fire = true;
        if (mode.magnet) combined.magnet = true;
        if (mode.chaos) combined.chaos = true;
        if (mode.teleport) combined.teleport = true;
        if (mode.reverse) combined.reverse = true;
        if (mode.randomSpin) combined.randomSpin = true;
        if (mode.marathon) combined.marathon = true;
        if (mode.disguise) combined.disguise = true;
        if (mode.magic) combined.magic = true;
        if (mode.lasers) combined.lasers = true;
        if (mode.traps) combined.traps = true;
        if (mode.waves) combined.waves = true;
        if (mode.drones) combined.drones = true;
        if (mode.wind) combined.wind = true;
        if (mode.slot) combined.slot = true;
        if (mode.hell) combined.hell = true;
        if (mode.grass) combined.grass = true;
        if (mode.invisible) combined.invisible = true;
        if (mode.walls) combined.walls = true;
        if (mode.rotate) combined.rotate = true;
        if (mode.clone) combined.clone = true;
        if (mode.gravity) combined.gravity = true;
        if (mode.chicken) combined.chicken = true;
        if (mode.slippery) combined.slippery = true;
        if (mode.helium) combined.helium = true;
        if (mode.banana) combined.banana = true;
        if (mode.fog) combined.fog = true;
        if (mode.rainbow) combined.rainbow = true;
        if (mode.star) combined.star = true;
        if (mode.pixel) combined.pixel = true;
        if (mode.echo) combined.echo = true;
        if (mode.future) combined.future = true;
    }
    
    if (combined.chaos) {
        combined.ballSize = Math.min(32, combined.ballSize + Math.random() * 10);
        combined.playerSpeed = Math.min(14, combined.playerSpeed + Math.random() * 5);
        combined.kickPower = Math.min(30, combined.kickPower + Math.random() * 10);
    }
    
    return combined;
}

function handleBallCollision(player, ballState, mode) {
    const dx = player.x - ballState.x, dy = player.y - ballState.y;
    const dist = Math.hypot(dx, dy);
    const minDist = 22 + (mode.ballSize || 12);
    if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;
        ballState.x -= Math.cos(angle) * (overlap + 2);
        ballState.y -= Math.sin(angle) * (overlap + 2);
        let playerSpeed = Math.hypot(player.vx || 0, player.vy || 0);
        let kickAngle = angle;
        let kickForce = mode.kickPower || 10;
        if (playerSpeed > 1) {
            kickAngle = Math.atan2(player.vy || 0, player.vx || 0);
            kickForce = Math.min((mode.kickPower || 10) + 5, (mode.kickPower || 10) + playerSpeed);
        }
        if (mode.reverse) kickAngle = kickAngle + Math.PI;
        if (mode.randomSpin) kickAngle += (Math.random() - 0.5) * 1.5;
        if (mode.magic) { kickForce += (Math.random() - 0.5) * 8; kickAngle += (Math.random() - 0.5) * 2; }
        if (mode.chicken) { kickForce *= 0.7; kickAngle += (Math.random() - 0.5) * 2; }
        if (mode.banana) { kickAngle += (Math.random() - 0.5) * 3; }
        ballState.vx = Math.cos(kickAngle) * kickForce;
        ballState.vy = Math.sin(kickAngle) * kickForce;
        if (mode.chaos) { ballState.vx += (Math.random() - 0.5) * 8; ballState.vy += (Math.random() - 0.5) * 8; }
        if (mode.magnet) { ballState.vx += (player.x - ballState.x) * 0.08; ballState.vy += (player.y - ballState.y) * 0.08; }
        const maxSpeed = mode.teleport ? 25 : 20;
        const speed = Math.hypot(ballState.vx, ballState.vy);
        if (speed > maxSpeed) { ballState.vx = ballState.vx / speed * maxSpeed; ballState.vy = ballState.vy / speed * maxSpeed; }
        return true;
    }
    return false;
}

function updateLobbyPhysics(lobby) {
    const mode = lobby.currentModes;
    const ball = lobby.ball;
    
    if (mode.marathon) lobby.speedBoost = Math.min(lobby.speedBoost + 0.02, 6);
    let friction = mode.friction || 0.985;
    if (mode.ice) friction = Math.min(0.998, friction);
    if (mode.slippery) friction *= 0.99;
    
    ball.vx *= friction;
    ball.vy *= friction;
    
    if (mode.gravity) ball.vy += 0.3;
    if (mode.helium) ball.vy -= 0.2;
    
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    if (mode.magnet && Object.keys(lobby.players).length > 0) {
        let closest = null, closestDist = Infinity;
        for (let id in lobby.players) {
            const p = lobby.players[id];
            const dist = Math.hypot(p.x - ball.x, p.y - ball.y);
            if (dist < closestDist) { closestDist = dist; closest = p; }
        }
        if (closest && closestDist < 150) {
            const angle = Math.atan2(closest.y - ball.y, closest.x - ball.x);
            ball.vx += Math.cos(angle) * 0.4;
            ball.vy += Math.sin(angle) * 0.4;
        }
    }
    
    if (mode.teleport && Math.random() < 0.008) {
        ball.x = Math.random() * (FIELD.width - 100) + 50;
        ball.y = Math.random() * (FIELD.height - 100) + 50;
        ball.vx = (Math.random() - 0.5) * 12;
        ball.vy = (Math.random() - 0.5) * 12;
    }
    
    if (mode.lasers) {
        const time = Date.now() / 1000;
        for (let i = 0; i < 4; i++) {
            const angle = time + i * Math.PI / 2;
            const x1 = 500 + Math.cos(angle) * 350, y1 = 350 + Math.sin(angle) * 250;
            const x2 = 500 - Math.cos(angle) * 350, y2 = 350 - Math.sin(angle) * 250;
            const distToLine = Math.abs((y2 - y1) * ball.x - (x2 - x1) * ball.y + x2 * y1 - y2 * x1) / Math.hypot(y2 - y1, x2 - x1);
            if (distToLine < 20) { ball.vx += (Math.random() - 0.5) * 8; ball.vy += (Math.random() - 0.5) * 8; }
        }
    }
    
    if (mode.traps) {
        for (let i = 0; i < 8; i++) {
            const trapX = 150 + (i * 100) % 800, trapY = 100 + Math.floor(i / 3) * 150;
            if (Math.hypot(ball.x - trapX, ball.y - trapY) < 25) { ball.vx *= 0.5; ball.vy *= 0.5; }
        }
    }
    
    if (mode.waves) {
        const waveX = 500 + Math.sin(Date.now() / 800) * 400;
        if (Math.abs(ball.x - waveX) < 40 && ball.y > 200 && ball.y < 500) { ball.vx += (ball.x < waveX ? 5 : -5); }
    }
    
    if (mode.drones) {
        const time = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
            const droneX = 300 + Math.sin(time * 1.5 + i) * 200, droneY = 200 + Math.cos(time * 1.2 + i) * 200;
            if (Math.hypot(ball.x - droneX, ball.y - droneY) < 30) {
                const angle = Math.atan2(ball.y - droneY, ball.x - droneX);
                ball.vx += Math.cos(angle) * 6; ball.vy += Math.sin(angle) * 6;
            }
        }
    }
    
    if (mode.wind) {
        const windZones = [[200,200], [800,200], [500,550], [300,400], [700,400]];
        for (let zone of windZones) {
            if (Math.hypot(ball.x - zone[0], ball.y - zone[1]) < 60) {
                const angleToCenter = Math.atan2(zone[1] - ball.y, zone[0] - ball.x);
                ball.vx += Math.cos(angleToCenter) * 2; ball.vy += Math.sin(angleToCenter) * 2;
            }
        }
    }
    
    if (mode.slot && Date.now() - lobby.slotTimer > 5000) {
        lobby.slotTimer = Date.now();
        const effects = ['speed', 'chaos', 'magnet', 'reverse', 'teleport'];
        lobby.slotEffect = effects[Math.floor(Math.random() * effects.length)];
    }
    if (mode.slot && lobby.slotEffect === 'speed') { ball.vx *= 1.2; ball.vy *= 1.2; }
    else if (mode.slot && lobby.slotEffect === 'chaos') { ball.vx += (Math.random() - 0.5) * 5; ball.vy += (Math.random() - 0.5) * 5; }
    
    for (let iter = 0; iter < 3; iter++) {
        for (let id in lobby.players) { handleBallCollision(lobby.players[id], ball, mode); }
    }
    
    const bounce = mode.bounce || 0.85;
    const ballSize = mode.ballSize || 12;
    
    if (ball.x - ballSize < 10) { ball.x = 10 + ballSize; ball.vx = -ball.vx * bounce; }
    if (ball.x + ballSize > FIELD.width - 10) { ball.x = FIELD.width - 10 - ballSize; ball.vx = -ball.vx * bounce; }
    if (ball.y - ballSize < 10) { ball.y = 10 + ballSize; ball.vy = -ball.vy * bounce; }
    if (ball.y + ballSize > FIELD.height - 10) { ball.y = FIELD.height - 10 - ballSize; ball.vy = -ball.vy * bounce; }
    
    const now = Date.now();
    const goalZone = FIELD.height/2 - (mode.goalWidth || 150)/2;
    
    if (now - lobby.lastGoalTime > 2000 && lobby.gameActive) {
        if (ball.x - ballSize < 15 && ball.y > goalZone && ball.y < goalZone + (mode.goalWidth || 150)) {
            lobby.blueScore++;
            lobby.lastGoalTime = now;
            lobby.currentModes = getRandomModes(lobby.availableModes);
            lobby.slotTimer = 0; lobby.speedBoost = 0;
            lobby.ball = { x: 500, y: 350, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 };
            const winner = lobby.blueScore >= 5 ? 'blue' : null;
            if (winner) lobby.gameActive = false;
            return { team: 'blue', winner: winner, newMode: lobby.currentModes.name };
        }
        else if (ball.x + ballSize > FIELD.width - 15 && ball.y > goalZone && ball.y < goalZone + (mode.goalWidth || 150)) {
            lobby.redScore++;
            lobby.lastGoalTime = now;
            lobby.currentModes = getRandomModes(lobby.availableModes);
            lobby.slotTimer = 0; lobby.speedBoost = 0;
            lobby.ball = { x: 500, y: 350, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 };
            const winner = lobby.redScore >= 5 ? 'red' : null;
            if (winner) lobby.gameActive = false;
            return { team: 'red', winner: winner, newMode: lobby.currentModes.name };
        }
    }
    
    if (Math.abs(ball.vx) < 0.3 && Math.abs(ball.vy) < 0.3) { ball.vx = 0; ball.vy = 0; }
    return null;
}

io.on('connection', (socket) => {
    console.log(`✅ Игрок подключился: ${socket.id}`);
    let currentLobby = null;
    
    socket.on('createLobby', ({ selectedModes } = {}) => {
        const code = createLobby(selectedModes);
        console.log(`🎮 Создано лобби: ${code} с режимами: ${selectedModes ? selectedModes.length + ' выбранных' : 'все 70'}`);
        socket.emit('lobbyCreated', { code });
    });
    
    socket.on('joinLobby', ({ code }) => {
        const lobby = lobbies[code];
        if (!lobby) { socket.emit('joinError', { message: 'Лобби не найдено!' }); return; }
        
        const redCount = Object.values(lobby.players).filter(p => p.team === 'red').length;
        const blueCount = Object.values(lobby.players).filter(p => p.team === 'blue').length;
        const team = redCount <= blueCount ? 'red' : 'blue';
        
        lobby.players[socket.id] = {
            id: socket.id.slice(0, 6), x: team === 'red' ? 200 : FIELD.width - 200,
            y: Math.random() * (FIELD.height - 100) + 50, team: team, vx: 0, vy: 0
        };
        currentLobby = code;
        socket.join(code);
        
        const availableModesList = lobby.availableModes.length > 0 ? 
            ALL_MODES.filter(m => lobby.availableModes.includes(m.id)).map(m => ({ id: m.id, name: m.name })) : 
            ALL_MODES.map(m => ({ id: m.id, name: m.name }));
        
        socket.emit('joinSuccess', { 
            code, team, players: lobby.players, ball: lobby.ball, 
            redScore: lobby.redScore, blueScore: lobby.blueScore, 
            mode: lobby.currentModes,
            availableModes: availableModesList
        });
        io.to(code).emit('lobbyUpdate', { players: lobby.players, ball: lobby.ball, redScore: lobby.redScore, blueScore: lobby.blueScore, mode: lobby.currentModes });
        console.log(`✅ Игрок в лобби ${code}, команда ${team}`);
    });
    
    socket.on('move', (data) => {
        if (!currentLobby || !lobbies[currentLobby]) return;
        const lobby = lobbies[currentLobby];
        const player = lobby.players[socket.id];
        if (!player) return;
        const mode = lobby.currentModes;
        let speed = mode.playerSpeed || 5;
        if (mode.marathon) speed += lobby.speedBoost || 0;
        if (mode.slippery) speed *= 0.8;
        player.vx = data.dx; player.vy = data.dy;
        let newX = player.x + data.dx, newY = player.y + data.dy;
        newX = Math.min(Math.max(newX, 32), FIELD.width - 32);
        newY = Math.min(Math.max(newY, 32), FIELD.height - 32);
        player.x = newX; player.y = newY;
    });
    
    socket.on('disconnect', () => {
        if (currentLobby && lobbies[currentLobby]) {
            delete lobbies[currentLobby].players[socket.id];
            io.to(currentLobby).emit('lobbyUpdate', { players: lobbies[currentLobby].players, ball: lobbies[currentLobby].ball, redScore: lobbies[currentLobby].redScore, blueScore: lobbies[currentLobby].blueScore, mode: lobbies[currentLobby].currentModes });
            if (Object.keys(lobbies[currentLobby].players).length === 0) delete lobbies[currentLobby];
        }
    });
});

setInterval(() => {
    for (let code in lobbies) {
        const lobby = lobbies[code];
        const goal = updateLobbyPhysics(lobby);
        io.to(code).emit('lobbyUpdate', { players: lobby.players, ball: lobby.ball, redScore: lobby.redScore, blueScore: lobby.blueScore, mode: lobby.currentModes });
        if (goal) io.to(code).emit('goal', goal);
    }
}, 1000 / 60);

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║         ⚽ 70 РЕЖИМОВ + КАСТОМНЫЕ ЛОББИ! МНОЖЕСТВЕННЫЕ РЕЖИМЫ ⚽         ║
    ╠══════════════════════════════════════════════════════════════════════════╣
    ║  🎲 Каждый раунд - 5-12 случайных режимов ОДНОВРЕМЕННО!                  ║
    ║  🎮 КАСТОМНЫЕ ЛОББИ - выбирай какие режимы могут попадаться!            ║
    ║  🌟 70 режимов: Базовые | Специальные | Магические | Препятствия        ║
    ║  🐔 Смешные: Курица | Банан | Туман | Улитка | Единорог                  ║
    ║  🌿 Высокая трава - игроков и мяч не видно!                              ║
    ║  🧱 Лабиринт - стены на поле!                                            ║
    ╠══════════════════════════════════════════════════════════════════════════╣
    ║  🌐 Сервер: http://localhost:${PORT}                                      ║
    ║  📋 Правила: Игра до 5 голов. После гола - НОВЫЙ НАБОР из выбранных режимов║
    ╚══════════════════════════════════════════════════════════════════════════╝
    `);
});