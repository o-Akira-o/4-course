const fs = require("fs");
const path = require("path");

// ===== Базовые классы =====
const TokenType = {
  PLUS: "PLUS",
  MINUS: "MINUS",
  MULTIPLY: "MULTIPLY",
  DIVIDE: "DIVIDE",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  NUMBER: "NUMBER",
  ID: "ID",
  EOF: "EOF",
};

const SymbolToTokenType = {
  "+": TokenType.PLUS,
  "-": TokenType.MINUS,
  "*": TokenType.MULTIPLY,
  "/": TokenType.DIVIDE,
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
};

class Token {
  constructor(type, value, position) {
    this.type = type;
    this.value = value;
    this.position = position;
  }
}

class ParserError extends Error {
  constructor(message, position) {
    super(message);
    this.position = position;
    this.name = "ParserError";
  }
}

// Узел синтаксического дерева
class ASTNode {
  constructor(type, value = null, children = []) {
    this.type = type;
    this.value = value;
    this.children = children;
  }

  toBracketNotation() {
    if (this.children.length === 0) {
      return this.value !== null ? `${this.type}:${this.value}` : this.type;
    }

    const childrenStr = this.children
      .map((child) => child.toBracketNotation())
      .join(" ");
    return `(${this.type} ${childrenStr})`;
  }
}

// ===== Лексический анализатор =====
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input.length > 0 ? this.input[this.position] : null;
  }

  skipWhitespace() {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.moveToNextChar();
    }
  }

  moveToNextChar() {
    this.position++;
    this.currentChar =
      this.position < this.input.length ? this.input[this.position] : null;
  }

  collectNumber() {
    let result = "";
    while (this.currentChar !== null && /[0-9]/.test(this.currentChar)) {
      result += this.currentChar;
      this.moveToNextChar();
    }
    return result;
  }

  collectIdentifier() {
    let result = "";
    if (this.currentChar !== null && /[a-zA-Z]/.test(this.currentChar)) {
      result += this.currentChar;
      this.moveToNextChar();
      while (
        this.currentChar !== null &&
        /[a-zA-Z0-9]/.test(this.currentChar)
      ) {
        result += this.currentChar;
        this.moveToNextChar();
      }
    }
    return result;
  }

  getNextToken() {
    this.skipWhitespace();

    if (this.currentChar === null)
      return new Token(TokenType.EOF, "", this.position);

    const startPos = this.position;

    if (/[0-9]/.test(this.currentChar)) {
      return new Token(TokenType.NUMBER, this.collectNumber(), startPos);
    }

    if (/[a-zA-Z]/.test(this.currentChar)) {
      return new Token(TokenType.ID, this.collectIdentifier(), startPos);
    }

    const tokenType = SymbolToTokenType[this.currentChar];
    if (tokenType) {
      const char = this.currentChar;
      this.moveToNextChar();
      return new Token(tokenType, char, startPos);
    }

    throw new ParserError(
      `Неизвестный символ: '${this.currentChar}'`,
      startPos
    );
  }
}

