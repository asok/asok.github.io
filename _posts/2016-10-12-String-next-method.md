---
layout: post
title:  "Ruby's String#next"
date:   2016-10-12 11:00:00 +0200
categories: ruby
---

After ~6 years of writing in Ruby I got to know it pretty well. I'm not saying that I'm alpha and the omega of Ruby. But I'm familiar with most of the idiomatic ways of doing things, the standard library, gems and features of the language. To such extent that I was certain that nothing will really surprise me. Well I was wrong.

# Incrementing a number

I was faced with a simple task of incrementing number in a String. The number was always placed in the end. So after some time I came with such solution:

```rb
match = "Terminator 1".match(/^(.+)([0-9]){0,}$/)
[match[1], match[2].to_i + 1].join
```

That was working. So I've commited by change and I wanted to merge with other branch. It turned out that my colleague already worked on that piece of code and he came up with a different solution. He simply called [`next`](https://ruby-doc.org/core-2.2.0/String.html#method-i-next) method on the String.

What's `String#next`? I went to the documentation:

> Returns the successor to str. The successor is calculated by incrementing characters starting from the rightmost alphanumeric

It's incrementing the characters based on the ASCII table.
That means that if the rightmost character is a digit it will increment the digit. That's what I needed:

```rb
"Terminator 1".next #=> "Terminator 2"
```

If the last character is not a digit it will "increment" the character:

```rb
"Terminator".next #=> "Terminatos"
"Terminator!".next #=> "Terminatos!"
```

In the last example the method skipped the `"!"` character because it's not an alphanumeric. But when only alphanumeric are present:

```rb
"!".next #=> "\""
```

It also has a concept of "carry":

```rb
"Terminator 99".next #=> "Terminator 100"
```

Almost a "jaw dropping" moment for me. Just when I thought I'll never get such a feeling in Ruby again.
