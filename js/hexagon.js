// wymiary planszy - przestrzeni na ktorej jest rysowanie
// globalHeight, globalWidth
const multiplier = 7; // 3-9 - mnoznik - sluzy do skalowania calosci
const scale = multiplier / 9;
const gH = 900 * scale;
//const gMargin = 0;
const gMargin = gH / 18;
const gW = gH + 4 * gMargin;

// wymiary marsa
const mCX = gW / 2;
const mCY = gH / 2;
const mR = mCY - gMargin;

// wymiary kafelka hex
const hR = mR / 8;

// przestrzen na ktorej jest rysowanie = globalElem
let gElem = document.getElementById('rysownik');
let heading = document.querySelector('h5');

const gHRound = Math.round(gH);
const gWRound = Math.round(gW);

const gameHexPrescence = new GameHexPrescence(gWRound, gHRound);


// klasy - na potrzeby CSS
const cPlansza = 'plansza';
const cMars = 'mars';
const cMarsHex = 'marsHex';
const cKragHex = 'kragHex';
const cHex = 'hex';

// polozenie linii hexagonow - liczone dla horyzontalnego hexagona!
const marsHexXPoints = xValuesForCXR(mCX, mR);
const marsHexYPoints = yValuesForCYR(mCY, mR);

drawRect(gElem, 'idPlansza', cPlansza, 0, 0, gW, gH);
drawCircle(gElem, 'idMars', cMars, mCX, mCY, mR * (1+1/24) );
//drawHexagonHoriz(gElem, 'idMarsHex', cMarsHex, mCX, mCY, mR);

// wyznaczanie polozenia srodkow hex'ow
const marsHexes = new Array();
generateMarsHexesCoordinates(marsHexes, xLeftMidleftMidrightRight(mCX, mR), yTopMidBottom(mCY, mR));
console.log(marsHexes);
const allHexes = generateMarsHexTilesCoordinates(marsHexes, 'tm', hR);
console.log(allHexes);

//let firstHex = allHexes[0];
//gameHexPrescence.setHexPrescence(0, firstHex.cx, firstHex.cy, firstHex.r);

gameHexPrescence.setPrescence(allHexes);

// narysowanie hex'ow
drawMarsHexes(gElem, cHex, allHexes);

function HexLine(y, xes) {
	this.y = y;
	this.xes = xes;
}

//drawCircle(gElem, 'idKolo', 'krag', 200, 400, 100);
//drawHexagon(gElem, 'hex1', 'hexagon', 200, 400, 100);

function generateMarsHexesCoordinates(marsHexes, xPoints, yPoints) {
	// wyznaczenie ekstremow {y0,y8} i centrum {y4}
	let y0 = yPoints[0];
	let y4 = yPoints[1];
	let y8 = yPoints[2];
	// a teraz "binarnie" wyznaczenie punktow pomiedzy
	let y2 = (y0 + y4) / 2;
	let y1 = (y0 + y2) / 2;
	let y3 = (y2 + y4) / 2;
	let y6 = (y4 + y8) / 2;
	let y5 = (y4 + y6) / 2;
	let y7 = (y6 + y8) / 2;
	// parzyste linie - wspolrzedne horyzontalne = even
	// wyznaczenie ekstremow
	let e0 = xPoints[0];
	let e8 = xPoints[3];
	// a teraz "binarnie" wyznaczenie punktow pomiedzy
	let e4 = (e0 + e8) / 2;
	let e2 = (e0 + e4) / 2;
	let e6 = (e4 + e8) / 2;
	let e1 = (e0 + e2) / 2;
	let e3 = (e2 + e4) / 2;
	let e5 = (e4 + e6) / 2;
	let e7 = (e6 + e8) / 2;
	// nieparzyste linie - wspolrzedne horyzontalne = odd
	let o0 = (e0 + e1) / 2;
	let o1 = (e1 + e2) / 2;
	let o2 = (e2 + e3) / 2;
	let o3 = (e3 + e4) / 2;
	let o4 = (e4 + e5) / 2;
	let o5 = (e5 + e6) / 2;
	let o6 = (e6 + e7) / 2;
	let o7 = (e7 + e8) / 2;

	marsHexes.push(new HexLine(y0, new Array(e2, e3, e4, e5, e6)));
	marsHexes.push(new HexLine(y1, new Array(o1, o2, o3, o4, o5, o6)));
	marsHexes.push(new HexLine(y2, new Array(e1, e2, e3, e4, e5, e6, e7)));
	marsHexes.push(new HexLine(y3, new Array(o0, o1, o2, o3, o4, o5, o6, o7)));
	marsHexes.push(new HexLine(y4, new Array(e0, e1, e2, e3, e4, e5, e6, e7, e8)));
	marsHexes.push(new HexLine(y5, new Array(o0, o1, o2, o3, o4, o5, o6, o7)));
	marsHexes.push(new HexLine(y6, new Array(e1, e2, e3, e4, e5, e6, e7)));
	marsHexes.push(new HexLine(y7, new Array(o1, o2, o3, o4, o5, o6)));
	marsHexes.push(new HexLine(y8, new Array(e2, e3, e4, e5, e6)));
	let yextra = new Array();
	yextra.push(e0);
	marsHexes.push(new HexLine(y0, yextra));
	marsHexes.push(new HexLine(y8, yextra));
}

