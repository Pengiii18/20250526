let video;
let handpose;
let predictions = [];
let currentGesture = null;
let lastPosition = [320, 240];

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].landmarks;

    // 手勢偵測與更新位置
    const gesture = detectGesture(keypoints);
    if (gesture) {
      currentGesture = gesture;

      if (currentGesture === 'scissors') {
        lastPosition = [keypoints[8][0], keypoints[8][1]]; // 食指尖端
      } else if (currentGesture === 'rock') {
        lastPosition = [keypoints[0][0], keypoints[0][1]]; // 手掌中心
      } else if (currentGesture === 'paper') {
        lastPosition = [keypoints[12][0], keypoints[12][1]]; // 中指尖端
      }
    }

    // 畫關鍵點（方便除錯）
    for (let i = 0; i < keypoints.length; i++) {
      const [x, y] = keypoints[i];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 5, 5);
    }

    // 圓圈
    const [x, y] = lastPosition;
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
  }
}

// 偵測手勢
function detectGesture(keypoints) {
  if (isScissors(keypoints)) {
    return "scissors";
  } else if (isRock(keypoints)) {
    return "rock";
  } else if (isPaper(keypoints)) {
    return "paper";
  }
  return null;
}

// 剪刀：食指和中指分開，其餘靠近手掌
function isScissors(keypoints) {
  const index = keypoints[8];
  const middle = keypoints[12];
  const ring = keypoints[16];
  const pinky = keypoints[20];
  const palm = keypoints[0];

  return (
    dist(index[0], index[1], middle[0], middle[1]) > 40 &&
    dist(ring[0], ring[1], palm[0], palm[1]) < 40 &&
    dist(pinky[0], pinky[1], palm[0], palm[1]) < 40
  );
}

// 石頭：所有指尖靠近手掌
function isRock(keypoints) {
  const palm = keypoints[0];
  return (
    dist(keypoints[8][0], keypoints[8][1], palm[0], palm[1]) < 40 &&
    dist(keypoints[12][0], keypoints[12][1], palm[0], palm[1]) < 40 &&
    dist(keypoints[16][0], keypoints[16][1], palm[0], palm[1]) < 40 &&
    dist(keypoints[20][0], keypoints[20][1], palm[0], palm[1]) < 40 &&
    dist(keypoints[4][0], keypoints[4][1], palm[0], palm[1]) < 40
  );
}

// 布：手指分開並展開
function isPaper(keypoints) {
  return (
    dist(keypoints[8][0], keypoints[8][1], keypoints[12][0], keypoints[12][1]) > 30 &&
    dist(keypoints[12][0], keypoints[12][1], keypoints[16][0], keypoints[16][1]) > 30 &&
    dist(keypoints[16][0], keypoints[16][1], keypoints[20][0], keypoints[20][1]) > 30 &&
    dist(keypoints[4][0], keypoints[4][1], keypoints[8][0], keypoints[8][1]) > 30
  );
}
