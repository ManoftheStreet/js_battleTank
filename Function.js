document.addEventListener("DOMContentLoaded", function () {
  var introMusic = document.getElementById("introMusic"); // 오디오 요소를 가져옵니다.
  var stage = document.getElementById("stage"); // stage 요소를 가져옵니다.
  var startButton = document.getElementById("startButton"); // 시작 버튼 요소를 가져옵니다.

  // 초기에는 시작 버튼을 비활성화합니다.
  startButton.disabled = true;

  // 음악을 재생하고 버튼을 활성화하는 함수를 정의합니다.
  function playMusicAndShowButton() {
    introMusic.play();
    $("#startButton").animate({ opacity: 1 }, 7000); // 2초 동안 opacity를 0에서 1로 변경
    startButton.disabled = false;
    // 이벤트 리스너를 제거합니다.
    stage.removeEventListener("click", playMusicAndShowButton);
  }

  // stage에 클릭 이벤트 리스너를 추가합니다.
  stage.addEventListener("click", playMusicAndShowButton);
});

var gameInterval;
var spawnEnemyInterval;
var enemyDirectionInterval;
let turnTime = 5000;
let spawnTime = 2000;
let isGameOver = false;
//#sound

//랜덤값 찾기
function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function startGame() {
  var introMusic = document.getElementById("introMusic");
  if (introMusic) {
    introMusic.pause();
    introMusic.currentTime = 0;
  }

  $("#introScene").hide();
  var ingameMusic = document.getElementById("ingameMusic");
  if (ingameMusic) {
    ingameMusic.play();
  }
  if (gameInterval) {
    clearInterval(gameInterval);
  }

  gameInterval = setInterval(Update, 1000 / 60);
  spawnEnemyInterval = setInterval(spawnEnemy, spawnTime);
  enemyDirectionInterval = setInterval(function () {
    $(".enemy").each(function () {
      setNewDirection($(this));
    });
  }, turnTime);

  if ($("#player").length === 0) {
    var playerImg = $("<img>")
      .attr({
        id: "player",
        src: "00.IMG/Tank.png", // 경로는 프로젝트 설정에 맞게 조정하세요
        alt: "Player Tank",
      })
      .css({
        position: "absolute",
        bottom: "400px", // 초기 위치 Y
        left: "400px", // 초기 위치 X
        width: "60px", // 이미지의 크기 (선택사항)
        // 여기에 더 많은 스타일을 추가할 수 있습니다.
      });

    // 생성한 플레이어 이미지를 스테이지에 추가합니다.
    $("#stage").append(playerImg);

    // 이제 player 변수를 새로 생성된 이미지로 업데이트합니다.
    player = $("#player");
  }
}

// 계속 실행될 함수
function Update() {
  if (!isGameOver) {
    // 모든 적들을 순회하며 플레이어와의 충돌과 플레이어 총알과의 충돌을 체크합니다.
    $(".enemy").each(function () {
      var enemy = $(this);

      // 플레이어와 적의 충돌 검사
      if (player && onCollisionEnter(player, enemy)) {
        player.remove();
        player = null;
        gameOver();
        var boomSound = document.getElementById("boomSound");
        if (boomSound) {
          boomSound.play(); // 오디오를 재생합니다.
        }
        createExplosion(player.position().left, player.position().top);

        return false; // 충돌이 발생하면 더 이상의 검사가 불필요하므로 반복을 중단합니다.
      }

      // 플레이어 총알과 적의 충돌 검사
      $(".bullet").each(function () {
        var bullet = $(this);

        if (onCollisionEnter(bullet, enemy)) {
          createExplosion(enemy.position().left, enemy.position().top);
          enemy.remove(); // 적 제거
          bullet.remove(); // 총알 제거
          enmyCnt--;
          var boomSound = document.getElementById("boomSound");
          if (boomSound) {
            boomSound.play(); // 오디오를 재생합니다.
          }
          //updateScore(); // 점수 업데이트
          return false; // 적과 충돌한 총알은 더 이상의 검사가 불필요하므로 반복을 중단합니다.
        }
      });
    });
  }
}

function gameOver() {
  var ingameMusic = document.getElementById("ingameMusic");
  if (ingameMusic) {
    ingameMusic.pause();
    ingameMusic.currentTime = 0;
  }
  var endMusic = document.getElementById("endMusic");
  if (endMusic) {
    endMusic.play();
  }
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(spawnEnemyInterval);
  clearInterval(enemyDirectionInterval);
  // 게임오버 화면 표시
  $("#gameOverScene").css("visibility", "visible");
}

