# Bulb Chain

Bulb Chain is a toy language made to improve my TypeScript programming skill.

## Language Syntax

### Short Example

``` bsc
@MySpace (This defines a namespace.)
[
    @Proc1{++++}
    @Proc2{===}
]

(This defines an alias for a namespace.)
@My<.../MySpace>

("Main" procedure will be
 displayed through the console.)
@Main{ <My/Proc1>----<My/Proc2>---- }
```

### Bulb's Behavior

* when signal is true or false
  * "-" :
    * (signal, bulb) <- (bulb, signal)
  * "~" :
    * (signal, bulb) <- (bulb, not signal)
  * "+" :
    * (signal, bulb) <- (bulb, signal xnor bulb)
  * "=" :
    * (signal, bulb) <- (bulb, signal xor bulb)
  * "|" :
    * (signal, bulb) <- (undefined, signal)
  * "$" :
    * (signal, bulb) <- (undefined, not signal)
  * ":" :
    * (signal, bulb) <- (if(signal is bulb) then(bulb) else(undefined), signal)

* when signal is undefined
  * "|" or "$" :
    * (signal, bulb) <- (bulb, bulb)
  * others :
    * (signal, bulb) <- (undefined, bulb)

## Code Test

Menu Bar - View - Command Palette - Bulb Chain: Run

Then the result will be displayed on the console. Press any number to toggle the input bit, any alphabet to toggle the flow direction, or ESC to quit the program.

-----------------------------------------------------------------------------------------------------------
