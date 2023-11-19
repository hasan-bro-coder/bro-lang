import { TOKEN_TYPE } from "./lexer.js";
export class Parse {
  eof() {
    return this.tokens[0].type != this.TOKEN_TYPE.EOF;
  }
  at() {
    return this.tokens[0];
  }
  eat() {
    const prev = this.tokens.shift();
    return prev;
  }
  expect(type, err) {
    const prev = this.tokens.shift();
    if (!prev || prev.type != type) {
      console.error(`Parser error:\n`, err, "Expecting: ", type);
      process.exit(1);
    }
    return prev;
  }
  parse_var_declaration() {
    const isConstant = this.eat().type == this.TOKEN_TYPE.NUM;
    const identifier = this.expect(
      this.TOKEN_TYPE.IDENT,
      "Expected identifier name following let/const keywords."
    ).value;
    if (this.at().type == this.TOKEN_TYPE.SEMI) {
      this.eat(); // expect semicolon
      if (isConstant)
        throw "Must assign value to constant expression. No value provided.";
      return {
        type: "VAR_DEC",
        value: { type: "NULL", value: "null" },
        identifier,
        grp: "AST",
      };
    }
    this.expect(
      this.TOKEN_TYPE.EQ,
      "Expected equals token following identifier in var declaration."
    );
    const declaration = {
      type: "VAR_DEC",
      value: this.parse_expr(),
      identifier,
      grp: "AST",
    };
    // if (this.at().type == this.TOKEN_TYPE.String) this.eat(); // eaat the " at the end
    // this.expect(this.TOKEN_TYPE.SEMI, "Variable declaration statement must end in semicolon (\";\")");

    return declaration;
  }
  parse_primary_expr() {
    const tk = this.at().type;
    switch (tk) {
      case this.TOKEN_TYPE.IDENT:
        return { type: "IDENT", value: this.eat().value, grp: "AST" };
      case this.TOKEN_TYPE.LET:
        return this.parse_var_declaration();
      case this.TOKEN_TYPE.NULL:
        this.eat();
        return { type: "NULL", value: "null", grp: "AST" };
      case this.TOKEN_TYPE.TRUE:
        return { value: this.eat().value, type: "BOOL", grp: "AST" };
      case this.TOKEN_TYPE.TRUE:
        return { value: this.eat().value, type: "BOOL", grp: "AST" };
      case TOKEN_TYPE.IF:
        return this.parse_if_statement();
      case this.TOKEN_TYPE.FALSE: this.eat(); // eat if keyword
        return { value: this.eat().value, type: "BOOL", grp: "AST" };
      case this.TOKEN_TYPE.NUM:
        return { value: this.eat().value, type: "NUMBER", grp: "AST" };
      case this.TOKEN_TYPE.STR:
        return { value: this.eat().value, type: "STR", grp: "AST" };
      case this.TOKEN_TYPE.R_paren:
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          this.TOKEN_TYPE.L_paren,
          "bro add the fucking >>>>> ) <<<<"
        ); //
        // this.expect(this.TOKEN_TYPE.CloseParen, "Unexpected token inside () expr. Expected \")\""); // closing paren
        return value;
      default:
        console.error("bro token cant be parsable:", this.at());
        process.exit(0);
    }
  }
  parse_multiplicative_expr() {
    let left = this.parse_primary_expr();
    while (["/", "*", "%"].includes(this.at().value)) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        type: "BIN_OPT",
        right: right,
        left: left,
        opt: operator,
        grp: "AST",
      };
    }

    return left;
  }
  parse_additive_expr() {
    let left = this.parse_multiplicative_expr();
    while (["+", "-", "<", ">"].includes(this.at().value)) {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        type: "BIN_OPT",
        right: right,
        left: left,
        opt: operator,
        grp: "AST",
      };
    }

    return left;
  }
  parse_block_statement(){
    this.expect(this.TOKEN_TYPE.R_brack, "Opening brace expected.");
    const body= [];
    while (this.eof() && this.at().type !== this.TOKEN_TYPE.L_brack) {
      const stmt = this.parse_token();
      body.push(stmt);
    }
    this.expect(this.TOKEN_TYPE.L_brack, "Closing brace expected.");
    return body;
  }

  parse_if_statement() {
    this.eat()
    this.expect(TOKEN_TYPE.R_paren, "Expected opening parenthesis following if keyword");
    const test = this.parse_expr();
    this.expect(TOKEN_TYPE.L_paren, "Expected closing parenthesis following if keyword");
    const body = this.parse_block_statement();
    return {type: 'IF', body: body, test:test};
  }
  parse_bool_expr() {
    let left = this.parse_additive_expr();
    while (["==", "!=", "<", ">", "<=", ">="].includes(this.at().value)) {
      const operator = this.eat().value;
      const right = this.parse_additive_expr();
      left = {
        type: "BIN_OPT",
        right: right,
        left: left,
        opt: operator,
        grp: "AST",
      };
    }

    return left;
    //     // return this.parse_additive_expr()
  }
  parse_ken_bool_expr() {
    let left = this.parse_bool_expr();
    while (["|", "&"].includes(this.at().value)) {
      const operator = this.eat().value;
      const right = this.parse_bool_expr();
      left = {
        type: "BIN_OPT",
        right: right,
        left: left,
        opt: operator,
        grp: "AST",
      };
    }

    return left;
    //     // return this.parse_additive_expr()
  }
  parse_assignment_expr() {
    const left = this.parse_ken_bool_expr();
    // const left = this.parse_additive_expr()
    if (this.at().type == this.TOKEN_TYPE.EQ) {
      this.eat(); // advance past the equals
      const value = this.parse_assignment_expr();
      return { value, assigne: left, type: "ASS", grp: "AST" };
    }
    return left;
  }
  parse_expr() {
    // return this.parse_additive_expr()
    return this.parse_assignment_expr();
  }
  parse_token() {
    return this.parse_expr();
  }
  constructor(tokens) {
    this.tokens = tokens;
    this.TOKEN_TYPE = TOKEN_TYPE;
  }
  AST(json) {
    let program = { type: "PROGRAM", value: [], grp: "AST" };
    while (this.eof()) {
      program.value.push(this.parse_token());
    }
    return json ? JSON.stringify(program) : program;
  }
}