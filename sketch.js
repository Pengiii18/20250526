let video;
let facemesh;
let predictions = [];
let currentGesture = null; // 儲存當前手勢
let defaultPosition = [320, 240]; // 預設中間位置
let lastPosition = [320, 240]; // 儲存上一次圓的位置
let gestureBuffer = []; // 用於儲存最近的手勢
const bufferSize = 10; // 緩衝區大小

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });
}

function modelReady() {
  // 模型載入完成，可選擇顯示訊息
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢決定圓圈的位置
    const gesture = detectGesture(keypoints); // 傳入關鍵點進行手勢判斷
    if (gesture) {
      gestureBuffer.push(gesture);
      if (gestureBuffer.length > bufferSize) {
        gestureBuffer.shift(); // 保持緩衝區大小
      }

      // 如果緩衝區內的手勢一致，才更新 currentGesture
      if (gestureBuffer.every(g => g === gesture)) {
        currentGesture = gesture;
        if (currentGesture === 'scissors') {
          lastPosition = [keypoints[234][0], keypoints[234][1]]; // 左耳
        } else if (currentGesture === 'rock') {
          lastPosition = [keypoints[454][0], keypoints[454][1]]; // 右耳
        } else if (currentGesture === 'paper') {
          lastPosition = [keypoints[10][0], keypoints[10][1]]; // 額頭
        }
      }
    }

    // 調試訊息：輸出緩衝區內容和當前手勢
    console.log('Gesture Buffer:', gestureBuffer);
    console.log('Current Gesture:', currentGesture);

    // 如果沒有偵測到手勢，保持圓在上一次的位置
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
