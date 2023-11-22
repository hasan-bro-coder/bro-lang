import { ENV } from "./var.js";
export class Eval {
    eval_numeric_binary_expr(lhs, rhs, opt) {
        if (lhs.type == 'NUMBER' || lhs.type == 'BOOL' && rhs.type == 'NUMBER' || lhs.type == 'BOOL') {
            let lval = Number(lhs.value);
            let rval = Number(rhs.value);
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
        }else if ((lhs.type == 'STR' && rhs.type == 'NUMBER') || (rhs.type == 'STR' && lhs.type == 'NUMBER')) {
            let lval = lhs.value;
            let rval = String(rhs.value);
            switch (opt) {
                case "+":
                    return { type: "STR", value: lval + rval, power: 1 };
                case "==":
                    return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
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
    eval_function_run(ast,env){
        const args = ast.args.map(arg => this.interpret(arg, env));
        // console.log("args",args);
        if(env.has_def_func(ast.value)){
            let func = env.run_def_func(ast,args)
            // for (const i in ast.args) {
            // env.run_def_func(this.interpret(ast.args[i]))
            // }
            return func
        }
        if(env.has_func(ast.value)){
            let func = env.run_func(ast.value)
            const scope = new ENV(func.declarationEnv);
            // for (const i in ast.args) {
                // env.assign_var(func.parameters[i],this.interpret(ast.args[i]))
            // }
            for (let i = 0; i < func.parameters.length; i++) {
                // TODO check the bounds here
                // verify arity of function
                const varname = func.parameters[i];
                scope.dec_var(varname, args[i]);
            }
            return this.eval_body(func.body,scope,true)
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
    eval_function_declaration(declaration, env){
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
    eval_identifier(ident,env) {
        // if (ident.group == "var") ,env{
            if (env.has_var(ident.value)) {
                const val = env.get_var(ident.value);
                return val;
            }else{
                console.error("bro",ident.value,"not defined")
                this.exit = true;
                return { type: "BOOL", value: false }
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
    eval_binary_expr(binop,env) {
        if (binop.type == "BOOL") {
            return binop.value == 1 ? { type: "BOOL", value: true } : { type: "BOOL", value: false };
        }
        const lhs = this.interpret(binop.left,env);
        const rhs = this.interpret(binop.right,env);
        return this.eval_numeric_binary_expr(lhs, rhs, binop.opt);
    }
    eval_program(program,env) {
        let lastEvaluated = { type: "NULL", value: "null" };
        let res = ""
        for (const statement of program.value) {
            if (!statement) {
                return "errors"
            }
            lastEvaluated = this.interpret(statement,env);
            lastEvaluated?.power == 1 ? res += lastEvaluated.value + "\n" : 0;
        }
        return res
    }
    eval_assignment(node,env) {
        if (node.assigne.type !== "IDENT") {
            console.error(`Invalid LHS inaide assignment expr `, node.assigne);
            this.exit = true; return 0;
        }
        const varname = (node.assigne).value;
        if (env.has_var(varname)) {
            return env.assign_var(varname, this.interpret(node.value,env));
        }
        else {
            this.interpret({ type: 'VAR_DEC', value: this.interpret(node.value,env), identifier: varname, grp: 'AST' },env)
        }
    }
    eval_var_program(declaration,env) {
        const value = declaration.value ? this.interpret(declaration.value, env) : { type: "NULL", value: null };
        return env.dec_var(declaration.identifier, value);
    }
    eval_body(body,env,new_env) {
        let scope;
    if (new_env) {
        scope = new ENV(env);
    } else {
        scope = env;
    }
        let result = { value: "null", type: "NULL" };
        for (const stmt of body) {
            result = this.interpret(stmt,env);
        }
        return result;
    }
    eval_if_program(ast,env) {
        let opt = { type: "BOOL", value: false }
        if (ast.test.type == "BOOL") {
            opt.value = ast.test.value == 1 ? true : false;
        } else { opt = this.eval_binary_expr(ast.test,env) }
        if (opt.value) {
            return this.eval_body(ast.body,env)
        } else if (ast.alternate) {
            return this.eval_body(ast.alternate,env);
        } else {
            return { value: "null", type: "NULL" };
        }
        // return opt
    }
    eval_loop_program(ast,env) {
        // let opt = this.eval_binary_expr(ast.condition)
        let opt = { type: "BOOL", value: false }
        if (ast.condition.type == "BOOL") {
            opt.value = ast.condition.value == 1 ? true : false;
        } else { opt = this.eval_binary_expr(ast.condition,env) }
        while (opt.value) {
            // console.log(opt);
            this.eval_body(ast.body,env)
            opt = this.eval_binary_expr(ast.condition,env)
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
        this.res = ""
    }
    interpret(ast,env) {
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
                return this.eval_binary_expr(ast,env || this.Env)
            case "VAR_DEC":
                return this.eval_var_program(ast,env || this.Env)
            case "PROGRAM":
                return this.eval_program(ast,env || this.Env)
            case "IF":
                return this.eval_if_program(ast,env || this.Env)
            case "LOOP":
                return this.eval_loop_program(ast,env || this.Env)
            case "FUNC":
                return this.eval_function_declaration(ast,env || this.Env)
            case "FUN_CALL":
                return this.eval_function_run(ast,env || this.Env)
            case "EON":
                
            case "NULL":
                return null
            case "IDENT":
                return this.eval_identifier(ast,env || this.Env)
            case "ASS":
                return this.eval_assignment(ast,env || this.Env)
            default:
                console.error("This AST node has not yet been setup for interpretation", ast);
        }
    }
}