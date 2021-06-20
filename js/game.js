const boardContainer = document.getElementById('boardContainer');
const gameBoard = document.getElementById('gameBoard');
const ctx = gameBoard.getContext('2d');

const gameArea = new GameArea(900);

setSize(gameArea, boardContainer, gameBoard);
//makeTransparent(ctx, gameArea.getWidth(), gameArea.getHeight());

document.addEventListener('DOMContentLoaded', (ev) => {
	let canvas = document.getElementById('gameBoard');
	let ctx = canvas.getContext('2d');
	let imgObj = new Image();

	imgObj.onload = function() {
		let w = canvas.width;
		let h = canvas.height;
		let nw = imgObj.naturalWidth;
		let nh = imgObj.naturalHeight;
		let snw = nw * gameArea.scale;
		let snh = nh * gameArea.scale;
		console.log('Image: Natural');
		console.log(w);
		console.log(h);
		console.log(nw);
		console.log(nh);
		console.log(snw);
		console.log(snh);
		let bdx = (w - snw) / 2;
		let bdy = (h - snh) / 2;
		console.log(bdx);
		console.log(bdy);
		let aspect = nw / nh;



		////ctx.drawImage(imgObj, (sw - snw) / 2, (sh - snh) / 2, (sw + snw) / 2, (sh + snh) / 2);
		//ctx.drawImage(imgObj, 0, 0, snw, snh, (sw - snw) / 2, (sh - snh) / 2, (sw + snw) / 2, (sh + snh) / 2);
		////ctx.drawImage(imgObj, 0, 0, nw, nw / aspect, (w - nw) / 2, (h - nh) / 2, (nw - ((w - nw) / 2)) * gameArea.scale, (nh - ((h - nh) / 2)) * gameArea.scale);
		ctx.drawImage(imgObj, bdx, bdy, snw, snh);
		drawMarsHexes(gameArea, gameBoard);
	};

	//imgObj.src = '../img/tharsis_v1.png';
	//imgObj.src = '../img/hellas_v1.png';
	imgObj.src = '../img/elysium_v1.png';
});

let heading = document.querySelector('h5');
gameBoard.addEventListener('mousemove', runEvent);

// Event handler
function runEvent(e) {
	//console.log(`EVENT TYPE: ${e.type}`);
	let result = gameArea.hexPrescence.getPrescence(e.offsetX, e.offsetY);
	heading.textContent = `MouseX: ${e.offsetX} MouseY: ${e.offsetY} Hex: ${result}`;
	//document.body.style.backgroundColor = `rgb(${e.offsetX}, ${e.offsetY}, 40)`;
	e.preventDefault();
}

function drawMarsHexes(gameArea, gameBoard) {
	let hexLoop = 0;
	let hexTile;
	for (; hexLoop < gameArea.hexes.length; hexLoop++) {
		hexTile = gameArea.hexes[hexLoop];
		console.log('Drawing hex = ' + hexTile['oId'] + ' [' + hexTile['numericId'] + ']');
		drawHexagon(gameArea, gameBoard, hexTile);
	}
}

function drawHexagon(gameArea, gameBoard, hex) {
	let ctx = gameBoard.getContext('2d');
	ctx.strokeStyle = '#ffb31a';
	if (gameArea.scaleDenominator > 6) {
		ctx.lineWidth = 3;
	} else if (gameArea.scaleDenominator > 3) {
		ctx.lineWidth = 2;
	} else {
		ctx.lineWidth = 1;
	}
	ctx.beginPath();
	ctx.moveTo(hex.xmid, hex.ytop);
	ctx.lineTo(hex.xright, hex.yup);
	ctx.lineTo(hex.xright,hex.ydown);
	ctx.lineTo(hex.xmid,hex.ybottom);
	ctx.lineTo(hex.xleft,hex.ydown);
	ctx.lineTo(hex.xleft,hex.yup);
	ctx.closePath();
	ctx.stroke();
}

function setSize(gameArea, boardContainer, gameBoard) {
	boardContainer.height = gameArea.height;
	boardContainer.width = gameArea.width;

	gameBoard.height = gameArea.height;
	gameBoard.width = gameArea.width;
}

function makeTransparent(ctx, w, h) {
	ctx.fillStyle = 'rgba(255,255,255,0.3)';
	console.log("makeTransparent");
	console.log(w);
	console.log(h);
	ctx.fillRect(0,0, w, h);
}

