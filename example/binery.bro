func dec_to_bin(num){
    var res = ""
    loop(num > 0 ){
        if(num % 2 == 0){
            res += "0"
            num /= 2
        }fi {
            res += "1"
            num = (num - 1) / 2
        }
    }
    return STRING.revers(res)
};