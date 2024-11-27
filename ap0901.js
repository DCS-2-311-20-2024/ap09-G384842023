//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G38484-2023 堀部楓真
//
"use strict"; // 厳格モード

import * as THREE from 'three';
import GUI from 'ili-gui';
import { MeshPhongMaterial } from 'three';

// ３Ｄページ作成関数の定義
function init() {
  const param = {
    fov: 60,
    x: 0,
    y: 25,
    z: 0,
    nRow: 6,
    nCol: 9,
    axes: false,
  };

  const scene = new THREE.Scene();
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  let nDot = 0;
  let score = 0;
  let life = 3;

  function setScore(score) {
    document.getElementById("score").innerText =
      String(Math.round(score)).padStart(8, "0");
    document.getElementById("life").innerText =
      life > 0 ? "○○○".substring(0, life) : "--Game Over --";
  }

  const nSeg = 24;
  const ballR = 0.5;
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(ballR, nSeg, nSeg),
    new THREE.MeshPhongMaterial({ color: 0xFFFF00, shininess: 100, specular: 0xa0a0a0 })
  );
  ball.geometry.computeBoundingSphere();
  scene.add(ball);

  const keyState = { w: false, a: false, s: false, d: false };
  let vx = 0, vz = 0;

  function updateBallDirection() {
    vx = 0;
    vz = 0;
  
    // 移動方向を優先順位で判定
    if (keyState.w) {
      vz = -1; // 前進
    } else if (keyState.s) {
      vz = 1;  // 後退
    } else if (keyState.a) {
      vx = -1; // 左
    } else if (keyState.d) {
      vx = 1;  // 右
    }
  }
  

  function moveBall(delta) {
    if (ballLive) {
      const velocity = new THREE.Vector3(vx, 0, vz).multiplyScalar(speed * delta);
      ball.position.add(velocity);
    } else {
      ball.position.x = 0;
      ball.position.z = 0;
    }
  }

  let ballLive = false;
  let speed = 0;

  function stopBall() {
    speed = 0;
    ballLive = false;
    life--;
  }

  function startBall() {
    if (life <= 0) {
      life = 3;
      score = 0;
      resetBrick();
    }
    ballLive = true;
    speed = 10;
  }

  window.addEventListener("mousedown", () => {
    if (!ballLive) {
      startBall();
    }
  });

  window.addEventListener("keydown", (event) => {
    switch (event.key.toLowerCase()) {
      case "w": keyState.w = true; break;
      case "a": keyState.a = true; break;
      case "s": keyState.s = true; break;
      case "d": keyState.d = true; break;
    }
    updateBallDirection();
  });

  window.addEventListener("keyup", (event) => {
    switch (event.key.toLowerCase()) {
      case "w": keyState.w = false; break;
      case "a": keyState.a = false; break;
      case "s": keyState.s = false; break;
      case "d": keyState.d = false; break;
    }
    updateBallDirection();
  });


  // 外枠 ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  // 枠の作成
  //   大きさの定義
  const hFrameW = 20;  const hFrameH = 2;  const hFrameD = 1;
  const vFrameW = 1;  const vFrameH = 1.2;  const vFrameD = 30;
  {
    //   上の枠
    const tFrame = new THREE.Mesh(
      new THREE.BoxGeometry(vFrameD, vFrameH, vFrameW),
      new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    tFrame.position.z = -(hFrameW - vFrameW) / 2;//-(vFrameD + hFrameD) / 2;
    scene.add(tFrame);
    //   下の枠
    const bFrame = tFrame.clone();
    bFrame.position.z = (hFrameW - vFrameW) / 2;//(vFrameD + hFrameD) / 2;
    scene.add(bFrame);
    //   左の枠
    const lFrame = new THREE.Mesh(
      new THREE.BoxGeometry(hFrameD, hFrameH, hFrameW),
      new MeshPhongMaterial({ color: 0xB3B3B3 })
    );
    lFrame.position.x = -(vFrameD + hFrameD) / 2;//-(hFrameW - vFrameW) / 2;
    scene.add(lFrame); 

    //   右の枠
    const rFrame = lFrame.clone();
    rFrame.position.x = (vFrameD + hFrameD) / 2;//(hFrameW - vFrameW) / 2;
    scene.add(rFrame); 

  }

  // 壁で止まる処理
  const hLimit = vFrameD / 2;//hFrameW / 2 - vFrameW;
  const vLimit = hFrameW / 2 - vFrameW;
  function frameCheck() {
    // 右の壁
    if (ball.position.x > hLimit) {
      ball.position.x = hLimit - ballR; // 壁の内側に位置を戻す
      vx = 0; // x方向の速度を停止
    }
    // 左の壁
    if (ball.position.x < -hLimit) {
      ball.position.x = -hLimit + ballR;
      vx = 0;
    }
    // 上の壁
    if (ball.position.z < -vLimit) {
      ball.position.z = -vLimit +ballR;
      vz = 0; // z方向の速度を停止
    }
    // 下の壁
    if (ball.position.z > vLimit) {
      ball.position.z = vLimit - ballR;
      vz = 0;
    }
  }

  //壁-------------------
  // ボックスのサイズと位置を定義
  const boxSize = 1;  // ボックスのサイズ（高さは1で固定）
  const mazeLayout = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
  ];  
  
  

  const maze = new THREE.Group();  // 迷路をまとめるグループ

  // 迷路を作成する関数
  function createMaze() {
    for (let r = 0; r < mazeLayout.length; r++) {
      for (let c = 0; c < mazeLayout[r].length; c++) {
        if (mazeLayout[r][c] === 1) {  // 障害物（1の部分）
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(boxSize, 0.25, boxSize), // 幅、高さ、奥行き
            new THREE.MeshLambertMaterial({ color: 0x555555 })
          );
          box.position.set(c * boxSize - boxSize * mazeLayout[r].length / 2, 0.5, r * boxSize - boxSize * mazeLayout.length / 2);
          maze.add(box);  // 迷路のグループに追加
        }
      }
    }
    scene.add(maze);  // シーンに迷路を追加
  }
  
  // 迷路を作成
  createMaze();

  //壁との衝突
  // 衝突判定と反射処理