function GameArea(baseDimention) {
	this.baseDimention = baseDimention;
	this.scaleDenominator = 9; // 3-9 - mnoznik - sluzy do skalowania calosci
	this.scaleNumerator = 9;
	this.scale = this.scaleDenominator / this.scaleNumerator;
	this.height = this.baseDimention * this.scale;
	this.margin = this.height / this.scaleNumerator / 2;
	this.width = this.height + 4 * this.margin;
// wymiary marsa
	this.marsCX = this.width /2;
	this.marsCY = this.height /2;
	this.marsR = this.marsCY - this.margin;
// promien hex'a
	this.hexR = this.marsR /8;

	this.hexPrescence = new GameHexPrescence(Math.round(this.width), Math.round(this.height));
	this.hexes = new HexArithmetic().generateCentralHexCoordinates('tm', this.marsCX, this.marsCY, this.marsR, this.hexR);
	this.hexPrescence.setPrescence(this.hexes);

	this.getHeight = function() {
		return this.height;
	}

	this.getWidth = function() {
		return this.width;
	}
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
				this.setHexPrescence(hexesArray[loop]);
			}
		}
	}

	this.setHexPrescence = function (hex) {
		console.log('hex');
		console.log(hex);

		this.setHexPrescenceTop(hex.numericId, hex.xmid, hex.ytop, hex.xleft, hex.yup, hex.xright, hex.yup);
		this.setHexPrescenceCentral(hex.numericId, hex.xleft, hex.yup, hex.xright, hex.ydown);
		this.setHexPrescenceBottom(hex.numericId, hex.xmid, hex.ybottom, hex.xleft, hex.ydown, hex.xright, hex.ydown);
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

function HexLine(y, xes) {
	this.y = y;
	this.xes = xes;
}

function HexTileCoordinates(oId, numericId, cx, cy, r) {
	this.oId = oId;
	this.numericId = numericId;
	this.cx = cx;
	this.cy = cy;
	this.r = r;

	let raw = r * Math.sqrt(3) / 2;
	let rawString = new String(raw);
	let restored = Number(rawString);
	let resultString = restored.toFixed(1);
	this.h = Number(resultString);

	this.xleft = Math.round(cx - this.h);
	this.xmid = Math.round(cx);
	this.xright = Math.round(cx + this.h);
	this.ytop = Math.round(cy - r);
	this.yup = Math.round(cy - (r/2));
	this.ydown = Math.round(cy + (r/2));
	this.ybottom = Math.round(cy + r);
	this.point12H = new Point2D(this.xmid, this.ytop);
	this.point2H = new Point2D(this.xright, this.yup);
	this.point4H = new Point2D(this.xright, this.ydown);
	this.point6H = new Point2D(this.xmid, this.ybottom);
	this.point8H = new Point2D(this.xleft, this.ydown);
	this.point10H = new Point2D(this.xleft, this.yup);
}

function Point2D(x, y) {
	this.x = x;
	this.y = y;
}

function HexArithmetic() {

	this.hForR = function (r) {
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

	this.yTopMidBottom = function (cy, r) {
		let h = this.hForR(r);
		return new Array(cy - h, cy, cy + h);
	}

	this.xLeftMidleftMidrightRight = function (cx, r) {
		return new Array(cx - r, cx - (r / 2), cx + (r / 2), cx + r);
	}

	this.generateHexLines = function (mCX, mCY, mR) {

		let xPoints = this.xLeftMidleftMidrightRight(mCX, mR);
		let yPoints = this.yTopMidBottom(mCY, mR);

		let result = new Array();
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

		result.push(new HexLine(y0, new Array(e2, e3, e4, e5, e6)));
		result.push(new HexLine(y1, new Array(o1, o2, o3, o4, o5, o6)));
		result.push(new HexLine(y2, new Array(e1, e2, e3, e4, e5, e6, e7)));
		result.push(new HexLine(y3, new Array(o0, o1, o2, o3, o4, o5, o6, o7)));
		result.push(new HexLine(y4, new Array(e0, e1, e2, e3, e4, e5, e6, e7, e8)));
		result.push(new HexLine(y5, new Array(o0, o1, o2, o3, o4, o5, o6, o7)));
		result.push(new HexLine(y6, new Array(e1, e2, e3, e4, e5, e6, e7)));
		result.push(new HexLine(y7, new Array(o1, o2, o3, o4, o5, o6)));
		result.push(new HexLine(y8, new Array(e2, e3, e4, e5, e6)));
		let yextra = new Array();
		yextra.push(e0);
		result.push(new HexLine(y0, yextra));
		result.push(new HexLine(y8, yextra));

		return result;
	}

	this.generateCentralHexCoordinates = function (idPrefix, mCX, mCY, mR, hexR) {
		let coords = new Array();

		let marsHexes = this.generateHexLines(mCX, mCY, mR);

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
}