function generateMarsHexTilesCoordinates(marsHexes, idPrefix, hexR) {
	let coords = new Array();

	let hexLoop = 0;
	let hexId;
	let line;
	let lineY;
	let lineXes;
	let lineLoop = 0;
	let count = 0;
	// idziemy po kolei po liniach hex'ow
	for (; lineLoop < marsHexes.length; lineLoop++) {
		console.log('Line: ' + lineLoop)
		line = marsHexes[lineLoop];
		console.log(line);
		lineY = line['y'];
		console.log(lineY);
		lineXes = line['xes'];
		console.log(lineXes);
		for (hexLoop = 0; hexLoop < lineXes.length; hexLoop++) {
			hexId = idPrefix.concat(lineLoop).concat(hexLoop);
			console.log('Drawing hex = ' + hexId);
			coords.push(new HexTileCoordinates(hexId, count, lineXes[hexLoop], lineY, hexR));
			//drawHexagon(svgElem, hexId, classForHexes, lineXes[hexLoop], lineY, hexR);
			//drawCircle(svgElem, hexId, classForHexes, lineXes[hexLoop], lineY, hexR);
			count++;
		}
	}

	return coords;
}

function drawMarsHexes(svgElem, classForHexes, hexTilesCoordinates) {
	let hexLoop = 0;
	let hexTile;
	for (; hexLoop < hexTilesCoordinates.length; hexLoop++) {
		hexTile = hexTilesCoordinates[hexLoop];
		console.log('Drawing hex = ' + hexTile['oId'] + ' [' + hexTile['numericId'] + ']');
		drawHexagon(svgElem, hexTile['oId'], classForHexes, hexTile['cx'], hexTile['cy'], hexTile['r']);
		//drawCircle(svgElem, hexTile['oId'], classForHexes, hexTile['cx'], hexTile['cy'], hexTile['r']);
	}
}

function oldHForR(r) {
	return r * Math.sqrt(3) / 2;
}

function hForR(r) {
	let raw = r * Math.sqrt(3) / 2;
	//  console.log('raw:');
	//  console.log(raw);
	let rawString = new String(raw);
	//  console.log(rawString);
	let restored = Number(rawString);
	//  console.log(restored);
	let resultString = restored.toFixed(1);
	//  console.log('resultString');
	//  console.log(resultString);
	let result = Number(resultString);
	//  console.log('result');
	//  console.log(result);
	return result;
}

function yTopMidBottom(cy, r) {
	let h = hForR(r);
	return new Array(cy - h, cy, cy + h);
}

function xLeftMidleftMidrightRight(cx, r) {
	return new Array(cx - r, cx - (r / 2), cx + (r / 2), cx + r);
}

function xValuesForCXR(cx, r) {
	// to nie jest blad ze tu jest Y - po prostu to jest obrocone ortagonalnie w wyliczeniach
	// kolejnosc wierzcholkow taka jak kolejnosc godzin na zegarku - zaczynamy od 12 i ruch zgodnie ze wskazowkami
	let srcValues = yTopMidBottom(cx, r);
	let left = srcValues[0];
	let mid = srcValues[1];
	let right = srcValues[2];
	return new Array(mid, right, right, mid, left, left);
}

function yValuesForCYR(cy, r) {
	// to nie jest blad ze tu jest X - po prostu to jest obrocone ortagonalnie w wyliczeniach
	// kolejnosc wierzcholkow taka jak kolejnosc godzin na zegarku - zaczynamy od 12 i ruch zgodnie ze wskazowkami
	let srcValues = xLeftMidleftMidrightRight(cy, r);
	let top = srcValues[0];
	let up = srcValues[1];
	let down = srcValues[2];
	let bottom = srcValues[3];
	return new Array(top, up, down, bottom, down, up);
}

