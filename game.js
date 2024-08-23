/**
 * @todo
 * ㅁ1. 턴 수에 따라 지속되는 효과를 처리할 로직이 필요하다
 * eg. Q 스킬 이속 증가 효과가 2턴 뒤에 사라져야함 / n 턴 동안 슬로우가 묻는 스킬...
 * ㅁ2. 방어력, 이동 속도는 변동 후 원복되어야 한다. 따라서 같은 값을 참조하는 변수를 추가해야 한다.
 * 3. 소리가 나오면 좋겠다.
 * 4. 메시지 간 딜레이를 넣으면 좋겠다
 * ㅁ5. 점멸 (도망) 기능. 추가 기획 필요 체력이 50% 이하일 때만 사용 가능하게, 성공확률은 이속 공식을 참조하여 회피 확률과 동일하게 하면 될듯
 * 6. 적 클래스 추가. 일반 몹 3개, 보스몹 1개 (유미, 티모, 다리우스) / (트린다미어)
 * 7. 게임 시작 시 각 스테이지에서 출현할 몹들을 정할 로직.
 * 배열에 1,2,3 요소가 각각 3개씩 들어가게, -> 3개 단위로 중복되지 않게 1, 2, 3을 할당
 * -> 마지막 요소는 -1 eg. [2,1,3, 1,2,3 3,1,2 ,-1] => 총 10 스테이지
 * 1번 = 유미 / 2번 = 티모 / 3번 = 다리우스 / -1번 = 트린보스 // arr[stage-1]를 참조하여 적 인스턴스 생성
 * ㅁ8. 스테이지가 올라갈 수록 스탯 상향
 * 일반 몹은 스킬 1개씩만 구현... 너무 많다......
 * ㅁ회피 폐기하고 점멸 도주만 구현
 * 9. 레벨 기능 + 레벨에 따른 스킬 해금 선택
 * ㅁ10. 레벨을 올리려면 경험치도 있어야 한다............. / 경험치는 폐기
 * 왜 추가할 게 계속 생기는거지........................
 * 11. 안배운 스킬 선택시 스킬 효과 턴이 소모됨
 * eg. Q 스킬 사용 후 배우지 않은 R 스킬 선택 시 Q 이속 증가 증발
 */

import readlineSync from 'readline-sync';
import chalk from 'chalk';
import { Player, Yumi } from './class.js';

