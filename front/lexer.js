export const TOKEN_TYPE = {
	BIN_OPR: "opr",
	EQ: "eq",
	BOOL_EQ: "==",
	L_paren: ")",
	R_paren: "(",
	L_brack: "}",
	R_brack: "{",
	L_brace: "]",
	R_brace: "[",
	NUM: "num",
	TRUE: "true",
	FALSE: "false",
	STR: "str",
	IDENT: "ident",
	LET: "keyword_let",
	MD: "modulo",
	NULL: "null",
	SEMI: ";",
	COMMENT: "//",
	COMMA: ",",
	DOT: ".",
	COLON: ":",
	IF: "if",
	IMPORT: "add",
	END: "end_kew_word",
	DO: "do",
	SLASH:"/",
	WHILE: "while",
	ELSE: "else",
	RETURN: "return",
	FUN: "function",
	FUNC: "functions",
	EON: "endline",
	DBLOPR:"+=",
	DBLEQ:"+=",
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
		this.err = true
		this.err_text = `${str} on\nline: ${line}\nword: ${word}`
		// console.error(`${str}\non line: ${line}\nword:${word}`);

	}
	constructor(code) {
		this.err = false
		this.code = code
		this.err_text = "error bruh"
		this.TOKEN_TYPE = TOKEN_TYPE
		this.KEW_WORD = {
			"var": this.TOKEN_TYPE.LET,
			"null": this.TOKEN_TYPE.NULL,
			"shotto": this.TOKEN_TYPE.TRUE,
			"mittha": this.TOKEN_TYPE.FALSE,
			"true": this.TOKEN_TYPE.TRUE,
			"false": this.TOKEN_TYPE.FALSE,
			"if": this.TOKEN_TYPE.IF,
			"fi": this.TOKEN_TYPE.ELSE,
			"else": this.TOKEN_TYPE.ELSE,
			"loop": this.TOKEN_TYPE.WHILE,
			"func": this.TOKEN_TYPE.FUN,
			"fun": this.TOKEN_TYPE.FUNC,
			"return": this.TOKEN_TYPE.RETURN,
			"do": this.TOKEN_TYPE.DO,
			"end": this.TOKEN_TYPE.END,
			"add": this.TOKEN_TYPE.IMPORT,
			"import": this.TOKEN_TYPE.IMPORT,  
			"#include": this.TOKEN_TYPE.IMPORT,
		}
	}
	tokenize() {
		const tokens = new Array();
		const src = this.code.split("");
		let word_num = 0
		let line_num = 1
		while (src.length > 0) {
			// BEGIN PARSING ONE CHARACTER TOKENS
			if (src[0] == "*" || src[0] == "%" || src[0] == "/") {
				let val = src.shift()
				if(src[0] == "="){
					tokens.push(this.token(val , this.TOKEN_TYPE.DBLEQ));
					src.shift()
				}else tokens.push(this.token(val , this.TOKEN_TYPE.BIN_OPR));
			} else if (src[0] == ")") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_paren));
			}else if (src[0] == "(") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_paren));
			}else if (src[0] == "]") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_brace));
			}else if (src[0] == "[") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_brace));
			}else if (src[0] == "}") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_brack));
			}else if (src[0] == "{") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_brack));
			}else if (src[0] == "%") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.MD));
			}else if (src[0] == ";") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.SEMI));
			}else if (src[0] == ",") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.COMMA));
			}else if (src[0] == ":") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.COLON));
			}else if (src[0] == ".") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.DOT));
			}else if (src[0] == "&") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
			}else if (src[0] == "|") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
			}else {
				if (src[0] == "-") {
					 let tok = src.shift();
					 if (this.is_int(src[0])) {
						let num = "-"
					while (src.length > 0 && this.is_int(src[0]) || src[0] == ".") {
						num += src.shift()
					}
					tokens.push(this.token(num, this.TOKEN_TYPE.NUM));
					 }else if(src[0] == "="){
						 tokens.push(this.token(tok, this.TOKEN_TYPE.DBLEQ));
						 src.shift()
					}else{
				tokens.push(this.token(tok, this.TOKEN_TYPE.BIN_OPR));

					 }          
				}
				else if (src[0] == "+") {
						 let tok = src.shift();
						 if (src[0] == "+") {
						tokens.push(this.token("++", this.TOKEN_TYPE.DBLOPR));
						}else if (src[0] == "="){
						tokens.push(this.token(tok, this.TOKEN_TYPE.DBLEQ));
							 src.shift()
						}else{
					tokens.push(this.token(tok, this.TOKEN_TYPE.BIN_OPR));
						 }          
					}
				else if (this.is_int(src[0])) {
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
						if (src[0] == "=") {
							src.shift()
							tokens.push(this.token("===", this.TOKEN_TYPE.BIN_OPR));
						} else {tokens.push(this.token("==", this.TOKEN_TYPE.BIN_OPR))}
					}
					else tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
				}else if (src[0] == "#") {
					src.shift();
					while(src.length > 0 && src[0] != "\n"){
						src.shift()
					}
					// if (src[0] == "/") {
						// src.shift();
					// tokens.push(this.token("#", this.TOKEN_TYPE.COMMENT));
					// }
					// else tokens.push(this.token("/", this.TOKEN_TYPE.SLASH));
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
				else if (src[0] == "~") {
					src.shift();
					if (src[0] == "=") {
						src.shift();
						tokens.push(this.token("~=", this.TOKEN_TYPE.BIN_OPR));
					}
					else {
						tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
						console.error("bro ~ is not recomanded dont use it")
					}
				}
				else if (src[0] == "\"" || src[0] == "'") {
					let str = "";
					let types = src[0] == "\"" ? true : false
					src.shift();
					if (types) {
						while (src.length > 0 && src[0] !== '"') {
							str += src.shift();
							if (src[0] == "\\") {
								src.shift();
								str += src.shift();
							}
						}

					}else{
						while (src.length > 0 && src[0] !== '\'') {
							str += src.shift();
							if (src[0] == "\\") {
								src.shift();
								str += src.shift();
							}
						}
					}
					if (src.length == 0 && src[0] !== '"' && types) {
						this.err = true
						this.err_text = "expected \" at the end of string bro"
					}else if (src.length == 0 && src[0] !== '\'' && !types) {
						this.err = true
						this.err_text = "expected ' at the end of string bro"
					}
					// if (src[0] == "\\") {
						// src.shift();
						// src.shift();
					// }
					src.shift();
					tokens.push(this.token(str.replace("\\n","\n").replace("\\t","\t").replace("\\r","\r"), this.TOKEN_TYPE.STR));
				} else if (this.is_char(src[0])) {
					let ident = ""
					while (src.length > 0 && this.is_char(src[0])) {
						ident += src.shift()
					}
					let res_type = this.KEW_WORD[ident]
					if (typeof res_type == "string") {
						//         // if (res_type == "7") {
						tokens.push(this.token(ident == "true" || ident == "shotto" ? 1 : ident == "false" || ident == "mittha" ? 0 : ident, res_type));
						// }
					} else {
						tokens.push(this.token(ident, this.TOKEN_TYPE.IDENT));
					}
				}
				else if (this.isskippable(src[0])) {
					if (src[0] == "\n") {
						line_num++
						word_num = 0
						// tokens.push(this.token("EON", this.TOKEN_TYPE.EON));
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
		tokens.push(this.token('END_OF_FILE', this.TOKEN_TYPE.EOF))
		return tokens
	}
}