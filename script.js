// Enhanced game state with new features
let game = {
  money: 200,
  weed: 0,
  seeds: 0,
  totalHarvested: 0,
  level: 1,
  xp: 0,
  upgrades: { 
    soil: false, 
    lights: false, 
    sprinkler: false,
    greenhouse: false,
    autopot: false,
    harvester: false,
    processor: false
  },
  fertilizerCount: 0,
  weather: { type: 'sunny', bonus: 0, temp: 72 },
  achievements: [],
  strains: { indica: 0, sativa: 0, hybrid: 0 },
  pots: [
    { id: 0, growth: 0, state: "empty", yield: 0, hydration: 100, fertilized: false, strain: 'regular', sick: false },
    { id: 1, growth: 0, state: "empty", yield: 0, hydration: 100, fertilized: false, strain: 'regular', sick: false },
    { id: 2, growth: 0, state: "empty", yield: 0, hydration: 100, fertilized: false, strain: 'regular', sick: false }
  ]
};

const potsDiv = document.getElementById("pots");
const messageDiv = document.getElementById("message");

const weatherTypes = [
  { type: 'sunny', bonus: 0.2, desc: 'Sunny ☀️' },
  { type: 'cloudy', bonus: 0, desc: 'Cloudy ☁️' },
  { type: 'rainy', bonus: -0.1, desc: 'Rainy 🌧️' },
  { type: 'perfect', bonus: 0.5, desc: 'Perfect 🌈' }
];

const achievements = [
  { id: 'first_plant', name: 'Green Thumb', desc: 'Plant your first seed', unlocked: false },
  { id: 'first_harvest', name: 'Harvest Time', desc: 'Harvest your first plant', unlocked: false },
  { id: 'big_harvest', name: 'Big Harvest', desc: 'Harvest 100g total', unlocked: false },
  { id: 'level_5', name: 'Experienced Grower', desc: 'Reach level 5', unlocked: false },
  { id: 'millionaire', name: 'Green Millionaire', desc: 'Earn $10,000', unlocked: false }
];

// Utility functions
function showMessage(text) {
  if (messageDiv) {
    messageDiv.textContent = text;
    setTimeout(() => {
      messageDiv.textContent = "";
    }, 3000);
  }
}

