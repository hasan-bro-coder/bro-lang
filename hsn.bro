# var i = 0 ;   
# loop(i < 25001){
#     say(i)
#     i = i + 1 
#     # if (i % 15 == 0) {
#     #     say("fizzbuzz")
#     # }
#     # fi if(i % 3 == 0) {
#     #     say("fizz")
#     # }
#     # fi if(i % 5 == 0) {
#     #     say("buzz")
#     # }
#     # fi {say(i)}
# }

# fun calc(hour){
#     return ((hour * 60) / 10) + " minutes"
# }

fun fizzer(){
    var i = 0 ;
    var res = "";   
    loop(i < 100){
        i = i + 1 
        if (i % 15 == 0) {
            res = res + "\n" + "fizzbuzz"
        }
        fi if(i % 3 == 0) {
            res = res + "\n" + "fizz"
        }
        fi if(i % 5 == 0) {
            res = res + "\n" + "buzz"
        }
        fi {
            # res = res + "\n" + i 
        }
    }
    return res
}


say(fizzer(6))


