
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
                    return { type: "NUMBER", value: lval == rval ? true : false, power: 1 };
                case "!=":
                    return { type: "NUMBER", value: lval != rval ? true : false, power: 1 };
                case ">":
                    return { type: "NUMBER", value: lval > rval ? true : false, power: 1 };
                case "<":
                    return { type: "NUMBER", value: lval < rval ? true : false, power: 1 };
                case "<=":
                    return { type: "NUMBER", value: lval <= rval ? true : false, power: 1 };
                case ">=":
                    return { type: "NUMBER", value: lval >= rval ? true : false, power: 1 };
                case "|":
                    return { type: "NUMBER", value: lval || rval ? true : false, power: 1 };
                case "&":
                    return { type: "NUMBER", value: lval && rval ? true : false, power: 1 };
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
                    return { type: "NUMBER", value: lval == rval ? true : false, power: 1 };
                case "!=":
                    return { type: "NUMBER", value: lval != rval ? true : false, power: 1 };
                case ">":
                    return { type: "NUMBER", value: lval > rval ? true : false, power: 1 };
                case "<":
                    return { type: "NUMBER", value: lval < rval ? true : false, power: 1 };
                case "<=":
                    return { type: "NUMBER", value: lval <= rval ? true : false, power: 1 };
                case ">=":
                    return { type: "NUMBER", value: lval >= rval ? true : false, power: 1 };
                case "|":
                    return { type: "NUMBER", value: lval || rval ? true : false, power: 1 };
                case "&":
                    return { type: "NUMBER", value: lval && rval ? true : false, power: 1 };
                default:
                    console.error(`Unknown operator provided in operation: `, lhs, "&&", rhs)
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
    eval_identifier(ident) {
        if (this.Env.has_var(ident.value)) {
            const val = this.Env.get_var(ident.value);
            return val;
        } else {
            console.error("This AST node has not yet been setup for interpretation", ident);
            this.exit = true; return 0;

        }
    }
    eval_binary_expr(binop) {
        const lhs = this.interpret(binop.left);
        const rhs = this.interpret(binop.right);
        return this.eval_numeric_binary_expr(lhs, rhs, binop.opt);
    }
    eval_program(program) {
        let lastEvaluated = { type: "NULL", value: "null" };
        let res = ""
        for (const statement of program.value) {
            lastEvaluated = this.interpret(statement);
            lastEvaluated?.power == 1 ? res += lastEvaluated.value + "\n" : 0;
        }
        return res
    }
    eval_assignment(node) {
        if (node.assigne.type !== "IDENT") {
            console.error(`Invalid LHS inaide assignment expr `, node.assigne);
            this.exit = true; return 0;
        }
        const varname = (node.assigne).value;
        if (this.Env.has_var(varname)) {
            return this.Env.assign_var(varname, this.interpret(node.value));
        }
        else {
            this.interpret({ type: 'VAR_DEC', value: this.interpret(node.value), identifier: varname, grp: 'AST' })
        }
    }
    eval_var_program(declaration) {
        const value = declaration.value ? this.interpret(declaration.value, this.Env) : { type: "NULL", value: null };
        return this.Env.dec_var(declaration.identifier, value);
    }
    eval_body(body){
        let result = {value: "null",type:"NULL"};
        for (const stmt of body) {
            result = this.interpret(stmt);
        }
        return result;
    }
    eval_if_program(ast){
        let opt = this.eval_binary_expr(ast.test)
        if (opt.value) {
            return this.eval_body(ast.body)
        }
        console.log(opt.value == true? "yos true":"nah/uh");
        // return opt
    }
    constructor(ast, Env) {
        this.Env = Env
        this.ast = ast;
        this.exit = false
    }
    interpret(ast) {
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
                return this.eval_binary_expr(ast)
            case "VAR_DEC":
                return this.eval_var_program(ast)
            case "PROGRAM":
                return this.eval_program(ast)
            case "IF":
                return this.eval_if_program(ast)
            case "NULL":
                return null
            case "IDENT":
                return this.eval_identifier(ast)
            case "ASS":
                return this.eval_assignment(ast)
            default:
                console.error("This AST node has not yet been setup for interpretation", ast);
        }
    }
}