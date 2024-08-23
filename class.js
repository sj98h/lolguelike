import chalk from 'chalk';

export class Player {
  constructor() {
    this.lvl = 1;
    this.maxHp = 690;
    this.hp = this.maxHp;
    this.atk = 69; // 초기 공격력 69
    this.def = 38;
    this.initMov = 340;
    this.mov = this.initMov; // 이속 조절용
    this.cond = 0;
    this.rOn = true;
    this.effects = []; // Effect 인스턴스를 할당하여 사용
    this.qHas = false;
    this.wHas = false;
    this.eHas = false;
    this.rHas = false;
  }

  applyEffect(effect) {
    // 동일한 효과가 있는 경우
    const isEffect = this.effects.find((e) => e.type === effect.type);
    if (isEffect) {
      // 기존 효과에서 턴수만 갱신
      isEffect.duration = effect.duration;
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
    const blindEffect = this.effects.find((e) => e.type === '실명');
    if (blindEffect) {
      return chalk.blue(`실명 상태인 걸 깜빡했다!! 피해-> 0`);
    } else {
      const qEffect = this.effects.find((e) => e.type === 'Q');
      if (qEffect && qEffect.active) {
        monster.hp -= giveDamage * 2;
        qEffect.active = false;
        return chalk.blue(`기본 공격(A)!! 강화된 피해-> -${giveDamage * 2}`);
      } else {
        monster.hp -= giveDamage;
        return chalk.blue(`기본 공격(A)!! 피해-> -${giveDamage}`);
      }
    }
  }

  skillQ() {
    if (this.qHas) {
      this.applyEffect(
        new Effect(
          'Q',
          2,
          (target) => (target.mov = target.mov * 1.3),
          (target) => (target.mov = target.initMov),
        ),
      );
      return chalk.blue('결정타(Q)!! 다음 기본 공격이 강화되고 이동 속도가 30% 증가합니다.');
    } else {
      return chalk.yellow('스킬을 배우지 않았습니다.');
    }
  }

  skillW(wShield) {
    if (this.wHas) {
      this.applyEffect(
        new Effect(
          'W',
          2,
          (target) => (target.cond += wShield),
          (target) => (target.cond = 0),
        ),
      );
      return chalk.blue(`용기(W) 맞을 용기가 생겼다. 보호막-> +${wShield}`);
    } else {
      return chalk.yellow('스킬을 배우지 않았습니다.');
    }
  }

  skillE(monster, eDamage) {
    if (this.eHas) {
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
    } else {
      return chalk.yellow('스킬을 배우지 않았습니다.');
    }
  }

  skillR(monster, rDamage) {
    if (this.rHas) {
      this.rOn = false;
      monster.hp -= rDamage;
      return chalk.blue(`데마시아의 정의(R) 한 뚝배기!! 피해-> ${rDamage}`);
    } else {
      return chalk.yellow('스킬을 배우지 않았습니다.');
    }
  }

  flash(flashChance) {
    if (Math.random() < flashChance) {
      return false;
    } else {
      return chalk.yellow('아앗.. 벽플을 썼다... 부끄럽다.');
    }
  }
}

// 적
export class Monster {
  constructor(stage) {
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.initAtk = 10;
    this.atk = this.initAtk;
    this.initDef = 10;
    this.def = this.initDef;
    this.mov = 380;
    this.mana = 200;
    this.effects = []; // Effect 인스턴스를 할당하여 사용
  }

