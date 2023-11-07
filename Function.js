//랜덤값 찾기
function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// 계속 실행될 함수
function Update() {
  if (!isGameOver) {
    //moveEnemy(speed);

    if (onCollisionEnter(player, enemy)) {
      isGameOver = true;

      // 게임오버 화면 표시
      $("#gameOverScene").css("visibility", "visible");
    }
  }
}
// 60프레임짜리 게임
setInterval(Update, 1000 / 60);

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
  const bullet = $('<div class="bullet"></div>');
  const boom = $('<div class="boom"></div>');
  const playerPos = player.position();
  const playerWidth = player.width();
  const playerHeight = player.height();
  let bulletStartPosition = {
    left: playerPos.left + playerWidth / 2 - bullet.width() / 2,
    top: playerPos.top + playerHeight / 2 - bullet.height() / 2,
  };

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

//적이동
function moveEnemy(speed) {
  const enemyRight = pxToInt(enemy.css("Right"));

  if (enemyRight >= 420) {
    enemyReset();
  } else {
    enemy.css({ right: "+=" + speed + "px" });
  }
}
//적 위치 리셋
function enemyReset() {
  const randomBottom = getRandomValue(10, 60);
  enemy.css({
    right: "-50px",
    bottom: randomBottom + "px",
  });
  speed = getRandomValue(4, 7);
}

//점프
function jump() {
  if (jumpCnt >= 2) {
    return;
  } else {
    player.animate({ bottom: "+=120px" }, 600, "linear");
    jumpCnt++;
    player.animate({ bottom: "-=120px" }, 600, "linear");
  }
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

function gameReset() {
  isGameOver = false;
  jumpCnt = 0;
  speed = 3;

  player.css({ bottom: "10px" });
  enemy.css({ right: "-20px" });
  stage.css({ "background-color": "aqua" });

  // 게임오버 화면 없애기
  $("#gameOverScene").css({ visibility: "hidden" });
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

$(document).keydown(function (event) {
  console.log(event.key);

  switch (event.key) {
    case "d":
    case "ArrowRight":
      moveRight();
      break;
      d;
    case "a":
    case "ArrowLeft":
      moveLeft();
      break;
    case "w":
    case "ArrowUp":
      moveUp();
      break;
    case "s":
    case "ArrowDown":
      moveDown();
      break;
    default:
  }
});
