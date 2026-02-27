// source.js
window.addEventListener("load", (event) => {
    UIkit.modal(document.getElementById("landing-modal")).show();
});

/* Helper functions */

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

/* Definitions */

class Settings {
    settingsID;
    reproStrategy = "Asexual";
    biomass = 2;
    energy = 50;
    growthRate = 10;
    diversity = 50;
    selection = "r";
    semelparity = false;
    fertilization = "Internal";
    constructor(settingsID) {
        this.settingsID = settingsID;
    };
    changeEnergyUI(value) {
        const energyElement = document.getElementById(this.settingsID + "-energy");
        if (energyElement) {
            console.log("Changing energy UI of settings " + this.settingsID + " to " + value);
            energyElement.value = value;
        }
    };
    changeEnergyMag(amount) {
        console.log("Changing energy of settings " + this.settingsID + " by " + amount);
        if (this.energy + amount < 0) {
            this.energy = 0;
            this.changeEnergyUI(0);
        } else if (this.energy + amount > 100) {
            this.energy = 100;
            this.changeEnergyUI(100);
        } else {
            this.energy += amount;
            this.changeEnergyUI(this.energy);
        }
    };
    changeEnergyScale(amount) {
        console.log("Changing energy of settings " + this.settingsID + " by a factor of " + amount);
        if (this.energy * amount > 100) {
            this.energy = 100;
            this.changeEnergyUI(100);
        } else {
            this.energy *= amount;
            this.changeEnergyUI(this.energy);
        }    
    }
    changeDiversityUI(value) {
        const diversityElement = document.getElementById(this.settingsID + "-diversity");
        if (diversityElement) {
            diversityElement.value = value;
        }
    };
    changeDiversity(amount) {
        if (this.diversity + amount < 0) {
            this.diversity = 0;
            this.changeDiversityUI(0);
        } else if (this.diversity + amount > 100) {
            this.diversity = 100;
            this.changeDiversityUI(100);
        } else {
            this.diversity += amount;
            this.changeDiversityUI(this.diversity);
        }    
    }
    changeSemelparity(value) {
        if (value === "Semelparous") {
            this.semelparity = true;
        } else {
            this.semelparity = false;
        }
    }
}

class Strain extends Settings {
    strainID;
    constructor(settingsLocal) {
        this.strainID = Math.random().toString(36).substring(2);
    }
}