function drawHexagon(svgElem, oId, oClass, hexCX, hexCY, hexR) {
	let points = new String();
	let xpoints = xValuesForCXR(hexCX, hexR);
	let ypoints = yValuesForCYR(hexCY, hexR);
	let loop = 0;
	for (; loop < 6; loop++) {
		if (loop > 0) {
			points = points.concat(' ');
		}
		points = points.concat(xpoints[loop]).concat(',').concat(ypoints[loop]);
	}
	console.log(points);
	const hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	hex.id = oId;
	hex.setAttribute('class', oClass);
	hex.setAttribute('points', points);
	console.log(hex);
	svgElem.appendChild(hex);
}

function drawHexagonHoriz(svgElem, oId, oClass, hexCX, hexCY, hexR) {
	let points = new String();
	let xpoints = yValuesForCYR(hexCY, hexR);
	let ypoints = xValuesForCXR(hexCX, hexR);
	let loop = 0;
	for (; loop < 6; loop++) {
		if (loop > 0) {
			points = points.concat(' ');
		}
		points = points.concat(xpoints[loop]).concat(',').concat(ypoints[loop]);
	}
	console.log(points);
	const hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	hex.id = oId;
	hex.setAttribute('class', oClass);
	hex.setAttribute('points', points);
	console.log(hex);
	svgElem.appendChild(hex);
}

function drawCircle(svgElem, oId, oClass, hexCX, hexCY, hexR) {
	console.log(svgElem);
	const kolo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	kolo.id = oId;
	kolo.setAttribute('class', oClass);
	kolo.setAttribute('cx', hexCX);
	kolo.setAttribute('cy', hexCY);
	kolo.setAttribute('r', hexR);
	console.log(kolo);
	svgElem.appendChild(kolo);
}

function drawRect(svgElem, oId, oClass, rectX, rectY, rectW, rectH) {
	console.log(svgElem);
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	rect.id = oId;
	rect.setAttribute('class', oClass);
	rect.setAttribute('x', rectX);
	rect.setAttribute('y', rectY);
	rect.setAttribute('width', rectW);
	rect.setAttribute('height', rectH);
	console.log(rect);
	svgElem.appendChild(rect);
}

// reprezentuje wartosci umozliwiajace namierzanie hex na planszy
function HexTileCoordinates(oId, numericId, cx, cy, r) {
	this.oId = oId;
	this.numericId = numericId;
	this.cx = cx;
	this.cy = cy;
	this.r = r;
}