let turn = 1;

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== 현재 상태 ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} | Turn: ${turn} | Level: ${player.lvl}\n`) +
      // 플레이어 상태
      chalk.blueBright(`| 플레이어 정보 `) +
      chalk.green(`| 체력: ${player.maxHp}/${player.hp} (+${player.cond || '0'}) `) +
      chalk.dim(`| 공격력: ${player.atk} `) +
      chalk.yellowBright(`| 방어력: ${player.def} `) +
      chalk.blueBright(`| 이동 속도: ${Math.floor(player.mov)}\n`) +
      // 몬스터 상태
      chalk.redBright(`| ${monster.name} 정보 `) +
      chalk.green(`| 체력: ${monster.maxHp}/${monster.hp} `) +
      chalk.dim(`| 공격력: ${monster.atk} `) +
      chalk.yellowBright(`| 방어력: ${monster.def} `) +
      chalk.blueBright(`| 이동 속도: ${monster.mov} `) +
      (stage === 10 ? chalk.red(`| 분노: ${monster.rage}`) : chalk.cyan(`| 마나: ${monster.mana}`)),
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
    const flashChance = 0.1 + (0.05 * (player.mov - monster.mov)) / 100; // 점멸 확률, 표시용은 100 곱하여 사용
    // ===========================================
    console.clear();

    displayStatus(stage, player, monster);

    // logs가 2개 넘게 쌓이면 첫번째 요소부터 제거
    for (let i = logs.length; i > 2; i--) logs.shift();

    // 로그 출력
    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(`\nA.기본 공격`),
      player.qHas ? chalk.green(`Q.결정타`) : chalk.gray(`Q.결정타`),
      player.wHas ? chalk.green(`W.용기`) : chalk.gray(`W.용기`),
      player.eHas ? chalk.green(`E.심판`) : chalk.gray(`E.심판`),
      player.rHas ? chalk.green(`R.데마시아의 정의`) : chalk.gray(`R.데마시아의 정의`),
      chalk.green(`F.점멸(${Math.floor(flashChance * 100)}%)`),
    );
    const choice = readlineSync.question('당신의 선택은? ').toUpperCase();

    // 플레이어의 선택에 따라 다음 행동 처리
    let returnAct;
    switch (choice) {
      // 기본 공격
      case 'A':
        returnAct = player.attack(monster, giveDamage, player);
        break;
      case '?A':
        logs.push(chalk.dim('[도움말] 공격력의 100% 피해를 입힙니다.'));
        continue;
      // Q 스킬
      case 'Q':
        returnAct = player.skillQ(player);
        if (returnAct.includes('않')) {
          logs.push(returnAct);
          continue;
        }
        break;
      case '?Q':
        logs.push(
          chalk.dim(
            '[도움말] 다음 턴까지 이동 속도가 30% 증가하고, 다음 턴 기본 공격이 200% 피해를 입힙니다.',
          ),
        );
        continue;
      // W 스킬
      case 'W':
        returnAct = player.skillW(wShield);
        if (returnAct.includes('않')) {
          logs.push(returnAct);
          continue;
        }
        break;
      case '?W':
        logs.push(chalk.dim('[도움말] 다음 턴까지 최대 체력의 5%만큼 보호막을 얻습니다.'));
        continue;
      // E 스킬
      case 'E':
        returnAct = player.skillE(monster, eDamage);
        if (returnAct.includes('않')) {
          logs.push(returnAct);
          continue;
        }
        break;
      case '?E':
        logs.push(
          chalk.dim(
            '[도움말] 공격력의 80% 피해를 입히고, 적의 방어력을 다음 턴까지 30% 감소시킵니다.',
          ),
        );
        continue;
      // 궁
      case 'R':
        if (!player.rOn) {
          logs.push(chalk.yellow(`궁극기는 스테이지 당 한 번만 사용할 수 있습니다.`));
          continue;
        } else {
          returnAct = player.skillR(monster, rDamage);
          if (returnAct.includes('않')) {
            logs.push(returnAct);
            continue;
          }
        }
        break;
      case '?R':
        logs.push(
          chalk.dim(
            '[도움말] 잃은 체력의 30%만큼 고정 피해를 입힙니다. 스테이지마다 한 번만 사용할 수 있습니다.',
          ),
        );
        continue;
      // 점멸
      case 'F':
        if (player.hp > player.maxHp * 0.5) {
          logs.push(chalk.yellow(`도망은 탑의 수치다... (현재 체력 50% 미만일 때 사용 가능)`));
          continue;
        } else {
          returnAct = player.flash(flashChance);
          if (!returnAct) {
            return; // battle 종료 -> 다음 스테이지
          }
        }
        break;
      case '?F':
        logs.push(
          chalk.dim(
            '[도움말] 체력이 50% 미만일 때 사용할 수 있다. 상대와의 이동속도 차이에 따라 성공 확률이 조정된다.',
          ),
        );
        continue;
      // 잘못된 입력
      default:
        logs.push(chalk.yellow('잘못된 입력입니다. 다시 시도해주세요.'));
        continue;
    }

    logs.push(returnAct);

    // 몬스터 체력 0
    if (monster.hp <= 0) {
      return;
    } else {
      // 몬스터 행동
      // 마나가 있으면 40% 확률로 스킬 사용
      // 나중에 마나랑 확률 파라미터로 전달하여 동적으로 처리하기
      switch (monster.name) {
        case '유미':
          if (monster.mana >= 70 && Math.random() <= 0.4) {
            logs.push(monster.skillQ(player, receiveDamage));
          } else {
            logs.push(monster.attack(player, receiveDamage));
          }
          break;
        case '티모':
          break;
        case '다리우스':
          break;
        case '트린다미어':
          break;
        default:
          logs.push(chalk.red('오류 발생'));
          break;
      }
      turn++;
    }
  }

  // 플레이어 체력 0 로직 추가 예정
  // 첫 번째 메시지 출력
  process.stdout.write(chalk.blue('눈 앞이 깜깜해진다...'));
  readlineSync.question('');
  process.stdout.write(chalk.red('탑속도로가 뚫리고 말았다... 게임 오버!'));
  readlineSync.question('');
  return process.exit(0);
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;
  // 스테이지 배열 랜덤 생성 로직 추가 예정

  while (stage <= 10) {
    // 스테이지 배열을 랜덤하게 생성하고 그에 맞는 적 인스턴스가 생성되어야 함
    const monster = new Yumi(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어
    player.rOn = true;
    player.lvl++;
    turn = 1;
    stage++;
    console.log(chalk.yellow('레벨업!! 스탯이 상승했습니다.'));

    // 5레벨까지 스킬 습득
    while (player.lvl <= 5) {
      const choice = readlineSync.question('배울 스킬을 선택하세요. ').toUpperCase();

      switch (choice) {
        // Q 스킬
        case 'Q':
          if (!player.qHas) {
            console.log(chalk.yellow('Q 스킬을 배웠습니다.'));
            player.qHas = true;
          } else {
            console.log(chalk.yellow('이미 배운 스킬입니다'));
            continue;
          }
          break;
        // W 스킬
        case 'W':
          if (!player.wHas) {
            console.log(chalk.yellow('W 스킬을 배웠습니다.'));
            player.wHas = true;
          } else {
            console.log(chalk.yellow('이미 배운 스킬입니다'));
            continue;
          }
          break;
        // E 스킬
        case 'E':
          if (!player.eHas) {
            console.log(chalk.yellow('E 스킬을 배웠습니다.'));
            player.eHas = true;
          } else {
            console.log(chalk.yellow('이미 배운 스킬입니다'));
            continue;
          }
          break;
        // 궁
        case 'R':
          if (player.lvl < 5) {
            console.log(chalk.yellow('R 스킬은 5레벨에 배울 수 있습니다.'));
            continue;
          } else {
            console.log(chalk.yellow('R 스킬을 배웠습니다.'));
            player.rHas = true;
          }
          break;
        // 잘못된 입력
        default:
          console.log(chalk.yellow('잘못된 입력입니다. 다시 시도해주세요.'));
          continue;
      }
      break;
    }
    // 스킬 습득 종료========================================

    readlineSync.question('계속하기...');
  }

  // 10스테이지 클리어 로직 추가 예정
}