  applyEffect(effect) {
    // 동일한 효과가 있는 경우
    const isEffect = this.effects.find((e) => e.type === effect.type);
    if (isEffect) return;

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
    return chalk.red(`${this.name}의 기본 공격..! 피해-> -${receiveDamage}`);
  }
}

// monster 자식 클래스
// 유미
export class Yumi extends Monster {
  constructor(stage) {
    super(stage);
    this.name = '유미';
    this.maxHp = 500 + (stage - 1) * 69;
    this.hp = this.maxHp;
    this.initAtk = 49 + (stage - 1) * 3;
    this.atk = this.initAtk;
    this.initDef = 25 + (stage - 1) * 4;
    this.def = this.initDef;
    this.mov = 330;
    this.mana = 440;
    this.manaRegen = 16;
  }
  // q 스킬
  skillQ(player, receiveDamage) {
    this.mana -= 70;
    player.applyEffect(
      new Effect(
        '둔화',
        2,
        (target) => (target.mov = target.mov * 0.7),
        (target) => (target.mov = target.initMov),
      ),
    );
    Shield.isShield(player, receiveDamage, 1.3);
    return chalk.red(`${this.name}의 사르르탄! 느려진다.. 피해-> -${receiveDamage * 1.3}`);
  }
}

// 티모
export class Teemo extends Monster {
  constructor(stage) {
    super(stage);
    this.name = '티모';
    this.maxHp = 598 + (stage - 1) * 104;
    this.hp = this.maxHp;
    this.initAtk = 54 + (stage - 1) * 3;
    this.atk = this.initAtk;
    this.initDef = 24 + (stage - 1) * 5;
    this.def = this.initDef;
    this.mov = 330;
    this.mana = 334;
    this.manaRegen = 9;
  }
  // q 스킬
  skillQ(player, receiveDamage) {
    this.mana -= 80;
    // 실명 효과 로직이 필요함
    player.applyEffect(
      new Effect(
        '실명',
        2,
        () => null,
        () => null,
        false,
      ),
    );
    Shield.isShield(player, receiveDamage, 1.1);
    return chalk.red(
      `${this.name}의 실명 다트! 안 보인다.. 피해-> -${Math.floor(receiveDamage * 1.1)}`,
    );
  }
}

// 다리우스
export class Darius extends Monster {
  constructor(stage) {
    super(stage);
    this.name = '다리우스';
    this.maxHp = 652 + (stage - 1) * 114;
    this.hp = this.maxHp;
    this.initAtk = 64 + (stage - 1) * 5;
    this.atk = this.initAtk;
    this.initDef = 39 + (stage - 1) * 5;
    this.def = this.initDef;
    this.mov = 340;
    this.mana = 263;
    this.manaRegen = 6;
  }
  // q 스킬
  skillQ(player, receiveDamage) {
    this.mana -= 35;
    // 50% 확률로 잃은 체력의 5% 회복 추가 예정
    Shield.isShield(player, receiveDamage, 1.5);
    return chalk.red(`${this.name}의 실명 다트! 안 보인다.. 피해-> -${receiveDamage * 1.5}`);
  }
}

/**
 * 턴 수 적용을 받는 스탯 변동 효과
 * @param {string} type - 효과 종류, 디버프는 표시 이름으로 활용
 * @param {number} duration - 적용 받는 턴 수
 * @param {function} applyE - 효과 적용 기능. 스탯 변동되게끔 작성
 * @param {function} removeE - 효과 제거 기능. 스탯 원복
 * @param {boolean} [isBuff=true] - 버프인지 여부. 버프는 생략, 디버프는 false
 */
export class Effect {
  constructor(type, duration, applyE, removeE, isBuff = true) {
    this.type = type;
    this.duration = duration;
    this.applyE = applyE;
    this.removeE = removeE;
    this.isBuff = isBuff;
    this.active = true;
  }
}

// 몬스터 공격 시 플레이어 실드 처리
export class Shield {
  // 계수를 파라미터로 전달하여 동적으로 처리하면 좋겠다
  static isShield(player, receiveDamage, deg) {
    // 플레이어 실드 > 피해량
    if (player.cond >= receiveDamage * deg) {
      player.cond -= receiveDamage * deg;
    } else {
      player.hp -= receiveDamage * 1.5 - player.cond;
      player.cond = 0;
    }
  }
}
