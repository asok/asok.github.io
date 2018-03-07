---
layout: post
title:  "Overwriting case equality method"
date:   2018-02-28 08:05:00 +0200
categories: ruby
---

The big part of my work in [gabi](https://www.gabi.com) is to process the data in form of the Ruby Hash. If some keys are present and have a particular value I have to apply some logic. The trouble here is that the Hash can hold multiple nested Hashes.
I've used to apply `if` statements with `Hash#has_key?` method which as you might guess resulted in an unreadable code. Hard to have a good sleep if you know that somewhere in your project there's a hairy code like that. So I've spent some time trying to rectify this situation.

Looking with envy at the Elixir's [pattern matching](https://elixir-lang.org/getting-started/case-cond-and-if.html) I wanted to have something similar. A way of specifying how a part of a Hash looks like, without going into details what the values are.

The idea that I came up with is to use the recently [covered](/ruby/2018/02/25/fun-with-case-equality-method.html) on my blog the case equality method.
After all the purpose of it is to overwrite it in your own class in order "to provide meaningful semantics in case statements".
When a value of a Hash is indiffirent I can "match" it against `Object` since everything in Ruby is an `Object`. Or use the ActiveSupport's `Object.present?` method.
The goal was to make this:

```ruby
if input["a"] &&
   input.fetch("b", {})["c"].present?
  #do something
elsif input.fetch("d", {})["e"]&.downcase == "no" ||
      input.fetch("d", {})["f"]&.downcase == "yes"
  #do something else
elsif input.fetch("g", 0) > 0
  #do something completely else
end
```

Look like this:

```ruby
case input
when Includes["a" => Object, "b" => {"c" => :present?.to_proc}]
  #do something
when Includes["d" => {"e" => /^no$/i}],
     Includes["d" => {"f" => /^yes$/i}]
  #do something else
when Includes["g" => -> v { v && v > 0 }]
  #do something completely else
end
```

The implementation that achieves it:

```ruby
module Includes
  def self.[](*args)
    arg, *rest = args

    if rest.empty?
      case arg
      when ::Hash
        Includes::Hash.new(arg)
      when ::Array
        Includes::Array.new(arg)
      else
        Includes::Array.new([arg])
      end
    else
      Includes::Array.new(args)
    end
  end

  class Abstract
    def initialize(obj)
      @obj = obj
    end

    def wrap(arg)
      case arg
      when ::Array
        Includes::Array.new(arg)
      when ::Hash
        Includes::Hash.new(arg)
      else
        arg
      end
    end
  end

  class Hash < Abstract
    def ===(other)
      case other
      when ::Hash, Hash
        if @obj.empty?
          @obj === other
        else
          @obj.all? do |(key, value)|
            other.has_key?(key) && wrap(value) === other[key]
          end
        end
      else
        @obj === other
      end
    end
  end

  class Array < Abstract
    def initialize(obj)
      @obj = obj
    end

    def ===(other)
      case other
      when ::Array, Array
        if @obj.empty?
          @obj === other
        else
          @obj.all? do |value|
            other.any? do |o|
              wrap(value) === o
            end
          end
        end
      else
        @obj === other
      end
    end
  end
end
```

It's not a full blown pattern matching library like [pattern-match](https://github.com/k-tsj/pattern-match). But it's small, simple and makes the job done.
