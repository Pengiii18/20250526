let video;
let facemesh;
let predictions = [];

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
    let x, y;
    const gesture = detectGesture(); // 偵測手勢
    if (gesture === 'scissors') {
      // 剪刀：左耳（第234點）
      [x, y] = keypoints[234];
    } else if (gesture === 'rock') {
      // 石頭：右耳（第454點）
      [x, y] = keypoints[454];
    } else if (gesture === 'paper') {
      // 布：額頭（第10點）
      [x, y] = keypoints[10];
    } else {
      // 預設：第94點
      [x, y] = keypoints[94];
    }

    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }
}

// 偵測手勢的函式
function detectGesture() {
  // 這裡可以加入手勢辨識邏輯，目前僅作為範例返回隨機手勢
  const gestures = ['scissors', 'rock', 'paper'];
  return random(gestures);
}
