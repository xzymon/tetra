const factorsBackground = document.getElementById('factorsBackground');
const actualFactors = document.getElementById('actualFactors');
const objectFactors = document.getElementById('objectFactors');

const tempOxyBackground = document.getElementById('tempOxyBackground');

const baseDimention = 900;
const scaleDenominator = 9;

const π = Math.PI;

const globalFactorsArea = new GlobalFactorsArea(baseDimention, scaleDenominator);
const globalFactorsState = new GlobalFactorsState();

globalFactorsState.getRehydration().setCurrentLevel(9);
globalFactorsState.getTemperature().setCurrentLevel(8);
globalFactorsState.getOxygen().setCurrentLevel(14);

initializeGlobalFactorsContainer();

document.addEventListener('DOMContentLoaded', loadFactorsBackground);
document.addEventListener('DOMContentLoaded', loadOceanIcon);
document.addEventListener('DOMContentLoaded', loadTemperatureIcon);
document.addEventListener('DOMContentLoaded', loadOxygenIcon);
document.addEventListener('DOMContentLoaded', loadHeatProductionIconBonus);
document.addEventListener('DOMContentLoaded', loadOceanIconBonus);

document.addEventListener('DOMContentLoaded', loadActualFactors);

document.addEventListener('DOMContentLoaded', loadObjectOceanIcon);
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
	this.oxygenArea = new PlotArea(this.width / 2, this.rehydrationIconsHeight, this.width / 2, this.tempOxyHeight);
	this.tempOxyArea = new PlotArea(0, this.rehydrationHeight, this.width, this.tempOxyIconsHeight);
	this.tempValueArea = new PlotArea(0, this.rehydrationHeight, this.width/4, this.tempOxyIconsHeight);
	this.tempIconArea = new PlotArea(this.width/4, this.rehydrationHeight, this.width/4, this.tempOxyIconsHeight);
	this.oxyIconArea = new PlotArea(this.width/2, this.rehydrationHeight, this.width/4, this.tempOxyIconsHeight);
	this.oxyValueArea = new PlotArea(this.width/4 * 3, this.rehydrationHeight, this.width/4, this.tempOxyIconsHeight);
	this.tempBonusArea = new PlotArea(this.temperatureArea.x, this.temperatureArea.y, this.temperatureArea.width / 2, this.temperatureArea.height);
	this.tempProgressBarArea = new PlotArea(this.temperatureArea.width / 2, this.temperatureArea.y, this.temperatureArea.width / 2, this.temperatureArea.height);
	this.oxyProgressBarArea = new PlotArea(this.oxygenArea.x, this.oxygenArea.y, this.oxygenArea.width / 2, this.oxygenArea.height);
	this.oxyBonusArea = new PlotArea(this.oxygenArea.x + this.oxygenArea.width / 2, this.oxygenArea.y, this.oxygenArea.width / 2, this.oxygenArea.height);
	this.temperatureNoOfSegments = 20;
	this.oxygenNoOfSegments = 15;
	this.tempProgressBarSegments = new Array(this.temperatureNoOfSegments);
	this.tempSegmentHeight = this.temperatureArea.height / this.temperatureNoOfSegments;
	for (let i = 0; i < this.temperatureNoOfSegments; i++) {
		this.tempProgressBarSegments[i] = new BottomTop(Math.ceil(this.temperatureArea.y + (this.tempSegmentHeight * i)), Math.floor(this.temperatureArea.y + (this.tempSegmentHeight * (i+1))));
	}
	this.oxyProgressBarSegments = new Array(this.oxygenNoOfSegments);
	this.oxySegmentHeight = this.oxygenArea.height / this.oxygenNoOfSegments;
	for (let j = 0; j < this.oxygenNoOfSegments; j++) {
		this.oxyProgressBarSegments[j] = new BottomTop(Math.ceil(this.oxygenArea.y + (this.oxySegmentHeight * j)), Math.floor(this.oxygenArea.y + (this.oxySegmentHeight * (j+1))));
	}
}

