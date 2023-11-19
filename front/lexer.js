export const TOKEN_TYPE = {
    BIN_OPR: "opr",
    EQ: "eq",
    BOOL_EQ: "==",
    L_paren: ")",
    R_paren: "(",
    L_brack: "}",
    R_brack: "{",
    L_paren: ")",
    R_paren: "(",
    NUM: "num",
    TRUE: "true",
    FALSE: "false",
    STR: "str",
    IDENT: "ident",
    LET: "keyword_let",
    MD: "modulo",
    NULL: "null",
    SEMI: ";",
    IF: "if",
    EOF: "end",
}
export class Lexer {
    token(val, type) {
        return { value: val, type: type, grp: "TOKEN" };
    }
    is_int(string) {
        return /^[0-9]*$/.test(string);
    }
    is_char(string) {
        return /^[A-Za-z_]+$/.test(string);
    }
    isskippable(str) {
        return str == " " || str == "\n" || str == "\t" || str == '\r';
    }
    error(str, line, word) {
        console.error(`${str}\non line: ${line}\nword:${word}`);
    }
    constructor(code) {
        this.code = code
        this.TOKEN_TYPE = TOKEN_TYPE
        this.KEW_WORD = {
            "var": this.TOKEN_TYPE.LET,
            "null": this.TOKEN_TYPE.NULL,
            "true": this.TOKEN_TYPE.TRUE,
            "false": this.TOKEN_TYPE.FALSE,
            "if": this.TOKEN_TYPE.IF
        }
    }
    tokenize() {
        const tokens = new Array();
        const src = this.code.split("");
        let word_num = 0
        let line_num = 1
        while (src.length > 0) {
            // BEGIN PARSING ONE CHARACTER TOKENS
            if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "%" || src[0] == "/") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
            } else if (src[0] == ")") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_paren));
            }else if (src[0] == "(") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_paren));
            }else if (src[0] == "}") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_brack));
            }else if (src[0] == "{") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_brack));
            } else if (src[0] == "%") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.MD));
            } else if (src[0] == ";") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.SEMI));
            }else if (src[0] == "&") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
            }else if (src[0] == "|") {
                tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
            }
            else {
                // let ident = ""
                // let done = false
                // while (src.length > 0 && this.is_char(src[0]) || is_string) {
                // ident += src.shift()
                if (this.is_int(src[0])) {
                    let num = ""
                    while (src.length > 0 && this.is_int(src[0]) || src[0] == ".") {
                        num += src.shift()
                    }
                    tokens.push(this.token(num, this.TOKEN_TYPE.NUM));
                }
                else if (src[0] == "=") {
                    src.shift();
                    if (src[0] == "=") {
                        src.shift();
                        tokens.push(this.token("==", this.TOKEN_TYPE.BIN_OPR));
                    }
                    else tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
                }
                else if (src[0] == ">") {
                    src.shift();
                    if (src[0] == "=") {
                        src.shift();
                        tokens.push(this.token(">=", this.TOKEN_TYPE.BIN_OPR));
                    }
                    else tokens.push(this.token(">", this.TOKEN_TYPE.EQ));
                }else if (src[0] == "<") {
                    src.shift();
                    if (src[0] == "=") {
                        src.shift();
                        tokens.push(this.token("<=", this.TOKEN_TYPE.BIN_OPR));
                    }
                    else tokens.push(this.token("<", this.TOKEN_TYPE.EQ));
                }
                else if (src[0] == "!") {
                    src.shift();
                    if (src[0] == "=") {
                        src.shift();
                        tokens.push(this.token("!=", this.TOKEN_TYPE.BIN_OPR));
                    }
                    else {
                        tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
                        console.error("bro ! is not recomanded dont use it")
                    }
                }
                else if (src[0] == "\"") {
                    let str = "";
                    src.shift();
                    while (src.length > 0 && src[0] !== '"') {
                        str += src.shift();
                    }
                    src.shift();
                    tokens.push(this.token(str, this.TOKEN_TYPE.STR));
                } else if (this.is_char(src[0])) {
                    let ident = ""
                    while (src.length > 0 && this.is_char(src[0])) {
                        ident += src.shift()
                    }
                    let res_type = this.KEW_WORD[ident]
                    if (typeof res_type == "string") {
                        //         // if (res_type == "7") {
                        tokens.push(this.token(ident == "true" ? 1 : ident == "false" ? 0 : ident, res_type));
                        // }
                    } else {
                        tokens.push(this.token(ident, this.TOKEN_TYPE.IDENT));
                    }
                }
                else if (this.isskippable(src[0])) {
                    if (src[0] == "\n") {
                        line_num++
                    }
                    src.shift()
                }
                else {
                    this.error("Invalid charecter " + src[0], line_num, word_num)
                    break
                }
            }
            //  else {
            //     if (this.is_int(src[0])) {
            //         let num = ""
            //         while (src.length > 0 && this.is_int(src[0])) {
            //             num += src.shift()
            //         }
            //         tokens.push(this.token(num, this.TOKEN_TYPE.NUM));
            //     }
            //     else{ 
            //     if (this.is_char(src[0])) {
            //         let ident = ""
            //         let done = false
            //         while (src.length > 0 && this.is_char(src[0])) {
            //             ident += src.shift()
            //             // if (src[0] == "\"") {
            //             //     is_string = false
            //             //     tokens.push(this.token(ident, this.TOKEN_TYPE.STR));
            //             //     done = true
            //             // }
            //         }
            //         if (!done){
            //             let res_type = this.KEW_WORD[ident]
            //             if (typeof res_type == "string") {
            //             // if (res_type == "7") {
            //                 tokens.push(this.token(ident, res_type));
            //                 // }
            //             } else {
            //                 tokens.push(this.token(ident, this.TOKEN_TYPE.IDENT));
            //             }
            //         }
            //         }
            //         else if (this.isskippable(src[0])) {
            //             if (src[0] == "\n") {
            //                 line_num++
            //             }
            //             src.shift()
            //     }
            //     else {
            //         this.error("Invalid charecter " + src[0], line_num, word_num)
            //         break
            //     }
            // }
            // }
            word_num++
        }
        tokens.push(this.token('END', this.TOKEN_TYPE.EOF))
        return tokens
    }
}