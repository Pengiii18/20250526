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
          lastPosition = keypoints[234]; // 左耳
        } else if (currentGesture === 'rock') {
          lastPosition = keypoints[454]; // 右耳
        } else if (currentGesture === 'paper') {
          lastPosition = keypoints[10]; // 額頭
        }
      }
    }

    const [x, y] = lastPosition; // 使用上一次的位置
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }
}

// 偵測手勢的函式
function detectGesture(keypoints) {
  // 假設我們可以根據手的關鍵點來判斷手勢
  // 以下為簡單的邏輯範例，需根據實際需求調整
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
  // TODO: 根據手部關鍵點的相對位置判斷是否為剪刀
  return false; // 範例邏輯，需實現
}

// 判斷是否為石頭
function isRock(keypoints) {
  // TODO: 根據手部關鍵點的相對位置判斷是否為石頭
  return false; // 範例邏輯，需實現
}

// 判斷是否為布
function isPaper(keypoints) {
  // TODO: 根據手部關鍵點的相對位置判斷是否為布
  return false; // 範例邏輯，需實現
}