function PlotArea(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

function BottomTop(bottom, top) {
	this.bottom = bottom;
	this.top = top;
}

function initializeGlobalFactorsContainer() {
	setGFSize(globalFactorsArea, factorsBackground/*, actualFactors, objectFactors*/);
}

function setGFSize(globalFactorsArea, factorsBackground/*, actualFactors, objectFactors*/) {
	factorsBackground.height = globalFactorsArea.height;
	factorsBackground.width = globalFactorsArea.width;

	/*
	actualFactors.height = globalFactorsArea.height;
	actualFactors.width = globalFactorsArea.width;

	objectFactors.height = globalFactorsArea.height;
	objectFactors.width = globalFactorsArea.width;
	 */
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
	this.getCurrentLevelInSegments = function() {
		return ((this.current - this.min) / this.singleStep);
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
	this.getCurrentLevelInSegments = function() {
		return ((this.current - this.min) / this.singleStep);
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
	this.getCurrentLevelInSegments = function() {
		return ((this.current - this.min) / this.singleStep);
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

function drawFactorsBackground(canvasLayer, factorsArea) {
	//background image for global factors
	let ctx = canvasLayer.getContext('2d');

	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(factorsArea.rehydrationArea.x, factorsArea.rehydrationArea.y, factorsArea.rehydrationArea.width, factorsArea.rehydrationArea.height);
	ctx.fillRect(factorsArea.tempOxyArea.x, factorsArea.tempOxyArea.y, factorsArea.tempOxyArea.width, factorsArea.tempOxyArea.height);
	ctx.fillRect(factorsArea.tempBonusArea.x, factorsArea.tempBonusArea.y, factorsArea.tempBonusArea.width, factorsArea.tempBonusArea.height);
	ctx.fillRect(factorsArea.oxyBonusArea.x, factorsArea.oxyBonusArea.y, factorsArea.oxyBonusArea.width, factorsArea.oxyBonusArea.height);

	drawTempOxyBackgroundStack(canvasLayer, factorsArea);
}

/*
* funkcja rysujca na odrebnym canvas pionowe progress bary dla temperatury i tlenu
* - poniewaz rysowanie liniowego gradientu rozklada kolory na calym ctx a nie na wskazanej czesci,
* korzystam z odrebnego canvas by jego ctx wykorzystac do rozpiecia na nim calego gradientu - tak by uzyskac prawidlowy efekt
*/
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

		let tempBonusX = factorsArea.oxyBonusArea.x;
		let levelForBonus8 = 6;
		let levelForBonusY8 = factorsArea.oxyProgressBarSegments[levelForBonus8].bottom;
		let bdy8 = levelForBonusY8 - (factorsArea.oxySegmentHeight / 4) /*+ ((h - snh) / 2)*/;
		console.log(`loadTemperatureIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${tempBonusX} bdy=${bdy8}`);
		ctx.drawImage(imgObj, tempBonusX, bdy8, snw, snh);
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

		let levelForBonus24 = 16;
		let levelForBonusY24 = factorsArea.tempProgressBarSegments[levelForBonus24].bottom;
		//let bdy24 = levelForBonusY24 - (factorsArea.tempSegmentHeight / 4) + ((h - snh) / 2);
		let bdy24 = levelForBonusY24 - (factorsArea.tempSegmentHeight / 4) - ((h - snh) / 2);
		console.log(`loadHeatProductionIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy24}`);
		ctx.drawImage(imgObj, bdx, bdy24, snw, snh);

		let levelForBonus20 = 14;
		let levelForBonusY20 = factorsArea.tempProgressBarSegments[levelForBonus20].bottom;
		//let bdy20 = levelForBonusY20 - (factorsArea.tempSegmentHeight / 4) + ((h - snh) / 2);
		let bdy20 = levelForBonusY20 - (factorsArea.tempSegmentHeight / 4) - ((h - snh) / 2);
		ctx.drawImage(imgObj, bdx, bdy20, snw, snh);
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

		console.log(`tempSegmentHeight = ${factorsArea.tempProgressBarSegments[4].bottom}`);
		let levelForBonus = 4;
		let levelForBonusY = factorsArea.tempProgressBarSegments[levelForBonus].bottom;
		//let bdy = levelForBonusY - (factorsArea.tempSegmentHeight / 4) + ((h - snh) / 2);
		let bdy = levelForBonusY - (factorsArea.tempSegmentHeight / 4) - ((h - snh) / 2);

		console.log(`loadHeatProductionIcon: w=${w} h=${h} snw=${snw} snh=${snh} bdx=${bdx} bdy=${bdy}`);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);
	};

	imgObj.src = '../img/ocean.png';
}

//------actualFactors --------
function loadActualFactors(e) {
	drawRehydrationActualFactors(actualFactors, globalFactorsArea, globalFactorsState);
	drawActualTermalFactors(actualFactors, globalFactorsArea, globalFactorsState);
	drawActualOxygenFactors(actualFactors, globalFactorsArea, globalFactorsState);
}

function drawRehydrationActualFactors(canvasLayer, factorsArea, factorsState) {
	let ctx = canvasLayer.getContext('2d');
	const rehydrationState = factorsState.getRehydration();
	let factorSegmentIndex = rehydrationState.getCurrentLevelInSegments();
	let isMaxIndex = factorSegmentIndex == rehydrationState.max;
	let isMinIndex = factorSegmentIndex == rehydrationState.min;
	// display hack
	if (isMinIndex || isMaxIndex) {
		if (isMinIndex) factorSegmentIndex = rehydrationState.max;
		if (isMaxIndex) factorSegmentIndex = rehydrationState.min;
	}

	let rehydrationArea = factorsArea.rehydrationArea;
	let maxAxisSpace = rehydrationArea.height;

	let w = rehydrationArea.width;
	let h = rehydrationArea.height;

	let iconHeightToRehydrationHeight = 8 / 9;

	let snw = maxAxisSpace * iconHeightToRehydrationHeight;
	let snh = maxAxisSpace * iconHeightToRehydrationHeight;
	let bdx = (w - snw) / 2;
	let bdy = (h - snh) / 2;

	ctx.fillStyle = 'rgba(0,0,0, 0.7)';
	ctx.beginPath();
	let x1 = bdx + snw / 2;
	let y1 = bdy;
	let x2 = bdx + snw / 2;
	let y2 = bdy + snh / 2;
	let radius = snw / 2;
	let πx2 = 2 * π;
	let startAngle = - πx2 / 4;
	let endAngle = startAngle + (factorSegmentIndex / 9 * πx2);
	ctx.moveTo(x1, y1);
	ctx.arc(x2, y2, radius, startAngle, endAngle, true);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.fill();
}

function convertFactorLevelToAmountOfCoveredSegments(factorState) {
	let currentLevelInSegments = factorState.getCurrentLevelInSegments();
	let maxAvailableLevels = factorState.maxAvailableLevels();
	console.log(`currentLevelInSegments: ${currentLevelInSegments}, maxAvailableLevels: ${maxAvailableLevels}`);
	return maxAvailableLevels - currentLevelInSegments;
}

function drawActualTermalFactors(canvasLayer, factorsArea, factorsState) {
	let ctx = canvasLayer.getContext("2d");

	const termalBar = factorsArea.tempProgressBarArea;
	const termalBT = factorsArea.tempProgressBarSegments;
	const factorSegmentIndex = convertFactorLevelToAmountOfCoveredSegments(factorsState.getTemperature());

	ctx.fillStyle = 'rgba(0,0,0,0.7)';
	let x = termalBar.x;
	let y = termalBT[0].bottom;
	let w = termalBar.width;
	let h = termalBT[factorSegmentIndex].bottom - y;
	console.log(`x = ${x}, y = ${y}, w = ${w}, h = ${h}`);
	ctx.fillRect(x, y, w, h);
}

function drawActualOxygenFactors(canvasLayer, factorsArea, factorsState) {
	let ctx = canvasLayer.getContext("2d");

	const oxyBar = factorsArea.oxyProgressBarArea;
	const oxyBT = factorsArea.oxyProgressBarSegments;
	const factorSegmentIndex = convertFactorLevelToAmountOfCoveredSegments(factorsState.getOxygen());

	ctx.fillStyle = 'rgba(0,0,0,0.7)';
	let x = oxyBar.x;
	let y = oxyBT[0].bottom;
	let w = oxyBar.width;
	let h = oxyBT[factorSegmentIndex].bottom - y;
	console.log(`x = ${x}, y = ${y}, w = ${w}, h = ${h}`);
	ctx.fillRect(x, y, w, h);
}

//------objectFactors --------
function loadObjectOceanIcon(e) {
	let canvas = objectFactors;
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

	imgObj.src = '../img/emptyHexagon.png';
}

function loadObjectFactors(e) {
	drawObjectFactors(objectFactors, globalFactorsArea);
	drawTempOxyValues(objectFactors, globalFactorsArea, globalFactorsState);
	drawRehydrationValues(objectFactors, globalFactorsArea, globalFactorsState);
}

function drawObjectFactors(canvasLayer, factorsArea) {
	let ctx = canvasLayer.getContext('2d');

	ctx.strokeStyle = 'rgb(255,255,255)';

	ctx.beginPath();
	const termalSegm = factorsArea.temperatureNoOfSegments;
	const termalBar = factorsArea.tempProgressBarArea;
	const termalBT = factorsArea.tempProgressBarSegments;

	for (let i = 0; i < termalSegm; i++) {
		ctx.moveTo(termalBar.x, termalBT[i].bottom);
		ctx.lineTo(termalBar.x + termalBar.width, termalBT[i].bottom);
	}

	const oxidSegm = factorsArea.oxygenNoOfSegments;
	const oxidBar = factorsArea.oxyProgressBarArea;
	const oxidBT = factorsArea.oxyProgressBarSegments;

	for (let i = 0; i < oxidSegm; i++) {
		ctx.moveTo(oxidBar.x, oxidBT[i].bottom);
		ctx.lineTo(oxidBar.x + oxidBar.width, oxidBT[i].bottom);
	}

	ctx.stroke();
}

function drawTempOxyValues(canvasLayer, factorsArea, factorsState) {
	let ctx = canvasLayer.getContext('2d');

	const tempValueArea = factorsArea.tempValueArea;
	const oxyValueArea = factorsArea.oxyValueArea;

	const tempValue = factorsState.getTemperature().getCurrentLevel();
	const tempValueMax = factorsState.getTemperature().max;
	const oxyValue = factorsState.getOxygen().getCurrentLevel();
	const oxyValueMax = factorsState.getOxygen().max;

	ctx.font = '27px serif';
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgb(255,255,255)';

	const tempText = tempValue !== tempValueMax ? tempValue + '℃' : 'max';
	const oxyText = oxyValue !== oxyValueMax ? oxyValue + '%' : 'max';

	ctx.fillText(tempText, tempValueArea.x + tempValueArea.width / 2, tempValueArea.y + tempValueArea.height / 2);
	ctx.fillText(oxyText, oxyValueArea.x + oxyValueArea.width / 2, oxyValueArea.y + oxyValueArea.height / 2);
}

function drawRehydrationValues(canvasLayer, factorsArea, factorsState) {
	let ctx = canvasLayer.getContext('2d');
	const rehydrationState = factorsState.getRehydration();
	const rehydrationValue = rehydrationState.getCurrentLevelInSegments();
	const rehydrationValueMax = rehydrationState.max;
	const rehydrationText = rehydrationValue !== rehydrationValueMax ? rehydrationValue + '/' + rehydrationState.max : 'max';

	const rehydrationArea = factorsArea.rehydrationArea;

	let maxAxisSpace = rehydrationArea.height;

	let w = rehydrationArea.width;
	let h = rehydrationArea.height;

	let iconHeightToRehydrationHeight = 8 / 9;

	let snw = maxAxisSpace * iconHeightToRehydrationHeight;
	let snh = maxAxisSpace * iconHeightToRehydrationHeight;
	let bdx = (w - snw) / 2;
	let bdy = (h - snh) / 2;

	ctx.font = '60px serif';
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	//ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillStyle = 'rgb(255,255,0)';
	//ctx.strokeStyle = 'rgb(255,255,0)';

	ctx.fillText(rehydrationText, bdx + snw / 2, bdy + snh / 2);
	//ctx.strokeText(rehydrationText, bdx + snw / 2, bdy + snh / 2);
}