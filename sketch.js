// 定義六個幼兒生活情境、動畫插畫與正確答案。
const quizItems = [
	{ title: "早上起床後", icon: "🪥", answer: "早晚都要認真刷牙" },
	{ title: "準備過馬路", icon: "🚦", answer: "牽好大人的手看號誌" },
	{ title: "到了晚上", icon: "🌙", answer: "早點睡覺才有精神" },
	{ title: "外面下雨了", icon: "☂️", answer: "出門記得帶上雨傘" },
	{ title: "準備吃東西", icon: "🧼", answer: "吃東西前先洗洗手" },
	{ title: "手上有垃圾", icon: "🗑️", answer: "垃圾要丟進垃圾桶" }
];

// 定義可拖曳的六個文字選項。
const answerChoices = ["吃東西前先洗洗手", "垃圾要丟進垃圾桶", "出門記得帶上雨傘", "早點睡覺才有精神", "牽好大人的手看號誌", "早晚都要認真刷牙"];

// 記錄每張題目卡目前配對的文字選項編號。
let placedChoices = Array(6).fill(-1);

// 記錄題目卡與文字選項的畫面位置。
let itemBounds = [];
let choiceBounds = [];

// 記錄拖曳中選項、交卷狀態與成績。
let draggingChoice = -1;
let quizSubmitted = false;
let finalCorrectCount = 0;
let finalScore = 0;

// 記錄目前滑鼠或手指的位置。
let pointerPosition = { x: 0, y: 0 };

// 記錄慶祝時落下的彩帶粒子。
let confettiPieces = [];

// 設定畫面使用的主題顏色。
const palette = {
	background: "#f4f7ef", ink: "#243b36", muted: "#70827a",
	card: "#ffffff", line: "#dce7dc", green: "#287a64",
	greenLight: "#e3f3e9", yellow: "#f6ce5b", coral: "#ef806b",
	blue: "#74b9d2", lavender: "#a89bd1", paleYellow: "#fff5d6"
};

// 建立跟隨視窗大小的全螢幕畫布。
function setup() {
	createCanvas(windowWidth, windowHeight);
	textFont('"Noto Sans TC", "Microsoft JhengHei", sans-serif');
	textAlign(CENTER, CENTER);
	pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
}

// 每一影格重繪畫面並播放圖示與彩帶動畫。
function draw() {
	background(palette.background);
	pointerPosition = { x: mouseX, y: mouseY };
	calculateLayout();
	drawDecorations();
	drawHeader();
	drawQuizCards();
	drawChoices();
	drawSubmitButton();
	drawResultOverlay();
	drawConfetti();
}

// 依螢幕寬度計算桌面或手機版的卡片位置。
function calculateLayout() {
	const compact = width < 720;
	const margin = compact ? 18 : Math.min(42, width * 0.035);
	const columns = compact ? 3 : 6;
	const gap = compact ? 9 : 14;
	const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
	const cardHeight = compact ? 132 : Math.min(228, Math.max(190, height * 0.29));
	const cardTop = compact ? 105 : 145;
	const rows = Math.ceil(quizItems.length / columns);

	itemBounds = quizItems.map((item, index) => {
		const column = index % columns;
		const row = Math.floor(index / columns);
		return { x: margin + column * (cardWidth + gap), y: cardTop + row * (cardHeight + gap), w: cardWidth, h: cardHeight };
	});

	const cardsBottom = cardTop + rows * cardHeight + (rows - 1) * gap;
	const sectionTop = cardsBottom + (compact ? 27 : 35);
	const choiceColumns = compact ? 2 : 3;
	const choiceGap = compact ? 9 : 12;
	const choiceWidth = (width - margin * 2 - choiceGap * (choiceColumns - 1)) / choiceColumns;
	const choiceHeight = compact ? 43 : 52;
	const choiceTop = sectionTop + (compact ? 33 : 38);

	choiceBounds = answerChoices.map((choice, index) => {
		const column = index % choiceColumns;
		const row = Math.floor(index / choiceColumns);
		return { x: margin + column * (choiceWidth + choiceGap), y: choiceTop + row * (choiceHeight + choiceGap), w: choiceWidth, h: choiceHeight };
	});
}