function gameReset() {
  isGameOver = false;
  $(".enemy").remove();
  $(".bullet").remove();

  // 게임오버 화면 없애기
  $("#gameOverScene").css({ visibility: "hidden" });
  $("#introScene").show();

  var introMusic = document.getElementById("introMusic");
  if (introMusic) {
    introMusic.play();
  }
}

//플레이어 이동
function moveRight() {
  const playerRight = parseInt(player.css("right"), 10);
  playerDirection = "right";
  player.css("transform", "rotate(90deg)");
  if (playerRight <= 10) {
    return;
  }

  player.css({ left: "+=" + playerSpeed + "px" });
}

function moveLeft() {
  const playerLeft = parseInt(player.css("left"), 10);
  playerDirection = "left";
  player.css("transform", "rotate(-90deg)");
  if (playerLeft <= 10) {
    return;
  }

  player.css({ left: "-=" + playerSpeed + "px" });
}

function moveUp() {
  const playerTop = parseInt(player.css("top"), 10);
  playerDirection = "up";
  player.css("transform", "rotate(0deg)");
  if (playerTop <= 10) {
    return;
  }

  player.css({ top: "-=" + playerSpeed + "px" });
}

function moveDown() {
  const playerTop = parseInt(player.css("top"), 10);
  playerDirection = "down";
  player.css("transform", "rotate(180deg)");
  if (playerTop <= 720) {
    player.css({ top: "+=" + playerSpeed + "px" });
  }
}

//총알 발사
function spawnBullet() {
  const currentTime = Date.now();
  if (currentTime - lastBulletTime < fireRate) {
    return; // 1초가 지나지 않았다면 새 총알을 발사하지 않고 함수를 종료합니다.
  }
  var shootSound = document.getElementById("shootSound");
  if (shootSound) {
    shootSound.currentTime = 0; // 재생 위치를 시작으로 재설정합니다.
    shootSound.play(); // 오디오를 재생합니다.
  }
  const bullet = $('<div class="bullet"></div>');
  const boom = $('<div class="boom"></div>');
  const playerPos = player.position();

  const playerWidth = player.width();
  const playerHeight = player.height();

  // 탱크의 중앙에서 발사되도록 조정
  bullet.css({
    left: playerPos.left + playerWidth / 4 - 4, // bullet의 절반 너비를 고려하여 중앙에서 시작
    top: playerPos.top + playerWidth / 2 - 5, // bullet의 절반 높이를 고려하여 중앙에서 시작
    transform: `rotate(${
      playerDirection === "up"
        ? "-90deg"
        : playerDirection === "right"
        ? "0deg"
        : playerDirection === "down"
        ? "90deg"
        : "180deg"
    })`,
  });

  stage.append(bullet);

  // bullet이 이동할 방향 설정
  let bulletVelocity = {
    left: 0,
    top: 0,
  };

  switch (playerDirection) {
    case "up":
      bullet.css({
        left: playerPos.left + playerWidth / 2 - bullet.width() / 2,
        top: playerPos.top - bullet.height(), // 이 부분이 탱크의 상단 방향으로 총알을 조금 더 올립니다.
        transform: "rotate(-90deg)", // 이 방향을 맞춥니다.
      });
      bulletVelocity.top = -bulletSpeed;
      break;
    case "right":
      bullet.css({
        left: playerPos.left + playerWidth,
        top: playerPos.top + playerHeight / 2 - 6,
      });
      bulletVelocity.left = bulletSpeed;
      break;
    case "down":
      bullet.css({
        left: playerPos.left + playerWidth / 2 - bullet.width() / 2,
        top: playerPos.top + playerHeight,
        transform: "rotate(90deg)",
      });
      bulletVelocity.top = bulletSpeed;
      break;
    case "left":
      bullet.css({
        left: playerPos.left - bullet.width(),
        top: playerPos.top + playerHeight / 2 - 6,
        transform: "rotate(180deg)",
      });
      bulletVelocity.left = -bulletSpeed;
      break;
  }
  lastBulletTime = currentTime;

  // bullet 이동 시작
  function moveBullet() {
    // stage의 크기를 넘어가면 삭제
    if (
      bullet.position().top < 0 ||
      bullet.position().left < 0 ||
      bullet.position().top > 780 ||
      bullet.position().left > 780
    ) {
      boom.css({
        left: bullet.position().left - 32, // 폭발 이미지가 bullet 중앙에 위치하도록 조정
        top: bullet.position().top - 32, // 폭발 이미지가 bullet 중앙에 위치하도록 조정
      });

      stage.append(boom);

      bullet.remove();

      setTimeout(function () {
        boom.remove();
      }, 600); // 폭발 GIF 애니메이션 지속 시간
      return;
    }

    bullet.css({
      left: "+=" + bulletVelocity.left,
      top: "+=" + bulletVelocity.top,
    });

    // 50ms 후에 다시 bullet 위치 업데이트
    setTimeout(moveBullet, 30);
  }

  moveBullet();
}

