const readline = require("readline");
const fs = require("fs");
const crypto = require("crypto");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
async function babyStepGiantStep(a, y, p) {
  // Вычисляем m = ceil(sqrt(p-1))
  const m = Math.ceil(Math.sqrt(p - 1));

  // Создаем карту для baby steps
  const babySteps = new Map();

  // Предварительно вычисляем a^j mod p для j от 0 до m-1
  let aj = 1;
  for (let j = 0; j < m; j++) {
    // сохраняем значение j для аj
    babySteps.set(aj, j);
    aj = (aj * a) % p;
  }

  // Вычисляем обратное значение a^{m} mod p
  const a_m = modExp(a, m, p);
  const a_m_inv = extendedEuclidean(a_m, p)[1]; // Обратный элемент по расширенному алгоритму Евклида
  // Но лучше использовать функцию для нахождения обратного элемента
  // Добавим функцию для вычисления обратного по модулю

  function modInverse(k, mod) {
    const [g, u, v] = extendedEuclidean(k, mod);
    if (g !== 1) {
      throw new Error("Обратный элемент не существует");
    }
    return ((u % mod) + mod) % mod;
  }

  const a_m_inv_mod = modInverse(a_m, p);

  // Теперь ищем джамп-гигантские шаги
  let gamma = y;
  for (let i = 0; i <= m; i++) {
    if (babySteps.has(gamma)) {
      const j = babySteps.get(gamma);
      const x = i * m + j;
      return x; // найдено решение
    }
    // gamma = gamma * (a^{-m}) mod p
    gamma = (gamma * a_m_inv_mod) % p;
  }

  // Если не нашли
  return null; // решение не найдено
}

// Добавленые функции конец
function modExp(a, exponent, modulus) {
  if (modulus === 1) return 0;

  let result = 1;
  a = a % modulus;

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * a) % modulus;
    }
    a = (a * a) % modulus;
    exponent = exponent >> 1;
  }

  return result;
}

function fermatPrimalityTest(n, k = 50) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0) return false;

  for (let i = 0; i < k; i++) {
    const a = 2 + Math.floor(Math.random() * (n - 3));
    if (modExp(a, n - 1, n) !== 1) {
      return false;
    }
  }

  return true;
}

function extendedEuclidean(a, b) {
  if (b === 0) {
    return [Math.abs(a), 1, 0];
  }

  let u1 = 1,
    u2 = 0,
    u3 = Math.abs(a);
  let v1 = 0,
    v2 = 1,
    v3 = Math.abs(b);

  while (v3 !== 0) {
    const quotient = Math.floor(u3 / v3);

    const tempU1 = u1,
      tempU2 = u2,
      tempU3 = u3;
    const tempV1 = v1,
      tempV2 = v2,
      tempV3 = v3;

    u1 = v1;
    u2 = v2;
    u3 = v3;

    v1 = tempU1 - quotient * v1;
    v2 = tempU2 - quotient * v2;
    v3 = tempU3 - quotient * v3;
  }

  if (a < 0) u1 = -u1;
  if (b < 0) u2 = -u2;

  return [u3, u1, u2];
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generatePrime(min = 1000, max = 10000) {
  let candidate;
  do {
    candidate = randomInt(min, max);
    if (candidate % 2 === 0) candidate += 1;
  } while (!fermatPrimalityTest(candidate, 15));

  return candidate;
}

function generateRandomNumber(min = 100, max = 10000) {
  return randomInt(min, max);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function generateShares(secret, threshold, totalShares, prime) {
  const shares = [];
  const coeffs = [secret];

  for (let i = 1; i < threshold; i++) {
    coeffs.push(crypto.randomInt(1, prime));
  }

  for (let i = 1; i <= totalShares; i++) {
    const x = i;
    let y = 0;
    for (let j = 0; j < coeffs.length; j++) {
      y = (y + coeffs[j] * Math.pow(x, j)) % prime;
    }
    shares.push({ x, y });
  }
  return shares;
}

function reconstructSecret(shares, prime) {
  let secret = 0;
  for (let i = 0; i < shares.length; i++) {
    let xi = shares[i].x;
    let yi = shares[i].y;

    let numerator = 1;
    let denominator = 1;

    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        let xj = shares[j].x;
        numerator = (numerator * -xj) % prime;
        denominator = (denominator * (xi - xj)) % prime;
      }
    }
    const invDen = modInverse(denominator, prime);
    const lagrangeCoef = (yi * numerator * invDen) % prime;
    secret = (prime + secret + lagrangeCoef) % prime;
  }
  return secret;
}