// ===== Синтаксический анализатор =====
class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  match(expectedType) {
    if (this.currentToken.type === expectedType) {
      const matchedToken = this.currentToken;
      this.currentToken = this.lexer.getNextToken();
      return matchedToken;
    }
    throw new ParserError(
      `Ожидался токен: ${expectedType}, но получен: ${this.currentToken.type}`,
      this.currentToken.position
    );
  }

  // S -> T E (аксиома)
  parseS() {
    const tNode = this.parseT();
    const eNode = this.parseE();
    return new ASTNode("S", null, [tNode, eNode]);
  }

  // E -> + T E | - T E | ε
  parseE() {
    if (this.currentToken.type === TokenType.PLUS) {
      this.match(TokenType.PLUS);
      const tNode = this.parseT();
      const eNode = this.parseE();
      const plusNode = new ASTNode("OP", "+");
      return new ASTNode("E", null, [plusNode, tNode, eNode]);
    } else if (this.currentToken.type === TokenType.MINUS) {
      this.match(TokenType.MINUS);
      const tNode = this.parseT();
      const eNode = this.parseE();
      const minusNode = new ASTNode("OP", "-");
      return new ASTNode("E", null, [minusNode, tNode, eNode]);
    }
    return new ASTNode("E", "ε");
  }

  // T -> F T'
  parseT() {
    const fNode = this.parseF();
    const tPrimeNode = this.parseTPrime();
    return new ASTNode("T", null, [fNode, tPrimeNode]);
  }

  // T' -> * F T' | / F T' | ε
  parseTPrime() {
    if (this.currentToken.type === TokenType.MULTIPLY) {
      this.match(TokenType.MULTIPLY);
      const fNode = this.parseF();
      const tPrimeNode = this.parseTPrime();
      const multiplyNode = new ASTNode("OP", "*");
      return new ASTNode("T'", null, [multiplyNode, fNode, tPrimeNode]);
    } else if (this.currentToken.type === TokenType.DIVIDE) {
      this.match(TokenType.DIVIDE);
      const fNode = this.parseF();
      const tPrimeNode = this.parseTPrime();
      const divideNode = new ASTNode("OP", "/");
      return new ASTNode("T'", null, [divideNode, fNode, tPrimeNode]);
    }
    return new ASTNode("T'", "ε");
  }

  // F -> ( S ) | number | id
  parseF() {
    if (this.currentToken.type === TokenType.LPAREN) {
      this.match(TokenType.LPAREN);
      const sNode = this.parseS();
      this.match(TokenType.RPAREN);
      return new ASTNode("F", null, [sNode]);
    } else if (this.currentToken.type === TokenType.NUMBER) {
      const numberToken = this.match(TokenType.NUMBER);
      return new ASTNode("NUM", numberToken.value);
    } else if (this.currentToken.type === TokenType.ID) {
      const idToken = this.match(TokenType.ID);
      return new ASTNode("ID", idToken.value);
    } else {
      throw new ParserError(
        "Ожидалось число, идентификатор или '('",
        this.currentToken.position
      );
    }
  }
}

// ===== Главная функция =====
function checkExpression(inputString) {
  if (inputString.trim() === "") {
    return {
      success: false,
      error: "Введена пустая строка",
      position: 0,
      tree: null,
    };
  }

  try {
    const lexer = new Lexer(inputString);
    const parser = new Parser(lexer);
    const syntaxTree = parser.parseS();

    if (parser.currentToken.type !== TokenType.EOF) {
      throw new ParserError(
        `Ожидался конец выражения, но найден: ${parser.currentToken.type}`,
        parser.currentToken.position
      );
    }

    return {
      success: true,
      message: "Выражение корректно!",
      tree: syntaxTree,
      position: -1,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      position: error.position,
      tree: null,
    };
  }
}

// ===== Обработка файла =====
function processFile() {
  const filename = "expressions.txt";

  if (!fs.existsSync(filename)) {
    console.log(`❌ Файл ${filename} не найден. Создаю пример файла...`);
    createExampleFile();
    console.log(`✅ Файл создан. Запустите программу снова.`);
    return;
  }

  try {
    const content = fs.readFileSync(filename, "utf8");
    const expressions = content
      .split("\n")
      .filter((line) => line.trim() !== "");

    console.log(`=== ОБРАБОТКА ФАЙЛА ${filename} ===`);
    console.log(`Найдено выражений: ${expressions.length}\n`);

    expressions.forEach((expression, index) => {
      console.log(`Выражение ${index + 1}: "${expression}"`);

      const result = checkExpression(expression);

      if (result.success) {
        console.log("✅ Выражение корректно");
        console.log("📊 Дерево в скобочной нотации:");
        console.log(result.tree.toBracketNotation());
      } else {
        console.log(`❌ Ошибка: ${result.error}`);
        if (result.position >= 0) {
          console.log(`📍 Позиция ошибки: ${result.position}`);
        }
      }
      console.log("─".repeat(50));
    });
  } catch (error) {
    console.log(`❌ Ошибка чтения файла: ${error.message}`);
  }
}

// ===== Главная функция =====
function main() {
  console.log("=== СИНТАКСИЧЕСКИЙ АНАЛИЗАТОР ===");
  console.log("Чтение выражений из файла expressions.txt\n");

  processFile();
}

// Запуск программы
main();