// 繪製淡色裝飾，保留題目與操作區的清晰度。
function drawDecorations() {
	noStroke();
	fill(246, 206, 91, 48);
	circle(width - 22, 34, 112);
	fill(116, 185, 210, 42);
	circle(12, height - 18, 90);
	fill(239, 128, 107, 48);
	circle(width - 5, height * 0.68, 48);
}

// 繪製標題與簡短的配對提示。
function drawHeader() {
	const compact = width < 720;
	const left = compact ? 19 : Math.min(45, width * 0.04);
	textAlign(LEFT, CENTER);
	fill(palette.green);
	textSize(compact ? 12 : 13);
	text("小小生活家 · 配對挑戰", left, 22);
	fill(palette.ink);
	textSize(compact ? 25 : 31);
	textStyle(BOLD);
	text("生活小達人", left, compact ? 51 : 58);
	textStyle(NORMAL);
	fill(palette.muted);
	textSize(compact ? 11 : 14);
	textAlign(RIGHT, CENTER);
	text("把好習慣拖到正確的圖卡裡", width - left, compact ? 50 : 57);
	textAlign(CENTER, CENTER);
}

// 繪製六張固定圖卡，並讓生活插畫上下輕輕跳動。
function drawQuizCards() {
	const compact = width < 720;
	const iconSize = compact ? Math.min(38, itemBounds[0].w * 0.35) : Math.min(62, itemBounds[0].w * 0.38);

	quizItems.forEach((item, index) => {
		const box = itemBounds[index];
		const assigned = placedChoices[index];
		const correct = quizSubmitted && assigned >= 0 && answerChoices[assigned] === item.answer;
		const wrong = quizSubmitted && assigned >= 0 && !correct;
		const bob = Math.sin(frameCount * 0.055 + index * 1.4) * (compact ? 2 : 3);

		fill(palette.card);
		stroke(palette.line);
		strokeWeight(1);
		rect(box.x, box.y, box.w, box.h, compact ? 13 : 18);
		noStroke();
		fill(palette.muted);
		textAlign(LEFT, CENTER);
		textSize(compact ? 9 : 11);
		text(`生活情境 ${index + 1}`, box.x + 10, box.y + (compact ? 14 : 19));
		fill(index % 2 === 0 ? palette.paleYellow : palette.greenLight);
		circle(box.x + box.w / 2, box.y + (compact ? 51 : 80), compact ? 53 : 90);
		fill(palette.ink);
		textAlign(CENTER, CENTER);
		textSize(iconSize);
		text(item.icon, box.x + box.w / 2, box.y + (compact ? 51 : 80) + bob);
		fill(palette.ink);
		textSize(compact ? 10 : 14);
		textStyle(BOLD);
		text(item.title, box.x + 5, box.y + (compact ? 84 : 139), box.w - 10, compact ? 19 : 24);
		textStyle(NORMAL);

		const slotY = box.y + box.h - (compact ? 34 : 49);
		const slotHeight = compact ? 25 : 38;
		fill(correct ? palette.greenLight : wrong ? "#fff0ed" : "#f4f7f2");
		stroke(correct ? palette.green : wrong ? palette.coral : palette.line);
		strokeWeight(correct || wrong ? 2 : 1);
		rect(box.x + 7, slotY, box.w - 14, slotHeight, compact ? 8 : 11);
		noStroke();
		fill(assigned >= 0 ? (correct ? palette.green : wrong ? "#c65d4c" : palette.ink) : palette.muted);
		textSize(compact ? 8 : 11);
		textStyle(assigned >= 0 ? BOLD : NORMAL);
		text(assigned >= 0 ? answerChoices[assigned] : "拖曳文字到這裡", box.x + 11, slotY + slotHeight / 2, box.w - 22, slotHeight - 2);
		textStyle(NORMAL);
	});
}