// 픽셀 String을 숫자로 변환 : '100px' -> 100
function pxToInt(pxStr) {
  return parseInt(pxStr, 10);
}

function onCollisionEnter(rect1, rect2) {
  // 첫 번째 사각형의 위치와 크기 정보 가져오기
  const rect1Left = rect1.offset().left;
  const rect1Top = rect1.offset().top;
  const rect1Right = rect1Left + rect1.width();
  const rect1Bottom = rect1Top + rect1.height();

  // 두 번째 사각형의 위치와 크기 정보 가져오기
  const rect2Left = rect2.offset().left;
  const rect2Top = rect2.offset().top;
  const rect2Right = rect2Left + rect2.width();
  const rect2Bottom = rect2Top + rect2.height();

  // 충돌 검사
  if (
    rect1Right >= rect2Left &&
    rect1Left <= rect2Right &&
    rect1Bottom >= rect2Top &&
    rect1Top <= rect2Bottom
  ) {
    return true; // 충돌
  }

  return false; // 충돌하지 않음
}

$(document).keydown(function (event) {
  switch (event.key) {
    case " ":
      spawnBullet();
      break;
    default:
  }
  $(document).on("keydown", function (e) {
    if (e.key === "Enter" && isGameOver) {
      // Enter 키와 게임 오버 상태를 확인합니다.
      gameReset(); // 게임 리셋 함수를 호출합니다.
    }
  });
});

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setNewDirection(enemy) {
  // 0 = 상, 1 = 우, 2 = 하, 3 = 좌
  const direction = getRandomValue(0, 3);
  enemy.data("direction", direction);
}

function moveEnemy(enemy) {
  const stepSize = 40; // 한 번에 이동할 픽셀 크기
  const moveTime = 500;
  // 방향을 유지하는 시간 (ms)
  let posX = parseInt(enemy.css("left"));
  let posY = parseInt(enemy.css("top"));

  // 이동 로직을 여기에 추가하세요 (아래는 예시 로직입니다)
  switch (enemy.data("direction")) {
    case 0: // 상
      posY -= stepSize;
      enemy.css("transform", "rotate(0deg)");
      break;
    case 1: // 우
      posX += stepSize;
      enemy.css("transform", "rotate(90deg)");
      break;
    case 2: // 하
      posY += stepSize;
      enemy.css("transform", "rotate(180deg)");
      break;
    case 3: // 좌
      posX -= stepSize;
      enemy.css("transform", "rotate(-90deg)");
      break;
  }

  // stage의 범위 내에서만 이동하도록 합니다
  if (
    posX < 0 ||
    posY < 0 ||
    posX > stage.width() - enemy.width() ||
    posY > stage.height() - enemy.height()
  ) {
    setNewDirection(enemy); // 벽에 부딪히면 새 방향 설정
  } else {
    enemy.css({ top: posY, left: posX }); // 새 위치 설정
  }

  // 일정 시간 후에 방향 재설정
  setTimeout(function () {
    moveEnemy(enemy);
  }, moveTime);
}

// 적 탱크를 생성하고 무작위로 위치를 지정하는 함수
function spawnEnemy() {
  if (enmyCnt >= enemyMax) {
    // 이미 5마리의 적이 활성화되어 있으면 새로운 적을 생성하지 않음
    return;
  }
  const enemy = $('<img src="00.IMG/Tank.png" class="enemy">');

  // 4모서리 중 하나를 랜덤으로 선택하여 적을 배치합니다.
  const corner = getRandomValue(1, 4);
  let position = {};

  switch (corner) {
    case 1: // 왼쪽 위
      position = { top: "0px", left: "0px" };
      break;
    case 2: // 오른쪽 위
      position = { top: "0px", right: "0px" };
      break;
    case 3: // 왼쪽 아래
      position = { bottom: "0px", left: "0px" };
      break;
    case 4: // 오른쪽 아래
      position = { bottom: "0px", right: "0px" };
      break;
  }
  setNewDirection(enemy);
  enemy.css(position);
  stage.append(enemy);
  enmyCnt++;
  moveEnemy(enemy);
  setRandomFiring(enemy);
}

