function fireBullet(enemy) {
  const bulletSpeed = 7; // 포탄의 속도 (픽셀/초)
  const bullet = $('<div class="enemyBullet"></div>');

  // 적의 현재 위치를 기반으로 포탄 위치 설정
  let posX = parseInt(enemy.css("left")) + enemy.width() / 2;
  let posY = parseInt(enemy.css("top")) + enemy.height() / 2;
  //bullet.css({ top: posY, left: posX });

  // 포탄이 전진할 방향 설정 (적의 현재 방향에 기반함)
  const direction = enemy.data("direction");
  let moveX = 0;
  let moveY = 0;
  // 적의 중앙에서 bullet의 너비/2를 빼서 bullet이 적 중앙에서 나오도록 수정
  let bulletWidth = bullet.width(); // bullet의 너비
  let enemyWidthHalf = enemy.width() / 2; // 적 탱크의 너비의 반
  let enemyHeightHalf = enemy.height() / 2; // 적 탱크의 높이의 반
  let bulletHeightHalf = bullet.height() / 2; // bullet의 높이의 반

  switch (direction) {
    case 0: // 상
      bullet.css({
        left: posX - bullet.width() / 2, // 적 가로 중앙에서 발사
        top: posY - bullet.height(), // 적 상단 바로 위에서 발사
        transform: "rotate(-90deg)",
      });
      moveY = -bulletSpeed;
      break;
    case 1: // 우
      bullet.css({
        left: posX + enemyWidthHalf - bulletWidth / 2,
        top: posY - bulletHeightHalf,
      });
      moveX = bulletSpeed;
      break;
    case 2: // 하
      bullet.css({
        left: posX - bulletWidth / 2,
        top: posY + enemyHeightHalf - bulletHeightHalf,
        transform: "rotate(90deg)",
      });
      moveY = bulletSpeed;
      break;
    case 3: // 좌
      bullet.css({
        left: posX - enemyWidthHalf - bulletWidth / 2,
        top: posY - bulletHeightHalf,
        transform: "rotate(180deg)",
      });
      moveX = -bulletSpeed;
      break;
  }

  stage.append(bullet);

  // 포탄 애니메이션 실행
  const interval = setInterval(function () {
    posX += moveX;
    posY += moveY;

    // 포탄이 스테이지 범위를 벗어나면 삭제
    if (
      posX < 0 ||
      posY < 0 ||
      posX > stage.width() - bullet.width() ||
      posY > stage.height() - bullet.height()
    ) {
      bullet.remove();
      clearInterval(interval); // 포탄 애니메이션 정지
    } else {
      bullet.css({ top: posY, left: posX });
    }
  }, 1000 / 60); // 화면 갱신 빈도(약 60FPS)
}
