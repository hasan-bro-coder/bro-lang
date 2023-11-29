import { ENV } from "./var.js";
// import { Lexer } from "../front/lexer.js";
// import { Lexer } from "../front/lexer.js";
export class Eval {
    eval_numeric_binary_expr(lhs, rhs, opt) {
        if ((lhs.type == 'NUMBER' || lhs.type == 'BOOL' || lhs.type == "NULL") && (rhs.type == 'NUMBER' || lhs.type == 'BOOL' || rhs.type == 'NULL')) {
            let lval = Number(lhs.value == "null" ? 0 : lhs.value);
            let rval = Number(rhs.value == "null" ? 0 : rhs.value);
            switch (opt) {
                case "+":
                    return { type: "NUMBER", value: lval + rval, power: 1 };
                case "-":
                    return { type: "NUMBER", value: lval - rval, power: 1 };
                case "*":
                    return { type: "NUMBER", value: lval * rval, power: 1 };
                case "/":
                    return { type: "NUMBER", value: lval / rval, power: 1 };
                case "%":
                    return { type: "NUMBER", value: lval % rval, power: 1 };
                case "==":
                    return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
                case "===":
                    return { type: "BOOL", value: lhs.value === rhs.value ? true : false, power: 1 };
                case "!=":
                    return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
                case ">":
                    return { type: "BOOL", value: lval > rval ? true : false, power: 1 };
                case "<":
                    return { type: "BOOL", value: lval < rval ? true : false, power: 1 };
                case "<=":
                    return { type: "BOOL", value: lval <= rval ? true : false, power: 1 };
                case ">=":
                    return { type: "BOOL", value: lval >= rval ? true : false, power: 1 };
                case "|":
                    return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
                case "&":
                    return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
                default:
                    console.error(`Unknown operator provided in operation: `, lhs, rhs)
                    this.exit = true; return 0;

            }
        } else if (lhs.type == 'STR' && rhs.type == 'STR') {
            let lval = lhs.value;
            let rval = rhs.value;
            switch (opt) {
                case "+":
                    return { type: "STR", value: lval + rval, power: 1 };
                case "==":
                    return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
                case "===":
                    return { type: "BOOL", value: lhs.value === rhs.value ? true : false, power: 1 };
                case "!=":
                    return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
                case ">":
                    return { type: "BOOL", value: lval > rval ? true : false, power: 1 };
                case "<":
                    return { type: "BOOL", value: lval < rval ? true : false, power: 1 };
                case "<=":
                    return { type: "BOOL", value: lval <= rval ? true : false, power: 1 };
                case ">=":
                    return { type: "BOOL", value: lval >= rval ? true : false, power: 1 };
                case "|":
                    return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
                case "&":
                    return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
                default:
                    console.error(`Unknown operator provided in operation: `, lhs, "&&", rhs)
                    this.exit = true; return 0;
            }
        } else if ((lhs.type == 'STR' || lhs.type == 'NUMBER' || lhs.type == 'NULL') && (rhs.type == 'STR' || rhs.type == 'NUMBER' || rhs.type == 'NULL')) {
            let lval = String(lhs.type == "NULL" ? "" : lhs.value);
            let rval = String(rhs.type == "NULL" ? "" : rhs.value);
            switch (opt) {
                case "+":
                    return { type: "STR", value: lval + rval, power: 1 };
                case "==":
                    return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
                case "===":
                    return { type: "BOOL", value: (lhs.value === rhs.value) && lhs.type == rhs.type ? true : false, power: 1 };
                case "!=":
                    return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
                case "|":
                    return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
                case "&":
                    return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
                default:
                    console.error(`Unknown operator provided in operation: `, lhs, opt, rhs)
                    this.exit = true; return 0;
            }
        } else {

            console.error(`cant do operation with: `, lhs, "&&", rhs)
            this.exit = true; return { type: "NULL", value: "null_Error", power: 0 };
        }
        // if () {
        //     
        // } 
    }
    eval_function_run(ast, env) {
        const args = ast.args.map(arg => this.interpret(arg, env));
        // console.log("args",args);
        if (env.has_def_func(ast.value)) {
            let func = env.run_def_func(ast, args)
            // for (const i in ast.args) {
            // env.run_def_func(this.interpret(ast.args[i]))
            // }
            return func
        }
        if (env.has_func(ast.value)) {
            let func = env.run_func(ast.value)
            const scope = new ENV(func.declarationEnv);
            // for (const i in ast.args) {
            // env.assign_var(func.parameters[i],this.interpret(ast.args[i]))
            // }
            for (let i = 0; i < func.parameters.length; i++) {
                // TODO check the bounds here
                // verify arity of function
                const varname = func.parameters[i];
                scope.dec_var(varname, args[i] || { value: "null", type: "NULL" });
            }
            return this.eval_body(func.body, scope, true)
        }
        // Create new function scope

        // const fn = {
        //     type: "fn",
        //     name: declaration.name,
        //     parameters: declaration.parameters,
        //     declarationEnv: env,
        //     body: declaration.body,
        // };
        // let val = env.add_func(fn)
        // console.log(env.funcs);
        // return val;
    }
    eval_function_declaration(declaration, env) {
        // Create new function scope
        const fn = {
            type: "fn",
            name: declaration.name,
            parameters: declaration.parameters,
            declarationEnv: new ENV(env),
            body: declaration.body,
        };
        let val = env.add_func(fn)
        return val;
    }
    eval_identifier(ident, env) {
        // if (ident.group == "var") ,env{
        if (env.has_var(ident.value)) {
            const val = env.get_var(ident.value);
            return val;
        } else {
            // console.error("bro", ident.value, "not defined")
            // this.exit = true;
            return { type: "NULL", value: "null" }
        }
        // else {
        //         console.error("this is not defined:", ident);
        //         this.exit = true; return 0;
        //     }
        // } else {
        //     if (this.Env.has_var(ident.value)) {
        //         this.Env.run_func(ident.value)
        //         // const val = this.Env.get_var(ident.value);
        //         // return val;
        //     } else {
        //         console.error("this is not defined:", ident);
        //         this.exit = true; return 0;
        //     }
        // }
    }
    eval_binary_expr(binop, env) {
        if (binop.type == "BOOL") {
            return binop.value == 1 ? { type: "BOOL", value: true } : { type: "BOOL", value: false };
        }
        const lhs = this.interpret(binop.left, env);
        const rhs = this.interpret(binop.right, env);
        return this.eval_numeric_binary_expr(lhs, rhs, binop.opt);
    }
    eval_program(program, env) {
        let lastEvaluated = { type: "NULL", value: "null" };
        let res = "";
        (async()=>{
            while(program.value.length > 0) {
                if (!program.value[0]) {
                    return "errors"
                }
                if (program.value[0].type == "IMPORT") {
                lastEvaluated = await this.interpret(program.value[0], env)
                program.value.shift()
                }else
                {
                    lastEvaluated = this.interpret(program.value[0], env)
                    program.value.shift()
                }
                
                lastEvaluated?.power == 1 ? res += lastEvaluated.value + "\n" : 0;
            }
        })()
        return res
    }
    eval_assignment(node, env) {
        if (node.assigne.type !== "IDENT") {
            console.error(`Invalid LHS inaide assignment expr `, node.assigne);
            this.exit = true; return 0;
        }
        const varname = (node.assigne).value;
        if (env.has_var(varname)) {
            return env.assign_var(varname, this.interpret(node.value, env));
        }
        else {
            this.interpret({ type: 'VAR_DEC', value: this.interpret(node.value, env), identifier: varname, grp: 'AST' }, env)
        }
    }
    eval_var_program(declaration, env) {
        const value = declaration.value ? this.interpret(declaration.value, env) : { type: "NULL", value: null };
        return env.dec_var(declaration.identifier, value);
    }
    eval_body(body, env, new_env) {
        let scope;
        if (new_env) {
            scope = new ENV(env);
        } else {
            scope = env;
        }
        let result = { value: "null", type: "NULL" };
        for (const stmt of body) {
            if (!this.return) {
                result = this.interpret(stmt, env);
            }
        }
        return result;
    }
    eval_if_program(ast, env) {
        let opt = { type: "BOOL", value: false }
        if (ast.test.type == "BOOL") {
            opt.value = ast.test.value == 1 ? true : false;
        } else { opt = this.eval_binary_expr(ast.test, env) }
        if (opt.value) {
            return this.eval_body(ast.body, env)
        } else if (ast.alternate) {
            return this.eval_body(ast.alternate, env);
        } else {
            return { value: "null", type: "NULL" };
        }
        // return opt
    }
    async eval_import_function(ast, envs) {
        let { Lexer } = await import("../front/lexer.js")
        let { Parse } = await import("../front/parser.js")
        let { readFileSync } = await import("fs")
        let util = await import("util")
        function print(data) {
            typeof data === 'object' || Array.isArray(data) ? console.log(util.inspect(data, true, 12, true)) : console.log(data)
            // console.log(util.inspect(data,true,12,true))
        }
        (async()=>{
          let data = await readFileSync(ast.value.value, "utf8") 
          {
                // console.log(data);
                let lex_res = new Lexer(data.toString())
                let lex = lex_res.tokenize()
                // print(lex)
                // if (lex_res.err) { print(chalk.redBright("Lexer error:\t") + chalk.red(lex_res.err_text)); return 0 }
                let ast_res = new Parse(lex)
                let ast = ast_res.AST()
                // if (ast_res.err) { print(chalk.redBright("Parser error:\t") + chalk.red(ast_res.err_txt)); return 0 }
                // print(ast);
                // console.log("-----------\n");
                let val = new Eval(ast, envs).interpret()
                return val
            }
        })()
        // console.log(Lexer);
    }
    eval_return_program(ast, env) {
        this.return = true
        return this.interpret(ast.value, env);
    }
    eval_loop_program(ast, env) {
        // let opt = this.eval_binary_expr(ast.condition)
        let opt = { type: "BOOL", value: false }
        if (ast.condition.type == "BOOL") {
            opt.value = ast.condition.value == 1 ? true : false;
        } else { opt = this.eval_binary_expr(ast.condition, env) }
        while (opt.value) {
            // console.log(opt);
            this.eval_body(ast.body, env)
            opt = this.eval_binary_expr(ast.condition, env)
        }
        // {
        //     eval_assignment(update, env);
        //     eval_body(body, new Environment(env), false);

        //     test = evaluate(declaration.test, env);
        // } while ((test as BooleanVal).value);
        // } else if (ast.alternate) {
        // return this.eval_body(ast.alternate);
        // } else {
        // return { value: "null", type: "NULL" };
        // }
        // return opt
    }
    constructor(ast, Env) {
        this.Env = Env
        this.ast = ast;
        this.exit = false
        this.return = false
        this.res = ""
    }
    interpret(ast, env) {
        if (!ast) {
            ast = this.ast
        }
        if (this.exit) {
            this.exit = true; return 0
        }
        switch (ast.type) {
            case "NUMBER":
                return { type: "NUMBER", value: ast.value, };
            case "STR":
                return { type: "STR", value: ast.value, };
            case "BOOL":
                return { type: "BOOL", value: ast.value, };
            case "BIN_OPT":
                return this.eval_binary_expr(ast, env || this.Env)
            case "VAR_DEC":
                return this.eval_var_program(ast, env || this.Env)
            case "PROGRAM":
                return this.eval_program(ast, env || this.Env)
            case "IF":
                return this.eval_if_program(ast, env || this.Env)
            case "LOOP":
                return this.eval_loop_program(ast, env || this.Env)
            case "RETURN":
                return this.eval_return_program(ast, env || this.Env)
            case "FUNC":
                return this.eval_function_declaration(ast, env || this.Env)
            case "FUN_CALL":
                return this.eval_function_run(ast, env || this.Env)
            case "NULL":
                return { type: "NULL", value: "null" }
            case "IMPORT":
                return this.eval_import_function(ast, env || this.Env)
            case "IDENT":
                return this.eval_identifier(ast, env || this.Env)
            case "ASS":
                return this.eval_assignment(ast, env || this.Env)
            default:
                console.error("This AST node has not yet been setup for interpretation", ast);
        }
    }
}