class Greeble {
    x;
    y;
    greebleID;
    sex;
    adult = false;
    selection;
    strain;
    cooldown = false;
    semelparity = false;
    fertilization;
    determineSex(settingsLocal) {
        if (settingsLocal.reproStrategy === "Sexual") {
            return Math.random() < 0.5 ? "m" : "f";
        } else {
            return "a";
        }
    };
    grow(localSettings) {
        if (!this.adult) {
            let growthChance = localSettings.diversity / 100;

            if (this.selection === "r") {
                if (Math.random() < 0.005) {
                    if (Math.random() < growthChance) {
                        this.adult = true;
                        const newGreebleImg = new Image();
                        newGreebleImg.onload = function () {
                            getSprite(this).image(newGreebleImg);
                            greebleLayer.draw();
                        }.bind(this);
                        newGreebleImg.src = "assets/greeble-small.png";
                        console.log("Greeble " + this.greebleID + " has aged into an adult.");
                    } else {
                        this.die();
                        console.log("Greeble " + this.greebleID + " died of a lethal mutation.");
                    }
                } else {
                    this.die();
                    console.log("Greeble " + this.greebleID + " died due to lack of care.");
                }
            } else if (this.selection === "K") {
                if (Math.random() < growthChance) {
                    this.adult = true;
                    const newGreebleImg = new Image();
                    newGreebleImg.onload = function () {
                        getSprite(this).image(newGreebleImg);
                        greebleLayer.draw();
                    }.bind(this);
                    newGreebleImg.src = "assets/greeble-small.png";
                    console.log("Greeble " + this.greebleID + " has aged into an adult.");
                } else {
                    this.die();
                    console.log("Greeble " + this.greebleID + " died of a lethal mutation.");
                }
            }
        }
    };
    walk() {
        let xBias = 0;
        let yBias = 0;
        let xChange = 0;
        let yChange = 0;
        let closestGreeble = null;
        
        if (this.sex !== "a" && this.cooldown === false && this.adult && this.fertilization === "Internal") {
            closestGreeble = greebles.reduce((closest, g) => {
                if (g.greebleID !== this.greebleID && g.sex !== "a" && g.adult && g.cooldown === false) {
                    const distance = Math.sqrt((g.x - this.x) ** 2 + (g.y - this.y) ** 2);  
                    if (!closest || distance < closest.distance) {
                        closest = { greeble: g, distance: distance };
                    }
                }
                return closest;
            }, null);
        }
        
        if (closestGreeble) {
            xBias = closestGreeble.greeble.x - this.x;
            yBias = closestGreeble.greeble.y - this.y;
            xChange = Math.sign(xBias) * 1 + getRandomIntInclusive(-10, 10);
            yChange = Math.sign(yBias) * 1 + getRandomIntInclusive(-10, 10);
        } else {
            xChange = getRandomIntInclusive(-10, 10);
            yChange = getRandomIntInclusive(-10, 10);
        }

        if (this.x + xChange < 0 || this.x + xChange > 400) {
            this.x += 0;
        } else {
            this.x += xChange;
        }

        if (this.y + yChange < 0 || this.y + yChange > 400) {
            this.y += 0;
        } else {
            this.y += yChange;
        }

        this.draw(this.x, this.y, this.greebleID);
    };
    draw(x, y, id) {
        if (greebleLayer.findOne("#" + id)) {
            const greebleSprite = greebleLayer.findOne("#" + id);
            greebleSprite.x(x);
            greebleSprite.y(y);
        } else {
            const greebleImg = new Image();
            greebleImg.onload = function () {
                let greebleSprite = new Konva.Image({
                    name: "greeble",
                    x: x,
                    y: y,
                    image: greebleImg,
                    width: 16,
                    height: 16,
                    draggable: true
                });
                greebleSprite.id(id);
                greebleSprite.on("dragend", function () {
                    console.log("Dropped " + id);
                    const greeble = greebles.find(g => g.greebleID === id);
                    if (greeble) {
                        greeble.x = greebleSprite.x();
                        greeble.y = greebleSprite.y();
                    }
                });
                greebleLayer.add(greebleSprite);
            }
            if (this.adult) {
                greebleImg.src = "assets/greeble-small.png";
            } else {
                greebleImg.src = "assets/greeble-young-small.png";
            }
            
        }
    };
    die() {
        getSprite(this).destroy();
        greebles = greebles.filter(g => g.greebleID !== this.greebleID);
        console.log("Greeble " + this.greebleID + " has died.");
    };
    produce(n, settingsLocal) {
        if (this.semelparity) {
            for (let i = 0; i < n + 1 * getRandomIntInclusive(1, 10); i++) {
                greebles.push(new Greeble(this.x, this.y, settingsLocal));
            }
            this.die();
        } else {
            for (let i = 0; i < n; i++) {
                greebles.push(new Greeble(this.x, this.y, settingsLocal));
            }
        }
    };
    internalFertilization(localSettings) {
        if (this.cooldown === false) {
            if (this.selection === "r") {
                this.produce(getRandomIntInclusive(10, 50), localSettings);
            } else if (this.selection === "K") {
                this.produce(getRandomIntInclusive(0, 2), localSettings);
            }

            
        }
    };
    externalFertilization(localSettings) {
        if (this.cooldown === false && Math.random() < 0.1) {
            if (this.selection === "r") {
                this.produce(getRandomIntInclusive(10, 50), localSettings);
            } else if (this.selection === "K") {
                this.produce(getRandomIntInclusive(0, 2), localSettings);
            }

            if (this.sex === "f") {
                this.cooldown = true; 
            }
        }
    };
    fission(localSettings) {
        if (this.cooldown === false) {
            if (this.selection === "r") {
                this.produce(getRandomIntInclusive(10, 50), localSettings);
            } else if (this.selection === "K") {
                this.produce(getRandomIntInclusive(0, 2), localSettings);
            }
        }
    };
    constructor(x, y, settingsLocal) {
        this.greebleID = Math.random().toString(36).substring(2);
        this.x = x;
        this.y = y;
        this.sex = this.determineSex(settingsLocal);
        this.selection = settingsLocal.selection;
        this.semelparity = settingsLocal.semelparity;
        this.fertilization = settingsLocal.fertilization;
    }
}

