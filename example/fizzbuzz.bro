var i = 0 ;   

loop(i < 100){
    say(i)
    i = i + 1 
    if (i % 15 == 0) {
        say("fizzbuzz")
    }
    fi if(i % 3 == 0) {
        say("fizz")
    }
    fi if(i % 5 == 0) {
        say("buzz")
    }
    fi {say(i)}
}