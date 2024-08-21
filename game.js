import readlineSync from 'readline-sync';
import chalk from 'chalk';

let turn = 1;

class Player {
  constructor() {
    this.maxHp = 690;
    this.hp = this.maxHp;
    this.atk = 69; // 초기 공격력 69
    this.def = 38;
    this.initMov = 340;
    this.mov = this.initMov; // 이속 조절용
    this.cond = 0;
    this.qUse = false;
  }

  attack(monster, giveDamage, player) {
    // 플레이어의 기본 공격
    if (player.qUse) {
      // q 사용 시
      monster.hp -= giveDamage * 2;
      player.qUse = false;
      return chalk.blue(`기본 공격(A)!! 강화된 피해-> -${giveDamage * 2}`);
    } else {
      // q 사용 X
      monster.hp -= giveDamage;
      return chalk.blue(`기본 공격(A)!! 붙으면 강하다.. 피해-> -${giveDamage}`);
    }
  }

  skillQ(player) {
    player.qUse = true;
    player.mov *= 1.3;
    return chalk.blue('결정타(Q)!! 다음 기본 공격이 강화된다.');
  }
  skillW() {}
  skillE() {}
  skillR() {}
}

class Monster {
  constructor(stage) {
    this.maxHp = 10000;
    this.hp = 10000;
    this.atk = 10;
    this.def = 10;
    this.mov = 300;
    this.mana = 200;
  }

  attack(player, receiveDamage) {
    // 몬스터의 기본 공격
    if (player.cond >= receiveDamage) {
      player.cond -= receiveDamage;
    } else {
      player.hp -= receiveDamage - player.cond;
      player.cond = 0;
    }
    return chalk.red(`몬스터가 때려요. 피해-> -${receiveDamage}`);
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== 현재 상태 ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} | Turn: ${turn}\n`) +
      // 플레이어 상태
      chalk.blueBright(`| 플레이어 정보 `) +
      chalk.green(`| 체력: ${player.maxHp}/${player.hp} (+${player.cond || '0'}) `) +
      chalk.dim(`| 공격력: ${player.atk} `) +
      chalk.yellowBright(`| 방어력: ${player.def} `) +
      chalk.blueBright(`| 이동 속도: ${player.mov}\n`) +
      // 몬스터 상태
      chalk.redBright(`| 몬스터 정보 `) +
      chalk.green(`| 체력: ${monster.maxHp}/${monster.hp} `) +
      chalk.dim(`| 공격력: ${monster.atk} `) +
      chalk.yellowBright(`| 방어력: ${monster.def} `) +
      chalk.blueBright(`| 이동 속도: ${monster.mov} `) +
      chalk.cyan(`| 마나: ${monster.mana}`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];
  const myDef = 1 - player.def / (player.def + 100); // 방어력으로 감소하는 피해 비율 (플레이어)
  const enemyDef = 1 - monster.def / (monster.def + 100); // 방어력으로 감소하는 피해 비율 (적)

  // ============실제 사용할 변수================
  const receiveDamage = Math.floor(monster.atk * myDef); // 방어력 적용된 받는 대미지
  const giveDamage = Math.floor(player.atk * enemyDef); // 방어력 적용된 주는 대미지
  const wShield = Math.floor(player.maxHp * 0.05); // w 보호막
  const eDamage = Math.floor(giveDamage * 0.8); // e 스킬 피해
  // ===========================================

  while (player.hp > 0) {
    console.clear();

    // 새로운 턴에 보호막 제거
    player.cond = null;

    displayStatus(stage, player, monster);

    // logs가 2개 넘게 쌓이면 첫번째 요소부터 제거
    for (let i = logs.length; i > 2; i--) logs.shift();

    // 로그 출력
    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\nA.기본 공격 Q.결정타 W.용기 E.심판 R.데마시아의 정의`));
    const choice = readlineSync.question('당신의 선택은? ').toUpperCase();

    // 플레이어의 선택에 따라 다음 행동 처리
    let returnAct;
    switch (choice) {
      // 기본 공격
      case 'A':
        returnAct = player.attack(monster, giveDamage, player);
        break;
      case '?A':
        logs.push(chalk.dim('[도움말] 공격력의 100% 피해를 입힌다.'));
        continue;
      // Q 스킬
      case 'Q':
        returnAct = player.skillQ(player);
        break;
      case '?Q':
        logs.push(
          chalk.dim(
            '[도움말] 이번 턴 동안 이동 속도가 30% 증가하고, 다음 기본 공격이 200% 피해를 입힙니다.',
          ),
        );
        continue;
      // W 스킬
      case 'W':
        player.cond += 50;
        logs.push(chalk.blue(`용기(W) 맞을 용기가 생겼다. 보호막-> +${wShield}`));
        break;
      // E 스킬
      case 'E':
        monster.hp -= player.atk - monster.def * 2;
        logs.push(chalk.blue(`심판(E) 눈도 깜짝 안 한다~!. 피해-> -${eDamage}`));
        break;
      // 궁
      case 'R':
        monster.hp -= player.atk * 3 - monster.def;
        logs.push(
          chalk.blue(`플레이어가 데마시아의 정의를 사용합니다. 몬스터 체력: ${monster.hp}`),
        );
        break;
      // 잘못된 입력
      default:
        logs.push(chalk.red('잘못된 입력입니다. 다시 시도해주세요.'));
        continue;
    }

    logs.push(returnAct);

    // 몬스터 반격
    if (monster.hp > 0) {
      logs.push(monster.attack(player, receiveDamage));
      turn++;
    }
  }

  // 플레이어 체력 0 로직 추가 예정
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
