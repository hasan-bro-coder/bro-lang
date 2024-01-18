# bro-lang

bro-lang is an interpreted programming language made for a discord bot called [Dora](https://github.com/hasan-bro-coder/Discord-Bot)

![bro-lang-logo](https://github.com/hasan-bro-coder/bro-lang/blob/43947f00fc13e5e7209fcf9fedffd00750811281/bro-logo.png)
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
npx bro filename.bro
```

### syntax

bro-lang is made for fun so I made its syntax look like a lot of programming language
but bro-langs syntax is similar to javascript

```js
your_favorite_language = "python"

if (your_favorite_language == "python"){
    say("try me bro")
}fi if(your_favorite_language == "bro"){
    say("your better ,stonger, faster")
}
```

and you can replace { with do and } with end
also () are optional
# variables

you can declare a variable with the var keyword

```js
var i = 0;
```

or you can just remove the var keyword

```js
i = 0;
```

# Data Structures

there are 6 main data structures:

- string
- number
- bool
- objects
- arrays
- null

took me days to make
```py
i = "string" # string
i = 0        # number
i = true     # bool
i = null     # null
i = {}       # object
i = []       # array

```
they all work the same as they work in js
# statements

- # if statements:
  you can define if statements like this
  ```py
  i = 1
  if (i > 0)do 
      say("its a positive number")
  end fi if( i == 0 ){ # remember there is no else its fi
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
 anonymous function:
    ``` 
        sum = _(a,b){ return a + b }
        say("sum")
    ```

new features coming soon 😉

# Credits
- thanks to [tylerlaceby](https://github.com/tlaceby) for creating the [Guide to Interpreters](https://github.com/tlaceby/guide-to-interpreters-series)!
- inspired by [FaceDev](https://www.youtube.com/watch?v=pgeSGBwtHW8)

## Please give me a star ⭐
Created by hsn-bro-coder aka Hasan ☠