// de facto tablica do szybkiego sprawdzenia nad ktorym kafelkiem jest kursor myszy gdy jest na obszarze planszy
function GameHexPrescence(areaX, areaY) {
	this.w = areaX;
	this.h = areaY;
	this.area = new Array(areaY);
	for (let loopY = 0; loopY < areaY; loopY++) {
		this.area[loopY] = new Array(areaX);
		for (let loopX = 0; loopX < areaX; loopX++) {
			this.area[loopY][loopX] = -1;
		}
	}
	console.log('GameHexPrescence is [y: ' + areaY + ' ; x: ' + areaX + ']' );

	this.setPrescence = function (val, posX, posY) {
		if ((posX > -1 && posX < this.w) && (posY > -1 && posY < this.h)) {
			this.area[posY][posX] = val;
		}
	};

	this.setPrescence = function (hexesArray) {
		if (Array.isArray(hexesArray) && hexesArray.length > 0) {
			for (let loop = 0; loop < hexesArray.length; loop++) {
				hex = hexesArray[loop];
				this.setHexPrescence(hex.numericId, hex.cx, hex.cy, hex.r);
			}
		}
	}

	this.setHexPrescence = function (val, cx, cy, r) {
		let xpoints = xValuesForCXR(cx, r);
		let ypoints = yValuesForCYR(cy, r);

		this.setHexPrescenceTop(val, xpoints[0], ypoints[0], xpoints[5], ypoints[5], xpoints[1], ypoints[1]);
		this.setHexPrescenceCentral(val, xpoints[5], ypoints[5], xpoints[2], ypoints[2]);
		this.setHexPrescenceBottom(val, xpoints[3], ypoints[3], xpoints[4], ypoints[4], xpoints[2], ypoints[2]);
	};

	this.setHexPrescenceTop = function (val, topX, topY, leftX, leftY, rightX, rightY) {
		// wzor na przebieg linii: y = ax + b
		// dla kazdej linii trzeba wiec wyznaczyc a i b
		// b = (y1 * x2 - y2 * x1) / (x2 - x1)
		let lineLeftB = (leftY * topX - topY * leftX) / (topX - leftX);
		let lineLeftA = (topY - lineLeftB) / topX;
		let lineRightB = (topY * rightX - rightY * topX) / (rightX - topX);
		let lineRightA = (topY - lineRightB) / topX;

		// wyznaczenie wartosci zaokraglonych dla odpowiednich wierzcholkow
		let primTopY = Math.ceil(topY);
		let primLeftY = Math.ceil(leftY);
		let primRightY = Math.ceil(leftY);

		// mapa na 2 tablicach - po lewej stronie :D
		let leftYArray = new Array();
		let leftXArray = new Array();

		//schodzimy po schodach - po Y. Sprawdzamy gdzie zaczyna sie kolejny schodek.
		// "schodzimy", a nie "wchodzimy", bo kierunek osi Y jest skierowany przeciwnie do tego co jest normalnie w ukladzie wspolrzednych
		for (let cursor = primLeftY-1; cursor > primTopY; cursor--) {
			// x = (y - b) / a   // wynika z y = a * x + b
			let cursorX = (cursor - lineLeftB) / lineLeftA;
			let primCursorX = Math.ceil(cursorX);

			leftYArray.push(cursor);
			leftXArray.push(primCursorX);
		}

		// mapa na 2 tablicach - po prawej stronie :D
		let rightYArray = new Array();
		let rightXArray = new Array();

		//wchodzimy po schodach - po Y. Sprawdzamy gdzie konczy sie kolejny schodek.
		// "wchodzimy", a nie "schodzimy", bo kierunek osi Y jest skierowany przeciwnie do tego co jest normalnie w ukladzie wspolrzednych
		for (let cursor = primTopY+1; cursor < primRightY; cursor++) {
			// x = (y - b) / a   // wynika z y = a * x + b
			let cursorX = (cursor - lineRightB) / lineRightA;
			let primCursorX = Math.floor(cursorX);

			rightYArray.push(cursor);
			rightXArray.push(primCursorX);
		}

		//console.log('UWAGA UWAGA!!!');
		//console.log(leftYArray);
		//console.log(leftXArray);
		//console.log(rightYArray);
		//console.log(rightXArray);

		// odwrocenie tablic, by moc latwiej sparowac wartosci lewej strony z wartosciami z prawej strony
		let revRightXArray = rightXArray.reverse();
		let revRightYArray = rightYArray.reverse();

		// laczenie stron w pary i oznaczanie zakresow
		if (revRightYArray[0] === leftYArray[0]) {
			for (let cursor = 0; cursor < revRightYArray.length; cursor++) {
				//console.log('Line :' + revRightYArray[cursor] + ' : ' + leftXArray[cursor] + ' - ' + revRightXArray[cursor]);
				this.setPrescenceHorizontalLine(val, revRightYArray[cursor], leftXArray[cursor], revRightXArray[cursor]);
			}
		}
	}

	// UWAGA - nazewnictwo na osi Y moze byc mylace - ze wzgledu na to ze wartosci na osi Y narastaja gdy na obrazku poruszamy sie 'w dol' (os Y ma przeciwny zwrot wzgledem tego co jest normalnie w ukladzie wspolrzednych)
	// upY = wspolrzedna Y wierzcholkow ktore na planszy dla danego hex'a sa na godzinie 2 i 10
	// downY = wspolrzedna Y wierzcholkow ktore na planszy dla danego hex'a sa na godzinie 4 i 8
	this.setHexPrescenceCentral = function (val, leftX, upY, rightX, downY) {
		let primLeftX = Math.ceil(leftX);
		let primRightX = Math.floor(rightX);
		let primUpY = Math.ceil(upY);
		let primDownY = Math.floor(downY);
		for (let cursor = primUpY; cursor < primDownY; cursor++) {
			console.log('Line :' + cursor + ' : ' + primLeftX + ' - ' + primRightX);
			this.setPrescenceHorizontalLine(val, cursor, primLeftX, primRightX);
		}
	}

	this.setHexPrescenceBottom = function (val, bottomX, bottomY, leftX, leftY, rightX, rightY) {
		// wzor na przebieg linii: y = ax + b
		// dla kazdej linii trzeba wiec wyznaczyc a i b
		// b = (y1 * x2 - y2 * x1) / (x2 - x1)
		let lineLeftB = (leftY * bottomX - bottomY * leftX) / (bottomX - leftX);
		let lineLeftA = (bottomY - lineLeftB) / bottomX;
		let lineRightB = (bottomY * rightX - rightY * bottomX) / (rightX - bottomX);
		let lineRightA = (bottomY - lineRightB) / bottomX;

		// wyznaczenie wartosci zaokraglonych dla odpowiednich wierzcholkow
		let primBottomY = Math.floor(bottomY);
		console.log('leftY, primLeftY');
		console.log(leftY);
		let primLeftY = Math.floor(leftY);
		console.log(primLeftY);
		let primRightY = Math.floor(leftY);

		// mapa na 2 tablicach - po lewej stronie :D
		let leftYArray = new Array();
		let leftXArray = new Array();

		//wchodzimy po schodach (od spodu - idziemy do gory nogami :D )- po Y. Sprawdzamy gdzie zaczyna sie kolejny schodek.
		// "wchodzimy", a nie "schodzimy", bo kierunek osi Y jest skierowany przeciwnie do tego co jest normalnie w ukladzie wspolrzednych
		for (let cursor = primLeftY; cursor < primBottomY; cursor++) {
			// x = (y - b) / a   // wynika z y = a * x + b
			let cursorX = (cursor - lineLeftB) / lineLeftA;
			let primCursorX = Math.floor(cursorX);

			leftYArray.push(cursor);
			leftXArray.push(primCursorX);
		}

		// mapa na 2 tablicach - po prawej stronie :D
		let rightYArray = new Array();
		let rightXArray = new Array();

		//schodzimy po schodach (od spodu - idziemy do gory nogami :D ) - po Y. Sprawdzamy gdzie konczy sie kolejny schodek.
		// "schodzimy", a nie "wchodzimy", bo kierunek osi Y jest skierowany przeciwnie do tego co jest normalnie w ukladzie wspolrzednych
		for (let cursor = primBottomY-1; cursor > primRightY-1; cursor--) {
			// x = (y - b) / a   // wynika z y = a * x + b
			let cursorX = (cursor - lineRightB) / lineRightA;
			let primCursorX = Math.ceil(cursorX);

			rightYArray.push(cursor);
			rightXArray.push(primCursorX);
		}

		//console.log('UWAGA UWAGA!!!');
		//console.log(leftYArray);
		//console.log(leftXArray);
		//console.log(rightYArray);
		//console.log(rightXArray);

		// odwrocenie tablic, by moc latwiej sparowac wartosci lewej strony z wartosciami z prawej strony
		let revRightXArray = rightXArray.reverse();
		let revRightYArray = rightYArray.reverse();

		// laczenie stron w pary i oznaczanie zakresow
		if (revRightYArray[0] === leftYArray[0]) {
			for (let cursor = 0; cursor < revRightYArray.length; cursor++) {
				//console.log('Line :' + revRightYArray[cursor] + ' : ' + leftXArray[cursor] + ' - ' + revRightXArray[cursor]);
				this.setPrescenceHorizontalLine(val, revRightYArray[cursor], leftXArray[cursor], revRightXArray[cursor]);
			}
		}
	}

	this.setPrescenceHorizontalLine = function (val, posY, posXstart, posXend) {
		if ((posY > -1 && posY < this.h) && (posXstart > -1 && posXstart < this.w) && (posXend > -1 && posXend < this.w)) {
			let line = this.area[posY];
			for (let cursor = posXstart; cursor <= posXend; cursor++) {
				line[cursor] = val;
			}
		}
	};

	this.getPrescence = function (posX, posY) {
		if ((posX > -1 && posX < this.w) && (posY > -1 && posY < this.h)) {
			return this.area[posY][posX];
		}
		return -1;
	};
}

gElem.addEventListener('mousemove', runEvent);

// Event handler
function runEvent(e) {
	console.log(`EVENT TYPE: ${e.type}`);
	let result = gameHexPrescence.getPrescence(e.offsetX, e.offsetY);
	heading.textContent = `MouseX: ${e.offsetX} MouseY: ${e.offsetY} Hex: ${result}`;
	//document.body.style.backgroundColor = `rgb(${e.offsetX}, ${e.offsetY}, 40)`;
	e.preventDefault();
}