//적 공격
function fireBullet(enemy) {
  const enemyBullet = $('<div class="enemyBullet"></div>');
  const boom = $('<div class="boom"></div>');
  const enemyPos = enemy.position();

  const enemyWidth = enemy.width();
  const enemyHeight = enemy.height();
  const direction = enemy.data("direction");

  // 탱크의 중앙에서 발사되도록 조정
  enemyBullet.css({
    left: enemyPos.left + enemyWidth / 4 - 4, // bullet의 절반 너비를 고려하여 중앙에서 시작
    top: enemyPos.top + enemyWidth / 2 - 5, // bullet의 절반 높이를 고려하여 중앙에서 시작
    transform: `rotate(${
      direction === 0
        ? "-90deg"
        : direction === 1
        ? "0deg"
        : direction === 2
        ? "90deg"
        : "180deg"
    })`,
  });

  stage.append(enemyBullet);

  let bulletVelocity = {
    left: 0,
    top: 0,
  };

  switch (direction) {
    case 0:
      enemyBullet.css({
        left: enemyPos.left + enemyWidth / 2 - enemyBullet.width() / 2,
        top: enemyPos.top - enemyBullet.height(), // 이 부분이 탱크의 상단 방향으로 총알을 조금 더 올립니다.
        transform: "rotate(-90deg)", // 이 방향을 맞춥니다.
      });
      bulletVelocity.top = -bulletSpeed;
      break;
    case 1:
      enemyBullet.css({
        left: enemyPos.left + enemyWidth,
        top: enemyPos.top + enemyHeight / 2 - 6,
      });
      bulletVelocity.left = bulletSpeed;
      break;
    case 2:
      enemyBullet.css({
        left: enemyPos.left + enemyWidth / 2 - enemyBullet.width() / 2,
        top: enemyPos.top + enemyHeight,
        transform: "rotate(90deg)",
      });
      bulletVelocity.top = bulletSpeed;
      break;
    case 3:
      enemyBullet.css({
        left: enemyPos.left - enemyBullet.width(),
        top: enemyPos.top + enemyHeight / 2 - 6,
        transform: "rotate(180deg)",
      });
      bulletVelocity.left = -bulletSpeed;
      break;
  }

  function moveBullet() {
    if (player && onCollisionEnter(player, enemyBullet)) {
      createExplosion(enemyBullet.position().left, enemyBullet.position().top);
      var boomSound = document.getElementById("boomSound");
      if (boomSound) {
        boomSound.play(); // 오디오를 재생합니다.
      }
      enemyBullet.remove(); // 충돌한 총알 제거
      player.remove();
      player = null;
      gameOver();
      return; // 추가 이동을 중단
    }
    // stage의 크기를 넘어가면 삭제
    if (
      enemyBullet.position().top < 0 ||
      enemyBullet.position().left < 0 ||
      enemyBullet.position().top > 780 ||
      enemyBullet.position().left > 780
    ) {
      createExplosion(enemyBullet.position().left, enemyBullet.position().top);

      enemyBullet.remove();

      setTimeout(function () {
        boom.remove();
      }, 600); // 폭발 GIF 애니메이션 지속 시간
      return;
    }

    enemyBullet.css({
      left: "+=" + bulletVelocity.left,
      top: "+=" + bulletVelocity.top,
    });

    // 50ms 후에 다시 bullet 위치 업데이트
    setTimeout(moveBullet, 30);
  }

  moveBullet();
}
function createExplosion(x, y) {
  const boom = $('<div class="boom"></div>').css({
    left: x - 32, // 폭발 이미지가 bullet 중앙에 위치하도록 조정
    top: y - 32, // 폭발 이미지가 bullet 중앙에 위치하도록 조정
  });

  stage.append(boom);

  setTimeout(function () {
    boom.remove();
  }, 600); // 폭발 GIF 애니메이션 지속 시간
}

function setRandomFiring(enemy) {
  const minFireDelay = 1500;
  const maxFireDelay = 3000;
  setTimeout(function () {
    if (stage.has(enemy).length) {
      fireBullet(enemy);
      setRandomFiring(enemy); // 다음 포탄 발사를 위한 랜덤 시간 설정
    }
  }, getRandomValue(minFireDelay, maxFireDelay));
}
