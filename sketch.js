let video;
let handpose;
let predictions = [];
let currentGesture = null; // 儲存當前手勢
let defaultPosition = [320, 240]; // 預設中間位置
let lastPosition = [320, 240]; // 儲存上一次圓的位置

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady); // 使用 handpose 模型
  handpose.on('predict', results => {
    predictions = results;
  });
}

function modelReady() {
  console.log('Handpose model loaded');
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].landmarks; // 使用 handpose 的 landmarks

    // 視覺化手部關鍵點
    for (let i = 0; i < keypoints.length; i++) {
      const [x, y, z] = keypoints[i];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 5, 5);
    }

    // 根據手勢決定圓圈的位置
    const gesture = detectGesture(keypoints); // 傳入關鍵點進行手勢判斷
    if (gesture) {
      currentGesture = gesture; // 立即更新當前手勢
      if (currentGesture === 'scissors') {
        lastPosition = [keypoints[8][0], keypoints[8][1]]; // 食指尖端
      } else if (currentGesture === 'rock') {
        lastPosition = [keypoints[0][0], keypoints[0][1]]; // 手掌基部
      } else if (currentGesture === 'paper') {
        lastPosition = [keypoints[12][0], keypoints[12][1]]; // 中指尖端
      }
    }

    // 調試訊息：輸出當前手勢和圓的位置
    console.log('Current Gesture:', currentGesture);
    console.log('Drawing Circle at:', lastPosition);

    // 繪製圓圈
    const [x, y] = lastPosition;
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }
}

// 偵測手勢的函式
function detectGesture(keypoints) {
  // 假設我們可以根據手的關鍵點來判斷手勢
  if (isScissors(keypoints)) {
    return 'scissors';
  } else if (isRock(keypoints)) {
    return 'rock';
  } else if (isPaper(keypoints)) {
    return 'paper';
  }
  return null;
}

// 判斷是否為剪刀
function isScissors(keypoints) {
  // 假設剪刀手勢：食指和中指分開，其餘手指收攏
  const indexFinger = keypoints[8]; // 食指尖端
  const middleFinger = keypoints[12]; // 中指尖端
  const ringFinger = keypoints[16]; // 無名指尖端
  const pinkyFinger = keypoints[20]; // 小指尖端
  const thumb = keypoints[4]; // 拇指尖端

  const distanceIndexMiddle = dist(indexFinger[0], indexFinger[1], middleFinger[0], middleFinger[1]);
  const distanceRingPinky = dist(ringFinger[0], ringFinger[1], pinkyFinger[0], pinkyFinger[1]);
  const distanceThumbIndex = dist(thumb[0], thumb[1], indexFinger[0], indexFinger[1]);

  return distanceIndexMiddle > 50 && distanceRingPinky < 30 && distanceThumbIndex < 30;
}

// 判斷是否為石頭
function isRock(keypoints) {
  // 假設石頭手勢：所有手指收攏
  const indexFinger = keypoints[8];
  const middleFinger = keypoints[12];
  const ringFinger = keypoints[16];
  const pinkyFinger = keypoints[20];
  const thumb = keypoints[4];

  const palmBase = keypoints[0]; // 手掌基部

  return (
    dist(indexFinger[0], indexFinger[1], palmBase[0], palmBase[1]) < 30 &&
    dist(middleFinger[0], middleFinger[1], palmBase[0], palmBase[1]) < 30 &&
    dist(ringFinger[0], ringFinger[1], palmBase[0], palmBase[1]) < 30 &&
    dist(pinkyFinger[0], pinkyFinger[1], palmBase[0], palmBase[1]) < 30 &&
    dist(thumb[0], thumb[1], palmBase[0], palmBase[1]) < 30
  );
}

// 判斷是否為布
function isPaper(keypoints) {
  // 假設布手勢：所有手指伸直且分開
  const indexFinger = keypoints[8];
  const middleFinger = keypoints[12];
  const ringFinger = keypoints[16];
  const pinkyFinger = keypoints[20];
  const thumb = keypoints[4];

  const distanceIndexMiddle = dist(indexFinger[0], indexFinger[1], middleFinger[0], middleFinger[1]);
  const distanceMiddleRing = dist(middleFinger[0], middleFinger[1], ringFinger[0], ringFinger[1]);
  const distanceRingPinky = dist(ringFinger[0], ringFinger[1], pinkyFinger[0], pinkyFinger[1]);
  const distanceThumbIndex = dist(thumb[0], thumb[1], indexFinger[0], indexFinger[1]);

  return (
    distanceIndexMiddle > 50 &&
    distanceMiddleRing > 50 &&
    distanceRingPinky > 50 &&
    distanceThumbIndex > 50
  );
}
