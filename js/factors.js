const factorsBackground = document.getElementById('factorsBackground');
const actualFactors = document.getElementById('actualFactors');
const objectFactors = document.getElementById('objectFactors');

const tempOxyBackground = document.getElementById('tempOxyBackground');

const baseDimention = 900;
const scaleDenominator = 9;


const globalFactorsArea = new GlobalFactorsArea(baseDimention, scaleDenominator);

initializeGlobalFactorsContainer();

document.addEventListener('DOMContentLoaded', loadOceanIcon);
document.addEventListener('DOMContentLoaded', loadTemperatureIcon);
document.addEventListener('DOMContentLoaded', loadOxygenIcon);
document.addEventListener('DOMContentLoaded', loadHeatProductionIconBonus);
document.addEventListener('DOMContentLoaded', loadOceanIconBonus);
document.addEventListener('DOMContentLoaded', loadFactorsBackground);
document.addEventListener('DOMContentLoaded', loadObjectFactors);



function GlobalFactorsArea(baseDimention, scaleDenominator) {
	this.baseDimention = baseDimention;
	this.scaleDenominator = scaleDenominator; // 3-9 - mnoznik - sluzy do skalowania calosci
	this.scaleNumerator = 9;
	this.heightToWidthFactor = 3;
	this.heightToRehydrationFactor = 3;
	this.scale = this.scaleDenominator / this.scaleNumerator;
	this.height = this.baseDimention * this.scale;
	this.width = this.baseDimention * this.scale / this.heightToWidthFactor;  //szerokosc calego wyswietlacza factors
	this.rehydrationIconsHeight = this.height / this.heightToRehydrationFactor;  //wysokosc obszaru przeznaczonego na nawodnienie + ikonki temperatury i tlenu
	this.tempOxyIconsHeight = this.width / 4; // wysokosc obszaru przeznaczonego na ikonki temperatury i tlenu
	this.tempOxyHeight = this.height - this.rehydrationIconsHeight; //wysokosc obszaru przeznaczonego na wskazniki temperatury i tlenu
	this.rehydrationHeight = this.rehydrationIconsHeight - this.tempOxyIconsHeight; //wysokosc obszaru przeznaczonego na samo nawodnienie
	this.rehydrationArea = new PlotArea(0, 0, this.width, this.rehydrationHeight);
	this.temperatureArea = new PlotArea(0, this.rehydrationIconsHeight, this.width / 2, this.tempOxyHeight);
	this.temperatureNoOfSegments = 20;
	this.oxygenArea = new PlotArea(this.width / 2, this.rehydrationIconsHeight, this.width / 2, this.tempOxyHeight);
	this.oxygenNoOfSegments = 15;
}