function getXPNeeded(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function addXP(amount) {
  game.xp += amount;
  checkLevelUp();
}

function checkLevelUp() {
  const xpNeeded = getXPNeeded(game.level);
  if (game.xp >= xpNeeded) {
    game.level++;
    game.xp -= xpNeeded;
    showLevelUp();
    checkAchievements();
  }
}

function showLevelUp() {
  const titles = ['Novice', 'Apprentice', 'Skilled', 'Expert', 'Master', 'Legendary'];
  const title = titles[Math.min(game.level - 1, titles.length - 1)];
  const levelUpModal = document.getElementById('level-up-modal');
  const levelUpText = document.getElementById('level-up-text');
  
  if (levelUpText) {
    levelUpText.innerHTML = 
      `Congratulations! You're now a Level ${game.level} ${title}!<br>
      You've unlocked new growing techniques and better yields!`;
  }
  if (levelUpModal) {
    levelUpModal.style.display = 'block';
  }
}

function closeLevelUpModal() {
  const modal = document.getElementById('level-up-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function updateWeather() {
  const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  game.weather = {
    type: weather.type,
    bonus: weather.bonus,
    temp: Math.floor(Math.random() * 20) + 65,
    desc: weather.desc
  };
}

function checkAchievements() {
  achievements.forEach(achievement => {
    if (!achievement.unlocked) {
      let unlock = false;
      switch(achievement.id) {
        case 'first_plant':
          unlock = game.pots.some(pot => pot.state !== 'empty');
          break;
        case 'first_harvest':
          unlock = game.totalHarvested > 0;
          break;
        case 'big_harvest':
          unlock = game.totalHarvested >= 100;
          break;
        case 'level_5':
          unlock = game.level >= 5;
          break;
        case 'millionaire':
          unlock = game.money >= 10000;
          break;
      }
      
      if (unlock) {
        achievement.unlocked = true;
        showMessage(`🏆 Achievement Unlocked: ${achievement.name}!`);
        addXP(50);
      }
    }
  });
}

// Plant management functions
function plant(id, strain = 'regular') {
  if (strain === 'regular' && game.seeds <= 0) {
    showMessage("No regular seeds!");
    return;
  }
  if (strain !== 'regular' && game.strains[strain] <= 0) {
    showMessage(`No ${strain} seeds!`);
    return;
  }
  
  if (strain === 'regular') {
    game.seeds--;
  } else {
    game.strains[strain]--;
  }
  
  let baseYield = Math.floor(Math.random() * 10) + 5;
  
  // Strain bonuses
  if (strain === 'indica') baseYield += 3;
  if (strain === 'sativa') baseYield += 5;
  if (strain === 'hybrid') baseYield += 8;
  
  // Upgrades
  if (game.upgrades.soil) baseYield += 5;
  if (game.upgrades.greenhouse) baseYield += 10;
  
  // Level bonus
  baseYield += Math.floor(game.level / 2);

  game.pots[id] = {
    ...game.pots[id],
    growth: 10,
    state: "growing",
    yield: baseYield,
    hydration: 100,
    fertilized: false,
    strain: strain,
    sick: false
  };
  
  showMessage(`Planted a ${strain} seed!`);
  addXP(5);
  checkAchievements();
  updateUI();
}

function waterPlant(id) {
  const pot = game.pots[id];
  if (pot.state !== "growing") return;
  
  pot.hydration = Math.min(100, pot.hydration + 30);
  pot.sick = false;
  showMessage("💧 Plant watered!");
  addXP(1);
  updateUI();
}

function growPlant(id) {
  const pot = game.pots[id];
  if (pot.state !== "growing") return;
  
  // Reduce hydration
  pot.hydration = Math.max(0, pot.hydration - 15);
  
  // Check if plant dies from dehydration
  if (pot.hydration <= 0) {
    pot.state = "dead";
    showMessage("💀 Plant died from dehydration!");
    updateUI();
    return;
  }
  
  // Growth calculation
  let growthAmount = 10;
  
  // Weather bonus
  growthAmount *= (1 + game.weather.bonus);
  
  // Upgrade bonuses
  if (game.upgrades.lights) growthAmount *= 1.2;
  if (game.upgrades.greenhouse) growthAmount *= 1.3;
  if (pot.fertilized) growthAmount *= 1.5;
  
  // Low hydration penalty
  if (pot.hydration < 30) {
    growthAmount *= 0.5;
    pot.sick = true;
  }
  
  pot.growth += growthAmount;
  
  // Check if ready to harvest
  if (pot.growth >= 100) {
    pot.state = "ready";
    showMessage(`🌿 ${pot.strain} plant is ready to harvest!`);
  }
  
  addXP(2);
  updateUI();
}

function giveLight(id) {
  const pot = game.pots[id];
  if (pot.state !== "growing" || !game.upgrades.lights) return;
  
  pot.growth += 5;
  pot.yield += 1;
  showMessage("💡 Gave extra light!");
  addXP(1);
  updateUI();
}

function fertilize(id) {
  const pot = game.pots[id];
  if (pot.state !== "growing" || pot.fertilized || game.fertilizerCount <= 0) return;
  
  pot.fertilized = true;
  pot.yield += 10;
  game.fertilizerCount--;
  showMessage("🧪 Plant fertilized!");
  addXP(3);
  updateUI();
}

function harvest(id) {
  const pot = game.pots[id];
  if (pot.state !== "ready") return;
  
  let harvestAmount = pot.yield;
  
  // Automation bonus
  if (game.upgrades.harvester) harvestAmount *= 1.1;
  if (game.upgrades.processor) harvestAmount *= 1.2;
  
  game.weed += harvestAmount;
  game.totalHarvested += harvestAmount;
  
  // Reset pot
  game.pots[id] = {
    id: id,
    growth: 0,
    state: "empty",
    yield: 0,
    hydration: 100,
    fertilized: false,
    strain: 'regular',
    sick: false
  };
  
  showMessage(`🌿 Harvested ${harvestAmount.toFixed(1)}g of ${pot.strain}!`);
  addXP(10);
  checkAchievements();
  updateUI();
}

function clearPot(id) {
  game.pots[id] = {
    id: id,
    growth: 0,
    state: "empty",
    yield: 0,
    hydration: 100,
    fertilized: false,
    strain: 'regular',
    sick: false
  };
  showMessage("🗑️ Cleared dead plant");
  updateUI();
}

// Shop functions
function buySeed() {
  if (game.money >= 5) {
    game.money -= 5;
    game.seeds++;
    showMessage("Bought 1 seed!");
    updateUI();
  } else {
    showMessage("Not enough money!");
  }
}

function buyBulkSeeds() {
  if (game.money >= 40) {
    game.money -= 40;
    game.seeds += 10;
    showMessage("Bought 10 seeds!");
    updateUI();
  } else {
    showMessage("Not enough money!");
  }
}

function buyFertilizer() {
  if (game.money >= 30) {
    game.money -= 30;
    game.fertilizerCount++;
    showMessage("Bought fertilizer!");
    updateUI();
  } else {
    showMessage("Not enough money!");
  }
}

function buyStrain(strain) {
  const prices = { indica: 25, sativa: 35, hybrid: 50 };
  const price = prices[strain];
  
  if (game.money >= price) {
    game.money -= price;
    game.strains[strain]++;
    showMessage(`Bought ${strain} seed!`);
    updateUI();
  } else {
    showMessage("Not enough money!");
  }
}

function buyUpgrade(upgrade) {
  const prices = {
    soil: 50,
    lights: 100,
    sprinkler: 150,
    greenhouse: 500,
    autopot: 200,
    harvester: 400,
    processor: 800
  };
  
  if (game.upgrades[upgrade]) {
    showMessage("Already owned!");
    return;
  }
  
  const price = prices[upgrade];
  if (game.money >= price) {
    game.money -= price;
    game.upgrades[upgrade] = true;
    showMessage(`Bought ${upgrade}!`);
    updateUI();
  } else {
    showMessage("Not enough money!");
  }
}

function sellWeed() {
  if (game.weed <= 0) {
    showMessage("No weed to sell!");
    return;
  }
  
  const basePrice = 10;
  let pricePerGram = basePrice + (game.level * 2);
  
  // Market fluctuation
  pricePerGram *= (0.8 + Math.random() * 0.4);
  
  const totalEarned = Math.floor(game.weed * pricePerGram);
  game.money += totalEarned;
  
  showMessage(`Sold ${game.weed.toFixed(1)}g for $${totalEarned}!`);
  game.weed = 0;
  
  addXP(5);
  checkAchievements();
  updateUI();
}

// UI Update function
function updateUI() {
  // Update stats
  const moneyEl = document.getElementById("money");
  const weedEl = document.getElementById("weed");
  const seedsEl = document.getElementById("seeds");
  const totalHarvestedEl = document.getElementById("total-harvested");
  const levelEl = document.getElementById("level");
  const xpEl = document.getElementById("xp");
  const xpNeededEl = document.getElementById("xp-needed");
  const xpFillEl = document.getElementById("xp-fill");
  const titleEl = document.getElementById("title");
  const weatherEl = document.getElementById("weather");
  const tempEl = document.getElementById("temp");
  const weatherBonusEl = document.getElementById("weather-bonus");

  if (moneyEl) moneyEl.textContent = game.money.toFixed(0);
  if (weedEl) weedEl.textContent = game.weed.toFixed(0);
  if (seedsEl) seedsEl.textContent = game.seeds;
  if (totalHarvestedEl) totalHarvestedEl.textContent = game.totalHarvested.toFixed(0);
  if (levelEl) levelEl.textContent = game.level;

  // Update XP and XP bar
  const xpNeeded = getXPNeeded(game.level);
  if (xpEl) xpEl.textContent = game.xp.toFixed(0);
  if (xpNeededEl) xpNeededEl.textContent = xpNeeded;
  const xpPercent = Math.min((game.xp / xpNeeded) * 100, 100);
  if (xpFillEl) xpFillEl.style.width = xpPercent + "%";

  // Update title
  const titles = ['Novice', 'Apprentice', 'Skilled', 'Expert', 'Master', 'Legendary'];
  if (titleEl) titleEl.textContent = titles[Math.min(game.level - 1, titles.length - 1)];

  // Update weather
  if (weatherEl) weatherEl.textContent = game.weather.desc;
  if (tempEl) tempEl.textContent = game.weather.temp + "°F";
  if (weatherBonusEl) weatherBonusEl.textContent = "+" + Math.round(game.weather.bonus * 100) + "%";

  // Update pots display
  if (potsDiv) {
    potsDiv.innerHTML = "";
    game.pots.forEach(pot => {
      const potDiv = document.createElement("div");
      potDiv.className = "pot";

      const plantDiv = document.createElement("div");
      plantDiv.className = "plant";
      if (pot.fertilized) plantDiv.classList.add("fertilized");
      if (pot.sick) plantDiv.classList.add("sick");
      plantDiv.style.height = Math.max(pot.growth * 1.5, 10) + "px";
      potDiv.appendChild(plantDiv);

      // Hydration bar
      const hydrationBar = document.createElement("div");
      hydrationBar.className = "hydration-bar";
      const hydrationFill = document.createElement("div");
      hydrationFill.className = "hydration-fill";
      hydrationFill.style.width = pot.hydration + "%";

      // Color code hydration
      if (pot.hydration > 60) hydrationFill.style.background = "linear-gradient(90deg, #33ff33, #22dd22)";
      else if (pot.hydration > 30) hydrationFill.style.background = "linear-gradient(90deg, #ffff33, #dddd22)";
      else hydrationFill.style.background = "linear-gradient(90deg, #ff3333, #dd2222)";

      hydrationBar.appendChild(hydrationFill);
      potDiv.appendChild(hydrationBar);

      const controls = document.createElement("div");
      controls.className = "controls";

      // Control buttons based on pot state
      if (pot.state === "empty") {
        // Plant buttons
        const regularBtn = document.createElement("button");
        regularBtn.textContent = "Plant Regular";
        regularBtn.disabled = game.seeds === 0;
        regularBtn.onclick = () => plant(pot.id, 'regular');
        controls.appendChild(regularBtn);

        if (game.strains.indica > 0) {
          const indicaBtn = document.createElement("button");
          indicaBtn.textContent = "Plant Indica";
          indicaBtn.onclick = () => plant(pot.id, 'indica');
          controls.appendChild(indicaBtn);
        }
        if (game.strains.sativa > 0) {
          const sativaBtn = document.createElement("button");
          sativaBtn.textContent = "Plant Sativa";
          sativaBtn.onclick = () => plant(pot.id, 'sativa');
          controls.appendChild(sativaBtn);
        }
        if (game.strains.hybrid > 0) {
          const hybridBtn = document.createElement("button");
          hybridBtn.textContent = "Plant Hybrid";
          hybridBtn.onclick = () => plant(pot.id, 'hybrid');
          controls.appendChild(hybridBtn);
        }
      } else if (pot.state === "growing") {
        const waterBtn = document.createElement("button");
        waterBtn.textContent = "💧 Water";
        waterBtn.onclick = () => waterPlant(pot.id);
        controls.appendChild(waterBtn);

        const growBtn = document.createElement("button");
        growBtn.textContent = "🌱 Grow";
        growBtn.onclick = () => growPlant(pot.id);
        controls.appendChild(growBtn);

        if (game.upgrades.lights) {
          const lightBtn = document.createElement("button");
          lightBtn.textContent = "💡 Light";
          lightBtn.onclick = () => giveLight(pot.id);
          controls.appendChild(lightBtn);
        }

        if (game.fertilizerCount > 0 && !pot.fertilized) {
          const fertBtn = document.createElement("button");
          fertBtn.textContent = "🧪 Fertilize";
          fertBtn.onclick = () => fertilize(pot.id);
          controls.appendChild(fertBtn);
        }

        const yieldText = document.createElement("div");
        yieldText.className = "yield";
        yieldText.textContent = `Yield: ${pot.yield}g`;
        controls.appendChild(yieldText);

        const strainInfo = document.createElement("div");
        strainInfo.className = "strain-info";
        strainInfo.textContent = pot.strain.charAt(0).toUpperCase() + pot.strain.slice(1);
        controls.appendChild(strainInfo);

        if (pot.hydration <= 20) {
          const warn = document.createElement("div");
          warn.style.color = "#ff4444";
          warn.textContent = "💀 Dehydrated!";
          controls.appendChild(warn);
        }
      } else if (pot.state === "ready") {
        const harvestBtn = document.createElement("button");
        harvestBtn.textContent = "🌿 Harvest";
        harvestBtn.onclick = () => harvest(pot.id);
        controls.appendChild(harvestBtn);

        const yieldText = document.createElement("div");
        yieldText.className = "yield";
        yieldText.textContent = `Yield: ${pot.yield}g`;
        controls.appendChild(yieldText);
      } else if (pot.state === "dead") {
        controls.innerHTML = "<div style='color: #ff4444;'>💀 Dead plant</div>";
        const clearBtn = document.createElement("button");
        clearBtn.textContent = "🗑️ Clear";
        clearBtn.onclick = () => clearPot(pot.id);
        controls.appendChild(clearBtn);
      }

      potDiv.appendChild(controls);
      potsDiv.appendChild(potDiv);
    });
  }

  // Update achievements list
  const achievementsDiv = document.getElementById("achievements-list");
  if (achievementsDiv) {
    achievementsDiv.innerHTML = "";
    achievements.forEach(achievement => {
      const achDiv = document.createElement("div");
      achDiv.className = "achievement" + (achievement.unlocked ? " unlocked" : "");
      achDiv.innerHTML = `<strong>${achievement.name}</strong><br>${achievement.desc}`;
      achievementsDiv.appendChild(achDiv);
    });
  }
}

// Game loop for automatic processes
function gameLoop() {
  // Auto-watering with sprinkler
  if (game.upgrades.sprinkler) {
    game.pots.forEach(pot => {
      if (pot.state === "growing" && pot.hydration < 80) {
        pot.hydration = Math.min(100, pot.hydration + 5);
      }
    });
  }
  
  // Auto-growing with autopot
  if (game.upgrades.autopot) {
    game.pots.forEach(pot => {
      if (pot.state === "growing" && Math.random() < 0.1) {
        growPlant(pot.id);
      }
    });
  }
  
  // Auto-harvesting
  if (game.upgrades.harvester) {
    game.pots.forEach(pot => {
      if (pot.state === "ready" && Math.random() < 0.05) {
        harvest(pot.id);
      }
    });
  }
  
  // Random weather changes
  if (Math.random() < 0.02) {
    updateWeather();
  }
  
  updateUI();
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  updateWeather();
  updateUI();
  
  // Start game loop
  setInterval(gameLoop, 1000);
});

// Make sure modal close function works
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});