// 繪製文字選項，並在拖曳時讓選項跟隨指標移動。
function drawChoices() {
	const compact = width < 720;
	const usedChoices = placedChoices.filter((choiceIndex) => choiceIndex >= 0);
	textAlign(LEFT, CENTER);
	fill(palette.ink);
	textStyle(BOLD);
	textSize(compact ? 14 : 17);
	text("選一個好習慣", itemBounds[0].x, choiceBounds[0].y - (compact ? 25 : 29));
	textStyle(NORMAL);

	answerChoices.forEach((choice, index) => {
		const box = choiceBounds[index];
		const placed = usedChoices.includes(index);
		const dragging = draggingChoice === index;
		const x = dragging ? pointerPosition.x - box.w / 2 : box.x;
		const y = dragging ? pointerPosition.y - box.h / 2 : box.y;
		fill(placed && !dragging ? "#e8eee7" : dragging ? palette.yellow : palette.card);
		stroke(dragging ? palette.yellow : palette.line);
		strokeWeight(1);
		rect(x, y, box.w, box.h, compact ? 11 : 14);
		noStroke();
		fill(placed && !dragging ? palette.muted : palette.ink);
		textAlign(CENTER, CENTER);
		textSize(compact ? 10 : 14);
		textStyle(dragging ? BOLD : NORMAL);
		text(choice, x + 7, y + 3, box.w - 14, box.h - 6);
		textStyle(NORMAL);
	});
}

// 繪製交卷按鈕與目前完成的配對數量。
function drawSubmitButton() {
	const allPlaced = placedChoices.every((choiceIndex) => choiceIndex >= 0);
	const button = getSubmitButtonBounds();
	const bottom = choiceBounds[choiceBounds.length - 1].y + choiceBounds[choiceBounds.length - 1].h;
	fill(allPlaced && !quizSubmitted ? palette.green : "#b9c7bd");
	noStroke();
	rect(button.x, button.y, button.w, button.h, 15);
	fill("#ffffff");
	textAlign(CENTER, CENTER);
	textSize(width < 720 ? 14 : 16);
	textStyle(BOLD);
	text(quizSubmitted ? "重新挑戰" : "交卷看成績", width / 2, button.y + button.h / 2);
	textStyle(NORMAL);
	fill(palette.muted);
	textSize(width < 720 ? 10 : 12);
	text(`${placedChoices.filter((choiceIndex) => choiceIndex >= 0).length} / 6 已完成`, width / 2, bottom + (width < 720 ? 16 : 22) + button.h + 16);
}

// 顯示交卷成績、答對題數與再玩一次的提示。
function drawResultOverlay() {
	if (!quizSubmitted) return;
	fill(36, 59, 54, 45);
	rect(0, 0, width, height);
	const boxWidth = Math.min(width - 36, 390);
	const boxHeight = 230;
	const boxX = (width - boxWidth) / 2;
	const boxY = Math.max(85, (height - boxHeight) / 2);
	fill(palette.card);
	noStroke();
	rect(boxX, boxY, boxWidth, boxHeight, 24);
	fill(finalScore > 80 ? palette.green : palette.ink);
	textAlign(CENTER, CENTER);
	textStyle(BOLD);
	textSize(19);
	text(finalScore > 80 ? "太棒了，生活小達人！" : "再試一次，你會更熟練！", width / 2, boxY + 43);
	textSize(54);
	text(`${finalScore}%`, width / 2, boxY + 106);
	textStyle(NORMAL);
	fill(palette.muted);
	textSize(14);
	text(`答對 ${finalCorrectCount} 題，共 6 題`, width / 2, boxY + 157);
	fill(palette.green);
	textSize(13);
	text("按下「重新挑戰」再玩一次", width / 2, boxY + 193);
}

// 成績高於八十分時持續新增並繪製彩帶粒子。
function drawConfetti() {
	if (!quizSubmitted || finalScore <= 80) return;
	if (frameCount % 3 === 0) {
		for (let index = 0; index < 4; index += 1) {
			confettiPieces.push({ x: random(width), y: random(-35, -5), speed: random(2, 5), drift: random(-1.4, 1.4), size: random(5, 10), angle: random(TWO_PI), spin: random(-0.08, 0.08), color: random([palette.green, palette.yellow, palette.coral, palette.blue, palette.lavender]) });
		}
	}
	confettiPieces = confettiPieces.filter((piece) => piece.y < height + 20);
	confettiPieces.forEach((piece) => {
		piece.y += piece.speed;
		piece.x += piece.drift;
		piece.angle += piece.spin;
		push();
		translate(piece.x, piece.y);
		rotate(piece.angle);
		fill(piece.color);
		noStroke();
		rectMode(CENTER);
		rect(0, 0, piece.size, piece.size * 0.6, 2);
		rectMode(CORNER);
		pop();
	});
}