/* Global variables */

var settings = new Settings("a");
var greebles = [];

/* Greeble settings UI interaction functions */

function changeStrainName (strain, newName) {
    const nameElement = document.getElementById(strain + "-name");
    if (nameElement) {
        nameElement.textContent = newName;
    }
}

function changeReproStrategy (strain, strategy) {
    if (strain === "a" && strategy === "Sexual") {
        settings.reproStrategy = strategy;
        // settings.changeEnergyMag(-25);
        settings.changeDiversity(25);
    } else if (strain === "a" && strategy === "Asexual") {
        settings.reproStrategy = strategy;
        // settings.changeEnergyMag(25);
        settings.changeDiversity(-25);
    }
}

function changeSelection (strain, selection) {
    if (strain === "a" && selection === "r") {
        settings.selection = selection;
        // settings.changeEnergyMag(-10);
        settings.changeDiversity(10);
    } else if (strain === "a" && selection === "K") {
        settings.selection = selection;
        // settings.changeEnergyMag(10);
        settings.changeDiversity(-10);
    }
}

function setPopulation() {
    const currentPopulation = greebles.length;
    const populationElement = document.getElementById("population");
    if (populationElement) {
        populationElement.textContent = currentPopulation;
    }
}

function changeSemelparityUI(value) {
    settings.changeSemelparity(value);
}

function changeFertilizationUI(value) {
    settings.fertilization = value;
}

/* Graphs */

var popAdultTrace = {
    x: [0],
    y: [2],
    mode: "lines",
    name: "Adults"
}

var popYoungTrace = {
    x: [0],
    y: [0],
    mode: "lines",
    name: "Immature"
}

var popLayout = {
    title: {
        text: "Population Over Time",
    },
    xaxis: { 
        title: { text: "Time (ticks)" }
    },
    yaxis: { 
        title: { text: "Population" } 
    }
}

var popData = [popAdultTrace, popYoungTrace];

Plotly.newPlot("population-graph", popData, popLayout);

function updatePopulationGraph() {
    popAdultTrace.x.push(tickCount);
    popAdultTrace.y.push(greebles.filter(g => g.adult).length);
    popYoungTrace.x.push(tickCount);
    popYoungTrace.y.push(greebles.filter(g => !g.adult).length);
    if (popYoungTrace.x.length > 500) {
        popAdultTrace.x.shift();
        popAdultTrace.y.shift();
        popYoungTrace.x.shift();
        popYoungTrace.y.shift();
    }
    Plotly.redraw("population-graph", popData, popLayout);
}

/* Simulation controls */

var initBool = false;
var runBool = false;
var tickCount = 0;

function startUI(button) {
    if (initBool === false) {
        init();
        const stopButton = document.getElementById("button-stop");
        stopButton.disabled = false;
    } else if (runBool === false) {
        startSim();
        const stopButton = document.getElementById("button-stop");
        stopButton.disabled = false;
    }
    button.disabled = true;
}

function stopUI() {
    stopSim();
    const startButton = document.getElementById("button-start");
    startButton.disabled = false;
    const stopButton = document.getElementById("button-stop");
    stopButton.disabled = true;
}

