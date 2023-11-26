fun calcResult(total,most,least){
    var mark  = ((most - least) / total)*100 ;
    var result = " ";
    if(mark == 100){
       result = "Upgrading"
    }fi if(mark >= 50){
       result = "Achieving"
    }fi if(mark >= 25){
       result = "Advancing"
    }fi if(mark >= 0){
       result = "Activating"
    }fi if(mark >= -25){
       result = "Exploring"
    }fi if(mark >= -50){
       result = "Developing"
    }fi if(mark == -100){
       result = "Elementary"
    }
    "Mark: "+ mark + "\nResult: " + result
}

say(calcResult(10,3,5))