// 接收滑鼠按下事件並開始拖曳選項。
function mousePressed() {
	return beginPointerAction(mouseX, mouseY);
}

// 接收觸控按下事件，讓手機也能拖曳選項。
function touchStarted() {
	return beginPointerAction(touchX, touchY);
}

// 開始拖曳選項，或在已交卷時重新開始測驗。
function beginPointerAction(x, y) {
	if (quizSubmitted) {
		if (isInside(x, y, getSubmitButtonBounds())) resetQuiz();
		return false;
	}
	for (let index = 0; index < choiceBounds.length; index += 1) {
		if (isInside(x, y, choiceBounds[index])) {
			draggingChoice = index;
			pointerPosition = { x, y };
			return false;
		}
	}
	return false;
}

// 接收滑鼠放開事件並完成配對或交卷。
function mouseReleased() {
	finishPointerAction(mouseX, mouseY);
	return false;
}

// 接收觸控放開事件並完成配對或交卷。
function touchEnded() {
	finishPointerAction(touchX, touchY);
	return false;
}

// 將放開的文字放進題目卡，並避免重複使用選項。
function finishPointerAction(x, y) {
	if (draggingChoice < 0) return;
	const releasedChoice = draggingChoice;
	draggingChoice = -1;
	const targetIndex = itemBounds.findIndex((box) => isInside(x, y, box));
	if (targetIndex >= 0) {
		placedChoices = placedChoices.map((choiceIndex) => choiceIndex === releasedChoice ? -1 : choiceIndex);
		placedChoices[targetIndex] = releasedChoice;
		return;
	}
	if (isInside(x, y, getSubmitButtonBounds()) && placedChoices.every((choiceIndex) => choiceIndex >= 0)) submitQuiz();
}

// 支援點擊交卷按鈕，讓觸控與滑鼠操作都直覺可用。
function mouseClicked() {
	if (!quizSubmitted && isInside(mouseX, mouseY, getSubmitButtonBounds()) && placedChoices.every((choiceIndex) => choiceIndex >= 0)) submitQuiz();
	return false;
}

// 依畫面大小計算交卷按鈕位置與點擊範圍。
function getSubmitButtonBounds() {
	const compact = width < 720;
	const margin = compact ? 18 : Math.min(42, width * 0.035);
	const bottom = choiceBounds[choiceBounds.length - 1].y + choiceBounds[choiceBounds.length - 1].h;
	const buttonWidth = compact ? Math.min(width - margin * 2, 260) : 220;
	const buttonHeight = compact ? 45 : 52;
	return { x: (width - buttonWidth) / 2, y: bottom + (compact ? 16 : 22), w: buttonWidth, h: buttonHeight };
}

// 判斷滑鼠或手指是否位於指定矩形內。
function isInside(x, y, box) {
	return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

// 計算成績並顯示答題結果。
function submitQuiz() {
	finalCorrectCount = placedChoices.reduce((count, choiceIndex, itemIndex) => count + (answerChoices[choiceIndex] === quizItems[itemIndex].answer ? 1 : 0), 0);
	finalScore = Math.round((finalCorrectCount / quizItems.length) * 100);
	quizSubmitted = true;
	if (finalScore > 80) launchConfetti();
}

// 在高分交卷時預先灑下一波彩帶。
function launchConfetti() {
	for (let index = 0; index < 90; index += 1) {
		confettiPieces.push({ x: random(width), y: random(-height * 0.65, height * 0.2), speed: random(2, 5), drift: random(-1.4, 1.4), size: random(5, 10), angle: random(TWO_PI), spin: random(-0.08, 0.08), color: random([palette.green, palette.yellow, palette.coral, palette.blue, palette.lavender]) });
	}
}

// 清空答案、成績與彩帶，重新開始測驗。
function resetQuiz() {
	placedChoices = Array(quizItems.length).fill(-1);
	quizSubmitted = false;
	finalCorrectCount = 0;
	finalScore = 0;
	confettiPieces = [];
}

// 視窗尺寸改變時重新建立全螢幕畫布。
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
