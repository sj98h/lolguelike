import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame } from './game.js';

const story = [
  '이곳은 가혹한 랭겜의 협곡...',
  '그 중에서도 가장 험난한 탑의 길.',
  '탑의 패왕 가렌이 간다..!',
];

// 로비 화면을 출력하는 함수
function displayLobby() {
  console.clear();

  // 타이틀 텍스트
  console.log(
    chalk.cyan(
      figlet.textSync('LOLguelike', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.magentaBright('='.repeat(50));
  console.log(line);

  // 게임 이름
  console.log(chalk.yellowBright.bold('소환사의 협곡에 오신 것을 환영합니다!'));

  // 설명 텍스트
  console.log(chalk.green('옵션을 선택해주세요.'));
  console.log();

  // 옵션들
  console.log(chalk.blue('1.') + chalk.white(' 탑으로 간다'));
  console.log(chalk.blue('2.') + chalk.white(' 종료'));

  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray('1-2 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
function handleUserInput() {
  const choice = readlineSync.question('입력: ');

  switch (choice) {
    case '1':
      // 여기에서 새로운 게임 시작 로직을 구현
      console.clear();
      story.forEach((e) => {
        process.stdout.write(chalk.green(e));
        readlineSync.question('');
      });
      startGame();
      break;
    case '2':
      console.log(chalk.red('게임을 종료합니다.'));
      // 게임 종료 로직을 구현
      process.exit(0); // 게임 종료
      break;
    default:
      console.log(chalk.red('올바른 선택을 하세요.'));
      handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
  }
}

// 게임 시작 함수
function start() {
  displayLobby();
  handleUserInput();
}

// 게임 실행
start();