function resetUI() {
    stopSim();
    greebles.forEach(g => getSprite(g).destroy());
    greebles = [];
    settings = new Settings("a");
    tickCount = 0;
    popAdultTrace.x = [0];
    popAdultTrace.y = [2];
    popYoungTrace.x = [0];
    popYoungTrace.y = [0];
    Plotly.redraw("population-graph", popData, popLayout);
    changeReproStrategy("a", document.getElementById("a-repro-strategy").value);
    changeSelection("a", document.getElementById("a-selection").value);
    changeSemelparityUI(document.getElementById("death-follows").value);
    changeFertilizationUI(document.getElementById("fertilization").value);
    const startButton = document.getElementById("button-start");
    startButton.disabled = false;
    const stopButton = document.getElementById("button-stop");
    stopButton.disabled = true;
    initBool = false;
}

/* Simulation logic */

var intervalID;

function init() {
    greebles.push(new Greeble(250, 250, settings));
    greebles.push(new Greeble(300, 300, settings));
    if (settings.reproStrategy === "Sexual") {
        greebles[0].sex = "m";
        greebles[1].sex = "f";
    }
    greebles[0].adult = true;
    greebles[1].adult = true;
    greebles.forEach(greeble => {
        greeble.draw(greeble.x, greeble.y, greeble.greebleID);
    });
    startSim();
    initBool = true;
}

function tick() {
    greebles.forEach(greeble => {
        greeble.walk();
        if (greeble.cooldown === true) {
            if (Math.random() < 0.01) {
                greeble.cooldown = false;
                console.log("Greeble " + greeble.greebleID + " is no longer on cooldown.");
            }
        }
        if (greebles.find(g => g.x > greeble.x - 8 && g.x < greeble.x + 8 
            && g.y > greeble.y - 8 && g.y < greeble.y + 8 
            && g.greebleID !== greeble.greebleID
            && g.sex == "m" && greeble.sex == "f" 
            && greeble.adult && g.adult
            && g.fertilization === "Internal" && greeble.fertilization === "Internal")) {
            greeble.internalFertilization(settings);
        }
        if (greebles.find(g => g.x > greeble.x - 50 && g.x < greeble.x + 50 
            && g.y > greeble.y - 50 && g.y < greeble.y + 50 
            && g.greebleID !== greeble.greebleID
            && g.sex == "m" && greeble.sex == "f" 
            && greeble.adult && g.adult
            && g.fertilization === "External" && greeble.fertilization === "External")) {
            greeble.externalFertilization(settings);
        }
        if (greeble.sex === "a" && greeble.adult) {
            if (Math.random() < 0.01) {
                greeble.fission(settings);
            }
        }
        if (greeble.adult == false) {
            if (Math.random() < 0.01) {
                greeble.grow(settings);
            }
        }
        if (greeble.adult && Math.random() < 0.001) {
            greeble.die();
        }
        if (greebles.length > 500 && Math.random() < 0.5) {
            greeble.die();
        }
    });
    setPopulation();
    tickCount++;
    updatePopulationGraph()
}

function startSim() {
    intervalID = setInterval(tick, 100);
    runBool = true;
}

function stopSim() {
    clearInterval(intervalID);
    runBool = false;
}

/* Konva code */

function getSprite(greeble) {
    return greebleLayer.findOne("#" + greeble.greebleID);
}

const stage = new Konva.Stage({
  container: "simulation-container",
  width: 400,
  height: 400
});

const bgLayer = new Konva.Layer();
const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: "lightgray"
});

bgLayer.add(bgRect);
stage.add(bgLayer);
bgLayer.moveToBottom();

const greebleLayer = new Konva.Layer();
stage.add(greebleLayer);
greebleLayer.moveToTop();

/*
const testGreeble = new Image();
testGreeble.onload = function () {
    const greeble = new Konva.Image({
        x: 250,
        y: 250,
        image: testGreeble,
        width: 16,
        height: 16
    });
    greebleLayer.add(greeble);
}
testGreeble.src = "assets/greeble-small.png";
*/