function PlotArea(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

function initializeGlobalFactorsContainer() {
	setGFSize(globalFactorsArea, factorsBackground, actualFactors, objectFactors);
}

function setGFSize(globalFactorsArea, factorsBackground, actualFactors, objectFactors) {
	factorsBackground.height = globalFactorsArea.height;
	factorsBackground.width = globalFactorsArea.width;

	actualFactors.height = globalFactorsArea.height;
	actualFactors.width = globalFactorsArea.width;

	objectFactors.height = globalFactorsArea.height;
	objectFactors.width = globalFactorsArea.width;
}

function GlobalFactorsState() {
	this.temperature = new TemperatureState();
	this.oxygen = new OxygenState();
	this.rehydration = new RehydrationState();
	this.getTemperature = function () {
		return this.temperature;
	}
	this.getOxygen = function () {
		return this.oxygen;
	}
	this.getRehydration = function () {
		return this.rehydration;
	}
}

// TemperatureState, OxygenState && RehydrationState have identical logic
function TemperatureState() {
	this.min = -30;
	this.max = 8;
	this.current = this.min;
	this.singleStep = 2;
	this.maxAvailableLevels = function() {
		return ((this.max - this.min) / this.singleStep);
	}
	this.getCurrentLevel = function () {
		return this.current;
	}
	this.setCurrentLevel = function (level) {
		if (level >= this.min && level <= this.max) {
			this.current = level;
		}
	}
	this.advanceOneLevel = function(noOfTimes) {
		if (this.canAdvanceOneLevel()) {
			this.performAdvanceOneLevel();
		}
	}
	this.canAdvanceOneLevel = function() {
		if ((this.max - this.current) / this.singleStep > 0) {
			return true;
		}
		return false;
	}
	this.performAdvanceOneLevel = function() {
		this.current += this.singleStep;
	}
}

function OxygenState() {
	this.min = 0;
	this.max = 14;
	this.current = this.min;
	this.singleStep = 1;
	this.maxAvailableLevels = function() {
		return ((this.max - this.min) / this.singleStep);
	}
	this.getCurrentLevel = function () {
		return this.current;
	}
	this.setCurrentLevel = function (level) {
		if (level >= this.min && level <= this.max) {
			this.current = level;
		}
	}
	this.advanceOneLevel = function(noOfTimes) {
		if (this.canAdvanceOneLevel()) {
			this.performAdvanceOneLevel();
		}
	}
	this.canAdvanceOneLevel = function() {
		if ((this.max - this.current) / this.singleStep > 0) {
			return true;
		}
		return false;
	}
	this.performAdvanceOneLevel = function() {
		this.current += this.singleStep;
	}
}

function RehydrationState() {
	this.min = 0;
	this.max = 9;
	this.current = this.min;
	this.singleStep = 1;
	this.maxAvailableLevels = function() {
		return ((this.max - this.min) / this.singleStep);
	}
	this.getCurrentLevel = function () {
		return this.current;
	}
	this.setCurrentLevel = function (level) {
		if (level >= this.min && level <= this.max) {
			this.current = level;
		}
	}
	this.advanceOneLevel = function(noOfTimes) {
		if (this.canAdvanceOneLevel()) {
			this.performAdvanceOneLevel();
		}
	}
	this.canAdvanceOneLevel = function() {
		if ((this.max - this.current) / this.singleStep > 0) {
			return true;
		}
		return false;
	}
	this.performAdvanceOneLevel = function() {
		this.current += this.singleStep;
	}
}

function loadFactorsBackground(e) {
	drawFactorsBackground(factorsBackground, globalFactorsArea);
}

function loadObjectFactors(e) {
	drawObjectFactors(objectFactors, globalFactorsArea);
}

function drawObjectFactors(canvasLayer, factorsArea) {
	let ctx = canvasLayer.getContext('2d');

	const temperatureNoOfSegments = factorsArea.temperatureNoOfSegments;
	const temperatureSegmentHeight = factorsArea.temperatureArea.height / temperatureNoOfSegments;
	for (let i = 0; i < temperatureNoOfSegments; i++) {
		let tempX = factorsArea.temperatureArea.width / 2;
		let tempY = factorsArea.temperatureArea.y + (temperatureSegmentHeight * i);
		let tempW = factorsArea.temperatureArea.width / 2;
		let tempH = factorsArea.temperatureArea.y + (temperatureSegmentHeight * (i + 1));
		ctx.strokeRect(tempX, tempY, tempW, tempH);
		if (i == 14) {
			console.log(`TEMP20: ${tempX} ${tempY} ${tempW} ${tempH}`);
		}
		if (i == 16) {
			console.log(`TEMP24: ${tempX} ${tempY} ${tempW} ${tempH}`);
		}
	}

	const oxygenNoOfSegments = factorsArea.oxygenNoOfSegments;
	const oxygenSegmentHeight = factorsArea.oxygenArea.height / oxygenNoOfSegments;
	for (let j = 0; j < oxygenNoOfSegments; j++) {
		let oxyX = factorsArea.oxygenArea.x;
		let oxyY = factorsArea.oxygenArea.y + (oxygenSegmentHeight * j);
		let oxyW = factorsArea.oxygenArea.width / 2;
		let oxyH = factorsArea.oxygenArea.y + (oxygenSegmentHeight * (j + 1));
		ctx.strokeRect(oxyX, oxyY, oxyW, oxyH);
		if (j == 6) {
			console.log(`OXY: ${oxyX} ${oxyY} ${oxyW} ${oxyH}`);
		}
	}
}

function drawFactorsBackground(canvasLayer, factorsArea) {
	//background image for global factors
	let ctx = canvasLayer.getContext('2d');

	ctx.fillStyle = 'rgba(0,0,255,0.3)';
	ctx.fillRect(factorsArea.rehydrationArea.x, factorsArea.rehydrationArea.y, factorsArea.rehydrationArea.width, factorsArea.rehydrationArea.height);

	ctx.fillStyle = 'rgba(0,255,0,0.3)';
	ctx.fillRect(factorsArea.temperatureArea.x, factorsArea.temperatureArea.y, factorsArea.temperatureArea.width, factorsArea.temperatureArea.height);

	ctx.strokeStyle = 'rgba(0,255,0,1)';
	// draw gradiented thermometer
	const thermoStackX = factorsArea.temperatureArea.width / 2;
	const thermoStackY = factorsArea.temperatureArea.y;
	const thermoStackW = factorsArea.temperatureArea.width / 2;
	const thermoStackH = factorsArea.temperatureArea.height;
	console.log(`thermoStackH = ${thermoStackH}`);
	drawTempOxyBackgroundStack(canvasLayer, factorsArea);

	ctx.fillStyle = 'rgba(255,0,0,0.3)';
	ctx.fillRect(factorsArea.oxygenArea.x, factorsArea.oxygenArea.y, factorsArea.oxygenArea.width, factorsArea.oxygenArea.height);
}

function drawTempOxyBackgroundStack(canvasLayer, factorsArea) {
	const segThermo = factorsArea.temperatureNoOfSegments;
	const segOxy = factorsArea.oxygenNoOfSegments;
	let backCanvas = tempOxyBackground;
	let tempArea = factorsArea.temperatureArea;
	let oxyArea = factorsArea.oxygenArea;
	backCanvas.width = factorsArea.width;
	backCanvas.height = factorsArea.tempOxyHeight;

	let backCanvasCtx = backCanvas.getContext('2d');

	//thermo stack
	let thermoStackGrad = backCanvasCtx.createLinearGradient(tempArea.width / 2, 0, tempArea.width / 2, backCanvas.height);

	thermoStackGrad.addColorStop(0, '#ff0000');
	thermoStackGrad.addColorStop(1 / segThermo, '#ff0000');
	thermoStackGrad.addColorStop(5 / segThermo, '#9900cc');
	thermoStackGrad.addColorStop(9 / segThermo, '#3333cc');
	thermoStackGrad.addColorStop(13 / segThermo, '#33ccff');
	thermoStackGrad.addColorStop(20 / segThermo, '#33ccff');

	backCanvasCtx.fillStyle = thermoStackGrad;
	backCanvasCtx.fillRect(tempArea.width / 2, 0, tempArea.width / 2, backCanvas.height);

	//oxy stack
	let oxyStackGrad = backCanvasCtx.createLinearGradient(oxyArea.x, 0, oxyArea.width / 2, backCanvas.height);

	oxyStackGrad.addColorStop(0, '#afd2e2');
	oxyStackGrad.addColorStop(4 / segOxy, '#8a7d83');
	oxyStackGrad.addColorStop(7 / segOxy, '#b48f51');
	oxyStackGrad.addColorStop(14 / segOxy, '#000');
	oxyStackGrad.addColorStop(15 / segOxy, '#000');

	backCanvasCtx.fillStyle = oxyStackGrad;
	backCanvasCtx.fillRect(oxyArea.x, 0, oxyArea.width / 2, backCanvas.height);

	canvasLayer.getContext('2d').drawImage(backCanvas, 0, Math.round(factorsArea.rehydrationIconsHeight));
}

function loadOceanIcon(e) {
	let canvas = factorsBackground;
	let ctx = canvas.getContext('2d');
	let imgObj = new Image();

	imgObj.onload = function () {
		let rehydrationArea = globalFactorsArea.rehydrationArea;
		let maxAxisSpace = rehydrationArea.height;

		let w = rehydrationArea.width;
		let h = rehydrationArea.height;

		let iconHeightToRehydrationHeight = 8 / 9;

		let snw = maxAxisSpace * iconHeightToRehydrationHeight;
		let snh = maxAxisSpace * iconHeightToRehydrationHeight;
		let bdx = (w - snw) / 2;
		let bdy = (h - snh) / 2;

		console.log(`loadOceanIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy}`);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);
	};

	imgObj.src = '../img/ocean.png';
}

