import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 690;
    this.atk = 69;
    this.def = 38;
    this.mov = 340;
  }

  attack() {
    // 플레이어의 기본 공격
  }
}

class Monster {
  constructor() {
    this.hp = 100;
    this.atk = 10;
    this.def = 20;
    this.mov = 300;
    this.mana = 200;
  }

  attack() {
    // 몬스터의 공격
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== 현재 상태 ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage}\n`) +
      // 플레이어 상태
      chalk.blueBright(`| 플레이어 정보 `) +
      chalk.green(`| 체력: ${player.hp} `) +
      chalk.dim(`| 공격력: ${player.atk} `) +
      chalk.yellowBright(`| 방어력: ${player.def} `) +
      chalk.blueBright(`| 이동 속도: ${player.mov}\n`) +
      // 몬스터 상태
      chalk.redBright(`| 몬스터 정보 `) +
      chalk.green(`| 체력: ${monster.hp} `) +
      chalk.dim(`| 공격력: ${monster.atk} `) +
      chalk.yellowBright(`| 방어력: ${monster.def} `) +
      chalk.blueBright(`| 이동 속도: ${monster.mov} `) +
      chalk.cyan(`| 마나: ${monster.mana}`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\nA. 기본 공격 Q. 결정타 W. 용기 E. 심판 R. 데마시아의 정의`));
    const choice = readlineSync.question('당신의 선택은? ').toUpperCase();

    // 플레이어의 선택에 따라 다음 행동 처리
    const reg = /^[AQWER]$/i;

    if (reg.test(choice)) {
      logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

      switch (choice) {
        case 'A':
          monster.hp -= player.atk - monster.def; // 기본 공격
          logs.push(chalk.blue(`플레이어가 기본 공격을 합니다. 몬스터 체력: ${monster.hp}`));
          break;
        case 'Q':
          monster.hp -= player.atk * 2 - monster.def; // 결정타
          logs.push(chalk.blue(`플레이어가 결정타를 사용합니다. 몬스터 체력: ${monster.hp}`));
          break;
        case 'W':
          player.hp += 50; // 용기 (체력 회복)
          logs.push(
            chalk.blue(`플레이어가 용기를 사용하여 체력을 회복합니다. 플레이어 체력: ${player.hp}`),
          );
          break;
        case 'E':
          monster.hp -= player.atk - monster.def * 2; // 심판
          logs.push(chalk.blue(`플레이어가 심판을 사용합니다. 몬스터 체력: ${monster.hp}`));
          break;
        case 'R':
          monster.hp -= player.atk * 3 - monster.def; // 데마시아의 정의
          logs.push(
            chalk.blue(`플레이어가 데마시아의 정의를 사용합니다. 몬스터 체력: ${monster.hp}`),
          );
          break;
      }

      // 몬스터 반격
      if (monster.hp > 0) {
        player.hp -= monster.atk - player.def; // 몬스터 반격
        logs.push(chalk.red(`몬스터가 반격합니다. 플레이어 체력: ${player.hp}`));
      }
    } else {
      console.log(chalk.red('잘못된 입력입니다. 다시 시도해 주세요.'));
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건

    stage++;
  }
}