function modInverse(k, prime) {
  const [g, u, v] = extendedEuclidean(k, prime);
  if (g !== 1) throw new Error("Нет обратного элемента");
  return ((u % prime) + prime) % prime;
}

async function testModExp() {
  console.log("\n=== БЫСТРОЕ ВОЗВЕДЕНИЕ В СТЕПЕНЬ ПО МОДУЛЮ ===");
  console.log("Выберите способ ввода:");
  console.log("1. Ввести значения вручную");
  console.log("2. Сгенерировать случайные значения");

  const choice = await askQuestion("Ваш выбор (1-2): ");

  let a, exponent, modulus;

  if (choice === "1") {
    a = parseInt(await askQuestion("Введите основание (a): "));
    exponent = parseInt(await askQuestion("Введите показатель степени: "));
    modulus = parseInt(await askQuestion("Введите модуль: "));
  } else {
    a = generateRandomNumber(2, 100);
    exponent = generateRandomNumber(10, 1000);
    modulus = generateRandomNumber(100, 1000);
    console.log(
      `Сгенерированные значения: a = ${a}, exponent = ${exponent}, modulus = ${modulus}`
    );
  }

  const result = modExp(a, exponent, modulus);
  console.log(`Результат: ${a}^${exponent} mod ${modulus} = ${result}\n`);
}

async function testExtendedEuclidean() {
  console.log("\n=== ОБОБЩЕННЫЙ АЛГОРИТМ ЕВКЛИДА ===");
  console.log("Выберите способ ввода чисел:");
  console.log("1. Ввести числа вручную");
  console.log("2. Сгенерировать случайные числа");
  console.log("3. Сгенерировать простые числа");

  const choice = await askQuestion("Ваш выбор (1-3): ");

  let a, b;

  switch (choice) {
    case "1":
      a = parseInt(await askQuestion("Введите первое число (a): "));
      b = parseInt(await askQuestion("Введите второе число (b): "));
      break;
    case "2":
      a = generateRandomNumber();
      b = generateRandomNumber();
      console.log(`Сгенерированные числа: a = ${a}, b = ${b}`);
      break;
    case "3":
      a = generatePrime();
      b = generatePrime();
      console.log(`Сгенерированные простые числа: a = ${a}, b = ${b}`);
      break;
    default:
      console.log("Неверный выбор. Используются случайные числа.");
      a = generateRandomNumber();
      b = generateRandomNumber();
      console.log(`Сгенерированные числа: a = ${a}, b = ${b}`);
  }

  const [gcd, u1, u2] = extendedEuclidean(a, b);
  console.log(`\nРезультат:`);
  console.log(`НОД(${a}, ${b}) = ${gcd}`);
  console.log(
    `Коэффициенты Безу: ${a}*${u1} + ${b}*${u2} = ${a * u1 + b * u2}`
  );
  console.log(`Проверка: ${a * u1 + b * u2} = ${gcd}\n`);
}

async function testFermatPrimality() {
  console.log("\n=== ТЕСТ ПРОСТОТЫ ФЕРМА ===");
  console.log("Выберите способ ввода:");
  console.log("1. Ввести число вручную");
  console.log("2. Сгенерировать случайное число");
  console.log("3. Сгенерировать простое число");

  const choice = await askQuestion("Ваш выбор (1-3): ");

  let n;

  switch (choice) {
    case "1":
      n = parseInt(await askQuestion("Введите число для проверки: "));
      break;
    case "2":
      n = generateRandomNumber(100, 10000);
      console.log(`Сгенерированное число: ${n}`);
      break;
    case "3":
      n = generatePrime();
      console.log(`Сгенерированное простое число: ${n}`);
      break;
    default:
      console.log("Неверный выбор. Используется случайное число.");
      n = generateRandomNumber(100, 10000);
      console.log(`Сгенерированное число: ${n}`);
  }

  const k = parseInt(
    (await askQuestion("Введите количество итераций (по умолчанию 10): ")) || 10
  );

  const isPrime = fermatPrimalityTest(n, k);
  console.log(`Число ${n} - ${isPrime ? "вероятно простое" : "составное"}\n`);
}