function loadTemperatureIcon(e) {
	let canvas = factorsBackground;
	let ctx = canvas.getContext('2d');
	let imgObj = new Image();

	imgObj.onload = function () {
		let factorsArea = globalFactorsArea;
		let maxAxisSpace = factorsArea.tempOxyIconsHeight;

		let w = factorsArea.width;
		let h = factorsArea.tempOxyIconsHeight;

		let snw = maxAxisSpace;
		let snh = maxAxisSpace;
		let bdx = w / 4 * 1;
		let bdy = factorsArea.rehydrationHeight;

		console.log(`loadTemperatureIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy}`);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);

		let tempBonusX = 225;
		let tempBonusY = 540 - (75 / 4);
		ctx.drawImage(imgObj, tempBonusX, tempBonusY, snw, snh);
	};

	imgObj.src = '../img/temperature.png';
}

function loadOxygenIcon(e) {
	let canvas = factorsBackground;
	let ctx = canvas.getContext('2d');
	let imgObj = new Image();

	imgObj.onload = function () {
		let factorsArea = globalFactorsArea;
		let maxAxisSpace = factorsArea.tempOxyIconsHeight;

		let w = factorsArea.width;
		let h = factorsArea.tempOxyIconsHeight;

		let snw = maxAxisSpace;
		let snh = maxAxisSpace;
		let bdx = w / 4 * 2;
		let bdy = factorsArea.rehydrationHeight;

		console.log(`loadOxygenIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy}`);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);
	};

	imgObj.src = '../img/oxygen.png';
}

