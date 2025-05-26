let video;
let facemesh;
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
    const gesture = detectGesture(); // 偵測手勢
    if (gesture) {
      currentGesture = gesture; // 更新當前手勢

      if (currentGesture === 'scissors') {
        // 剪刀：左耳（第234點）
        lastPosition = keypoints[234];
      } else if (currentGesture === 'rock') {
        // 石頭：右耳（第454點）
        lastPosition = keypoints[454];
      } else if (currentGesture === 'paper') {
        // 布：額頭（第10點）
        lastPosition = keypoints[10];
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
function detectGesture() {
  // 這裡可以加入手勢辨識邏輯，目前僅作為範例返回隨機手勢或 null
  const gestures = ['scissors', 'rock', 'paper', null];
  return random(gestures);
}
