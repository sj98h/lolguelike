/**
 * @todo
 * ㅁ1. 턴 수에 따라 지속되는 효과를 처리할 로직이 필요하다
 * eg. Q 스킬 이속 증가 효과가 2턴 뒤에 사라져야함 / n 턴 동안 슬로우가 묻는 스킬...
 * ㅁ2. 방어력, 이동 속도는 변동 후 원복되어야 한다. 따라서 같은 값을 참조하는 변수를 추가해야 한다.
 * 3. 소리가 나오면 좋겠다.
 * 4. 메시지 간 딜레이를 넣으면 좋겠다
 * 5. 점멸 (도망) 기능. 추가 기획 필요 체력이 50% 이하일 때만 사용 가능하게, 성공확률은 이속 공식을 참조하여 회피 확률과 동일하게 하면 될듯
 * 6. 적 클래스 추가. 일반 몹 3개, 보스몹 1개 (유미, 티모, 다리우스) / (트린다미어)
 * 7. 게임 시작 시 각 스테이지에서 출현할 몹들을 정할 로직.
 * 배열에 1,2,3 요소가 각각 3개씩 들어가게, -> 3개 단위로 중복되지 않게 1, 2, 3을 할당
 * -> 마지막 요소는 -1 eg. [2,1,3, 1,2,3 3,1,2 ,-1] => 총 10 스테이지
 * 1번 = 유미 / 2번 = 티모 / 3번 = 다리우스 / -1번 = 트린보스 // arr[stage-1]를 참조하여 적 인스턴스 생성
 * 8. 스테이지가 올라갈 수록 스탯 상향
 * 일반 몹은 스킬 1개씩만 구현... 너무 많다......
 * 회피 폐기하고 점멸 도주만 구현
 */

import readlineSync from 'readline-sync';
import chalk from 'chalk';

let turn = 1;

// 플레이어
class Player {
  constructor() {
    this.maxHp = 690;
    this.hp = this.maxHp;
    this.atk = 69; // 초기 공격력 69
    this.def = 38;
    this.initMov = 340;
    this.mov = this.initMov; // 이속 조절용
    this.cond = 0;
    this.effects = []; // Effect 인스턴스를 할당하여 사용
  }

  applyEffect(effect) {
    // 동일한 효과가 있는 경우
    const existingEffect = this.effects.find((e) => e.type === effect.type);
    if (existingEffect) {
      return;
    }

    this.effects.push(effect);
    effect.applyE(this);
  }

  durEffect() {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      effect.duration--;
      if (effect.duration <= 0) {
        effect.removeE(this);
        this.effects.splice(i, 1);
      }
    }
  }

  attack(monster, giveDamage) {
    const qEffect = this.effects.find((e) => e.type === 'Q');
    if (qEffect && qEffect.active) {
      monster.hp -= giveDamage * 2;
      qEffect.active = false; // 공격 후 상태 효과 비활성화
      return chalk.blue(`기본 공격(A)!! 강화된 피해-> -${giveDamage * 2}`);
    } else {
      monster.hp -= giveDamage;
      return chalk.blue(`기본 공격(A)!! 피해-> -${giveDamage}`);
    }
  }

  skillQ() {
    this.applyEffect(
      new Effect(
        'Q',
        2,
        (target) => (target.mov = target.initMov * 1.3),
        (target) => (target.mov = target.initMov),
      ),
    );
    return chalk.blue('결정타(Q)!! 다음 기본 공격이 강화되고 이동 속도가 30% 증가합니다.');
  }

  skillW(wShield) {
    this.applyEffect(
      new Effect(
        'W',
        2,
        (player) => (player.cond += wShield),
        (player) => (player.cond = 0),
      ),
    );
    return chalk.blue(`용기(W) 맞을 용기가 생겼다. 보호막-> +${wShield}`);
  }

  skillE(monster, eDamage) {
    monster.applyEffect(
      new Effect(
        'E',
        3,
        (monster) => (monster.def -= monster.initDef * 0.3),
        (monster) => (monster.def = monster.initDef),
      ),
    );
    monster.hp -= eDamage;
    return chalk.blue(
      `심판(E) 눈도 깜짝 안 한다~!. 피해-> -${eDamage} | 방어력-> -${monster.def * 0.3}`,
    );
  }

  skillR(monster, rDamage) {
    monster.hp -= rDamage;
    return chalk.blue(`데마시아의 정의(R) 한 뚝배기!! 피해-> ${rDamage}`);
  }
}

// 적
class Monster {
  constructor(stage) {
    this.maxHp = 10000;
    this.hp = 10000;
    this.initAtk = 10;
    this.atk = this.initAtk;
    this.initDef = 10;
    this.def = this.initDef;
    this.mov = 300;
    this.mana = 200;
    this.effects = []; // Effect 인스턴스를 할당하여 사용
  }

  applyEffect(effect) {
    // 동일한 효과가 있는 경우
    const existingEffect = this.effects.find((e) => e.type === effect.type);
    if (existingEffect) {
      return;
    }

    this.effects.push(effect);
    effect.applyE(this);
  }

  durEffect() {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      effect.duration--;
      if (effect.duration <= 0) {
        effect.removeE(this);
        this.effects.splice(i, 1);
      }
    }
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

// 턴 수 적용을 받는 스탯 변동 효과
// param: 스킬, 지속턴수, 변동된스탯, 원복된스탯
class Effect {
  constructor(type, duration, applyE, removeE) {
    this.type = type;
    this.duration = duration;
    this.applyE = applyE;
    this.removeE = removeE;
    // 평타 강화용
    this.active = true;
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

  while (player.hp > 0) {
    // 효과 업데이트
    player.durEffect();
    monster.durEffect();

    // 방어력 업데이트
    const myDef = 1 - player.def / (player.def + 100); // 방어력으로 감소하는 피해 비율 (플레이어)
    const enemyDef = 1 - monster.def / (monster.def + 100); // 방어력으로 감소하는 피해 비율 (적)

    // ============실제 사용할 변수================
    const receiveDamage = Math.floor(monster.atk * myDef); // 방어력 적용된 받는 대미지
    const giveDamage = Math.floor(player.atk * enemyDef); // 방어력 적용된 주는 대미지
    const wShield = Math.floor(player.maxHp * 0.05); // w 보호막
    const eDamage = Math.floor(giveDamage * 0.8); // e 스킬 피해
    const rDamage = Math.floor((monster.maxHp - monster.hp) * 0.3); // e 스킬 피해
    // ===========================================
    console.clear();

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
        returnAct = player.skillW(wShield);
        break;
      // E 스킬
      case 'E':
        returnAct = player.skillE(monster, eDamage);
        break;
      // 궁
      case 'R':
        returnAct = player.skillR(monster, rDamage);
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