async function testGeneratePrime() {
  console.log("\n=== ГЕНЕРАЦИЯ ПРОСТОГО ЧИСЛА ===");

  const min = parseInt(
    (await askQuestion("Введите минимальное значение (по умолчанию 1000): ")) ||
      1000
  );
  const max = parseInt(
    (await askQuestion(
      "Введите максимальное значение (по умолчанию 10000): "
    )) || 10000
  );

  const prime = generatePrime(min, max);
  console.log(`Сгенерированное простое число: ${prime}`);
  console.log(
    `Проверка тестом Ферма: ${fermatPrimalityTest(prime) ? "✓" : "✗"}\n`
  );
}
// Вариант вызова и тестирования
async function testDiscreteLog() {
  console.log(
    "\n=== Нахождение дискретного логарифма (Baby-step Giant-step) ==="
  );
  console.log("Выберите способ ввода:");
  console.log("1. Ввести значения вручную");
  console.log("2. Сгенерировать случайные параметры");

  const choice = await askQuestion("Ваш выбор (1-2): ");

  let a, y, p;

  if (choice === "1") {
    a = parseInt(await askQuestion("Введите основание a: "));
    y = parseInt(await askQuestion("Введите y: "));
    p = parseInt(await askQuestion("Введите модуль p: "));
  } else if (choice === "2") {
    // Запрос диапазона для всех параметров
    const minRange = parseInt(
      await askQuestion("Введите минимальное значение диапазона: ")
    );
    const maxRange = parseInt(
      await askQuestion("Введите максимальное значение диапазона: ")
    );

    if (minRange >= maxRange) {
      console.log(
        "Некорректный диапазон. Минимальное значение должно быть меньше максимального."
      );
      return;
    }

    // Генерация случайных чисел внутри диапазона
    p = generatePrime(minRange, maxRange);
    a = generateRandomNumber(minRange, maxRange);
    y = generateRandomNumber(minRange, maxRange);

    console.log(`Сгенерированные параметры:\n p = ${p}\n a = ${a}\n y = ${y}`);
  } else {
    console.log("Недопустимый выбор. Попробуйте снова.");
    return;
  }

  try {
    const x = await babyStepGiantStep(a, y, p);
    if (x !== null) {
      console.log(`Значение x: ${x}`);
      // Проверка
      const checkY = modExp(a, x, p);
      console.log(
        `Проверка: a^x mod p = ${checkY} ${
          checkY === y ? "(совпадает)" : "(не совпадает)"
        }`
      );
    } else {
      console.log("Решение не найдено");
    }
  } catch (err) {
    console.error("Ошибка: ", err.message);
  }
}
async function diffieHellmanKeyExchange() {
  console.log("\n=== Диффи-Хеллман: построение общего ключа ===");
  console.log("Выберите способ ввода параметров:");
  console.log("1. Ввести вручную");
  console.log("2. Сгенерировать автоматически");

  const choice = await askQuestion("Ваш выбор (1-2): ");

  let p, g, X1, X2;

  if (choice === "1") {
    p = parseInt(await askQuestion("Введите простое число p: "));
    g = parseInt(await askQuestion("Введите основание g: "));
    X1 = parseInt(await askQuestion("Введите секретный ключ X1: "));
    X2 = parseInt(await askQuestion("Введите секретный ключ X2: "));
  } else if (choice === "2") {
    // Генерация простого p
    p = generatePrime(1000, 5000);
    // Выбор g — простое число, меньшее p, обычно простое или первообразное (упрощенно)
    g = generatePrime(2, p - 2);
    X1 = generateRandomNumber(2, p - 2);
    X2 = generateRandomNumber(2, p - 2);
    console.log(
      `Сгенерированные параметры:\np = ${p}\ng = ${g}\nX1 = ${X1}\nX2 = ${X2}`
    );
  } else {
    console.log("Некорректный выбор. Возврат в меню.");
    return;
  }

  // Проверки (например, p — простое, g — первообразное — упрощенно)
  // Для простоты, можно пропустить или добавить базовые проверки.

  // Вычисление публичных ключей
  const Y1 = modExp(g, X1, p);
  const Y2 = modExp(g, X2, p);

  // Построение общего ключа
  const sharedKey = modExp(Y2, X1, p); // или modExp(Y1, X2, p)

  console.log(`\nОбщий ключ (shared secret): ${sharedKey}`);
  console.log(`Публичные ключи:\nY1 = ${Y1}\nY2 = ${Y2}\n`);
}