function boxCheck() {
  const ballSphere = ball.geometry.boundingSphere.clone();
  ballSphere.translate(ball.position); // ボールの現在位置を反映

  maze.children.forEach((box) => {
    // ボックスのバウンディングボックスを取得
    const boxBound = new THREE.Box3().setFromObject(box);

    // 衝突判定
    if (boxBound.intersectsSphere(ballSphere)) {
      // ボールがボックスに衝突したら、移動を止める
      vx = 0; // x方向の速度を停止
      vz = 0; // z方向の速度を停止

      // 衝突後にボールが壁の内側に入り込まないように、位置を修正
      const ballPos = ball.position;
      const boxCenter = boxBound.getCenter(new THREE.Vector3());
      const boxSize = boxBound.getSize(new THREE.Vector3());

      // 衝突方向に応じてボールの位置を調整
      if (Math.abs(ballPos.x - boxCenter.x) > boxSize.x / 2) {
        // 横方向の衝突
        ball.position.x = ballPos.x > boxCenter.x
          ? boxBound.max.x + ballR
          : boxBound.min.x - ballR;
      }
      if (Math.abs(ballPos.z - boxCenter.z) > boxSize.z / 2) {
        // 縦方向の衝突
        ball.position.z = ballPos.z > boxCenter.z
          ? boxBound.max.z + ballR
          : boxBound.min.z - ballR;
      }
    }
  });
}

  

  // ドット ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
// 点の生成
const dots = new THREE.Group();

// 枠の中心位置（枠がそのままシーン内で配置されている位置）
const frameCenterX = 0;
const frameCenterZ = 0;

function makeDots() {
  const radius = 0.15;  // 球体の半径
  const nSeg = 16;  // 球体の分割数
  const gapX = 1;  // 横方向の隙間
  const gapZ = 1;  // 縦方向の隙間

  // ボールの初期位置
  const ballX = ball.position.x;
  const ballZ = ball.position.z;

  // 点を並べる
  for (let r = -8; r < 9; r++) {
    for (let c = -14; c < 15; c++) {
      const x = gapX * c;  // 点のx座標
      const z = gapZ * r;  // 点のz座標

      
        // ボールとドットが重ならないように確認
        if (!(x == ballX && z == ballZ)) {
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(radius, nSeg, nSeg),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
          );
          dot.position.set(x, 0, z);
          dot.geometry.computeBoundingSphere();
          dot.geometry.computeBoundingBox();  // バウンディングボックスを計算
          dots.add(dot); // グループに追加
        }
      
    }
  }
  scene.add(dots); // シーンに追加
}



makeDots(); // 初回のみ呼び出してドットを生成

// 点の衝突検出
function dotCheck() {
  let hit = false;
  const sphere = ball.geometry.boundingSphere.clone();
  sphere.translate(ball.position); // ボールの位置にバウンディングスフィアを合わせる
  
  // ドットを順番にチェック
  dots.children.forEach((dot) => {
    if (!hit && dot.visible) {
      const dotSphere = dot.geometry.boundingSphere.clone(); // ドットのバウンディングスフィア
      dotSphere.translate(dot.position); // ドットの位置にバウンディングスフィアを合わせる

      // 衝突判定：ボールのバウンディングスフィアとドットのバウンディングスフィアが交差する場合
      if (sphere.intersectsSphere(dotSphere)) {
        hit = true;
        dot.visible = false; // 点が消える
        score += 100; // スコア加算（適宜変更）
        
      }
    }
  });
}




// 点の再表示
function resetDots() {
  nDot = 0;
  dots.children.forEach((dot) => {
    dot.visible = true;
    nDot++;
  });
}



  // 光源の設定
  const light = new THREE.SpotLight(0xffffff, 1000);
  light.position.set(0, 15, -10);
  scene.add(light);

  // カメラの設定
  const camera = new THREE.PerspectiveCamera(
    param.fov, window.innerWidth / window.innerHeight, 0.1, 1000);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x305070);
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // 描画更新
  const clock = new THREE.Clock(); // 時間の管理
  function render(time) {
    // カメラの再設定
    camera.fov = param.fov;
    camera.position.x = param.x;
    camera.position.y = param.y;
    camera.position.z = param.z;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // 座標軸の表示
    axes.visible = param.axes;
    // ゲーム画面の更新
    let delta = clock.getDelta(); // 経過時間の取得
    frameCheck(); // 枠の衝突判定
    dotCheck(); // ブロックの衝突判定
    boxCheck
    moveBall(delta); // ボールの移動
    setScore(score); // スコア更新
    // 再描画
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  // GUIコントローラ
  const gui = new GUI();
  gui.add(param, "fov", 10, 100);
  gui.add(param, "x", -40, 80);
  gui.add(param, "y", -40, 80);
  gui.add(param, "z", -40, 80);
  gui.add(param, "axes");
  gui.close();
  // 描画
  render();
}

// 3Dページ作成関数の呼び出し
init();
