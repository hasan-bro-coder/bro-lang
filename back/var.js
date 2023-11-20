export class ENV{
    constructor(){
        this.vars = new Map();
        this.funcs = new Map();
    }
    dec_var(name,value){
        if (this.vars.has(name)) throw "variable already exists bro"
        this.vars.set(name,value);
        return value;
    }
    assign_var(name,value){
        if (!this.vars.has(name)) throw "variable is undifined bro"
        this.vars.set(name,value);
        return this.vars.get(name);
    }
    has_var(name){
        let val = this.vars.get(name)
        return val ? true : false;
    }

    get_var(name){
        let val = this.vars.get(name)
        if (val) {
            return val;
        }
        throw "variable "+ val+" aint exists bro";
    }
    add_func(ast){
        this.funcs.set(ast.name, ast)
    }
    run_func(name){
        return this.funcs.get(name)
    }
}