async function secretShareEncrypt() {
  const filepath = await askQuestion("Введите путь к файлу для шифрования: ");
  const data = fs.readFileSync(filepath);
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  const secret = parseInt(hash.slice(0, 8), 16); // Используем первые 8 символов хеша

  let p;
  const pInput = await askQuestion(
    "Введите простое число p (или оставьте пустым для генерации): "
  );
  if (pInput.trim() === "") {
    p = generatePrime(10007, 20000);
    console.log(`Сгенерировано p: ${p}`);
  } else {
    p = parseInt(pInput);
  }

  const thresholdInput = await askQuestion(
    "Введите минимальную часть для восстановления (threshold): "
  );
  const threshold = parseInt(thresholdInput);
  const totalSharesInput = await askQuestion(
    "Введите общее число частей (totalShares): "
  );
  const totalShares = parseInt(totalSharesInput);

  const shares = generateShares(secret, threshold, totalShares, p);
  for (let i = 0; i < shares.length; i++) {
    const shareData = `x:${shares[i].x}, y:${shares[i].y}`;
    fs.writeFileSync(`share_${i + 1}.txt`, shareData);
  }
  console.log(
    `Создано ${shares.length} частей файла. Для восстановления требуется минимум ${threshold} частей.`
  );

  // После генерации и сохранения частей, сразу восстановим секрет из всех частей (или из threshold)
  // Для проверки, возьмем первые 'threshold' частей
  const subsetShares = shares.slice(0, threshold);
  const recoveredSecret = reconstructSecret(subsetShares, p);
  const originalHashCode = hash.slice(0, 8);
  console.log(
    `Восстановленный секрет (из первых ${threshold} частей): ${recoveredSecret}`
  );
  console.log(`Исходный секрет (хэш файла, первые 8 символов): ${secret}`);
}

async function secretShareDecrypt(originalHash) {
  const shareCount = await askQuestion(
    "Введите число частей для восстановления: "
  );
  const count = parseInt(shareCount);
  const shares = [];

  for (let i = 0; i < count; i++) {
    const filename = await askQuestion(
      `Введите имя части ${i + 1} (например, share_1.txt): `
    );
    const content = fs.readFileSync(filename, "utf-8");
    const matchX = content.match(/x:(\d+)/);
    const matchY = content.match(/y:(\d+)/);
    if (matchX && matchY) {
      shares.push({ x: parseInt(matchX[1]), y: parseInt(matchY[1]) });
    } else {
      console.log("Некорректный формат файла части");
      return;
    }
  }

  const pInput = await askQuestion(
    "Введите p (если знаете, оставьте пустым для ввода): "
  );
  let p;
  if (pInput.trim() === "") {
    p = parseInt(await askQuestion("Введите p: "));
  } else {
    p = parseInt(pInput);
  }

  const secret = reconstructSecret(shares, p);
  console.log(`Восстановленный секрет: ${secret}`);
}

async function showMenu() {
  console.log("=== КРИПТОГРАФИЧЕСКАЯ БИБЛИОТЕКА ===");
  console.log("1. Быстрое возведение в степень по модулю");
  console.log("2. Обобщенный алгоритм Евклида");
  console.log("3. Тест простоты Ферма");
  console.log("4. Генерация простого числа");
  console.log("5. Нахождение дискретного логарифма");
  console.log("6. Построение общего ключа по схеме Диффи-Хеллмана");
  console.log("7. Шифрование файла (разделение секрета)");
  console.log("8. Восстановление файла из частей");
  console.log("0. Выход");

  const choice = await askQuestion("\nВыберите опцию (0-8): ");

  switch (choice) {
    case "1":
      await testModExp();
      break;
    case "2":
      await testExtendedEuclidean();
      break;
    case "3":
      await testFermatPrimality();
      break;
    case "4":
      await testGeneratePrime();
      break;
    case "5":
      await testDiscreteLog();
      break;
    case "6":
      await diffieHellmanKeyExchange();
      break;
    case "7":
      await secretShareEncrypt();
      break;
    case "8":
      await secretShareDecrypt();
      break;
    case "0":
      console.log("До свидания!");
      rl.close();
      return;
    default:
      console.log("Неверный выбор. Попробуйте снова.\n");
  }

  await showMenu();
}

async function main() {
  console.log("Добро пожаловать в криптографическую библиотеку!\n");
  await showMenu();
}

rl.on("close", () => {
  process.exit(0);
});

main().catch(console.error);
