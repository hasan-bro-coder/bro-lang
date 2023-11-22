# bro-lang

bro-lang is an interpreted programming language made for a discord bot called [Dora](https://github.com/hasan-bro-coder/bot)

## getting started

to compile bro code you can use:

```
npm install -g bro-lang
```

```
bro filename.bro
```
### or

```
npx bro
```

### syntax

bro-langs syntax is similar to javascript and lua

```js
your_favorite_language = "python"

if (your_favorite_language == "python"){
    say("try me bro")
}fi{
    say("you better ,stonger, faster")
}
```

# variables

you can declare a variable with var keyword

```js
var i = 0;
```

or you can just remove the var keyword

```js
i = 0;
```

# Data Strucutres

there are 4 main data structures:

- string
- number
- bool
- null

```py
i = "string" # string
i = 0        # number
i = true     # bool
i = null     # null
```

# statements

- # if statements:
  you can define if statements like this
  ```py
  i = 1
  if (i > 0){
      say("its a positive number")
  }fi if( i == 0 ){ # remember there is no else its fi
      say("the number is 0")
  }fi{
      say("its a negative number")
  }
  ```
- # loops:
    you can define if statements like this
    ```py
      i = 1
        loop(i < 100){
            say(i)
            i = i + 1
            if (i % 15 == 0) {
                say("fizzbuzz")
            }fi if(i % 3 == 0) {
                say("fizz")
            }fi if(i % 5 == 0) {
                say("buzz")
            }fi {say(i)}
        }
    ```
- # functions:
    ```py
    fun sum(a,b){
        a + b
    }
    say(sum(1,1))
    ```

# Credits
- thanks to [tylerlaceby](https://github.com/tlaceby) for creating the [Guide to Interpreters](https://github.com/tlaceby/guide-to-interpreters-series)!
- inspired by [FaceDev](https://www.youtube.com/watch?v=pgeSGBwtHW8)

Created with hsn-bro-coder aka Hasan ☠