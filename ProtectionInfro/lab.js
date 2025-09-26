const readline = require("readline");

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
async function showMenu() {
  console.log("=== КРИПТОГРАФИЧЕСКАЯ БИБЛИОТЕКА ===");
  console.log("1. Быстрое возведение в степень по модулю");
  console.log("2. Обобщенный алгоритм Евклида");
  console.log("3. Тест простоты Ферма");
  console.log("4. Генерация простого числа");
  console.log("5. Нахождение дискретного логарифма");
  console.log("0. Выход");

  const choice = await askQuestion("\nВыберите опцию (0-5): ");

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