function loadHeatProductionIconBonus(e) {
	let canvas = factorsBackground;
	let ctx = canvas.getContext('2d');
	let imgObj = new Image();

	imgObj.onload = function () {
		let factorsArea = globalFactorsArea;
		let maxAxisSpace = factorsArea.tempOxyIconsHeight;

		let w = factorsArea.width;
		let h = factorsArea.tempOxyIconsHeight;

		let scaleUnitToProduction = 4 / 5;

		let snw = maxAxisSpace * scaleUnitToProduction;
		let snh = maxAxisSpace * scaleUnitToProduction;

		let bdx = (w / 4 - snw) / 2;
		let bdy = 780 - (75 / 4) + ((h - snh) / 2);

		console.log(`loadHeatProductionIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy}`);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);

		bdy = 720 - (75 / 4) + ((h - snh) / 2);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);
	};

	imgObj.src = '../img/heatProduction.png';
}



function loadOceanIconBonus(e) {
	let canvas = factorsBackground;
	let ctx = canvas.getContext('2d');
	let imgObj = new Image();

	imgObj.onload = function () {
		let factorsArea = globalFactorsArea;
		let maxAxisSpace = factorsArea.tempOxyIconsHeight;

		let w = factorsArea.width;
		let h = factorsArea.tempOxyIconsHeight;

		let scaleUnitToProduction = 4 / 5;

		let snw = maxAxisSpace * scaleUnitToProduction;
		let snh = maxAxisSpace * scaleUnitToProduction;

		let bdx = (w / 4 - snw) / 2;
		let bdy = 780 - (75 / 4) + ((h - snh) / 2);

		console.log(`loadHeatProductionIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy}`);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);

		bdy = 420 - (75 / 4) + ((h - snh) / 2);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);
	};

	imgObj.src = '../img/ocean.png';
}