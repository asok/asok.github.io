---
layout: post
title:  "Fun with the case equality method"
date:   2018-02-25 15:45:00 +0200
categories: ruby
---

Recently I've got accustomed to use the case equality method more often during my daily routines - that is writing a Rails application. I find it more readable than using plain `if`s.
For example when I have a pair of two dates and I expect that one or both can be a nil:

```ruby
def from_to(from, to)
  from, to = parse_date(from), parse_date(to)

  case [from.nil?, to.nil?]
  when [false, false] then [from, to]
  when [true, true]   then [Date.current, Date.current]
  when [false, true]  then [from, from + 1.day]
  when [true, false]  then [to - 1.day, to]
  end
end

def parse_date(value)
  case value
  when Date, DateTime
    value
  when nil, '' # the command character `,` is like an OR operator here
    nil
  when 'today'
    Date.current
  when 'yesterday'
    Date.yesterday
  when 'tomorrow'
    Date.tomorrow
  when /^\d{4}-\d{2}-\d{2}$/
    Date.strptime(value, "%Y-%m-%d")
  when String
    raise ArgumentError, "YYYY-MM-DD is the expected format "
  else
    raise ArgumentError, "#{value} is not supported"
  end
end

from, to = from_to(params[:from], params[:to])
Policy.create!(from: from, to: to)
```

As you can see in the example the method [Object#===](https://docs.ruby-lang.org/en/2.5.0/Object.html#method-i-3D-3D-3D) is overwritten in various classes.

* [Regexp#===](https://docs.ruby-lang.org/en/2.5.0/Regexp.html#method-i-3D-3D-3D) is comparing against the value.
* [Module#===](https://docs.ruby-lang.org/en/2.5.0/Module.html#method-i-3D-3D-3D) is checking if the value is of that type.
* [Proc#===](https://docs.ruby-lang.org/en/2.5.0/Proc.html#method-i-3D-3D-3D) calls it with the object being compared as the argument.
* [Range#===](https://docs.ruby-lang.org/en/2.5.0/Range.html#method-i-3D-3D-3D) does what you would expect - it checks if the value is within that range.

In case of `Class#===` and `Array#===` it is not overwritten so effectively it's the same as [Object#===](https://docs.ruby-lang.org/en/2.5.0/Object.html#method-i-3D-3D-3D) (it calls `Object#==`).

```ruby
def sanitize_age(value)
  case value
  when nil
    raise ArgumentError, "age is blank"
  when :negative?.to_proc
    raise ArgumentError, "age is less than 0"
  when 0
    raise ArgumentError, "age is 0"
  when 1...18
    raise ArgumentError, "age is under 18"
  when -> v { !v.integer? }
    value.to_i
  else
    value
  end
end

User.create!(age: sanitze_age(params[:age]))
```

Don't forget that you can use the splat operator to compare against any of the elements of an `Array`:

```ruby
UNSOPPORTED_STATES = ["CA", "NY"]

def ensure_valid_state(value)
  case value
  when :blank?.to_proc
    raise ArgumentError, "state is blank"
  when *UNSUPPORTED_STATES
    raise ArgumentError, "#{state} is not supported"
  else
    value
  end
end

Carrier.create!(state: ensure_valid_state(params[:state]))
```

If you want to experiment just use the console:
```
irb(main):001:0> (1...18) === 17
=> true
```

Despite being a well known feature the case quality method is not being used so much in the wild. I think that developers could reach for it it more often as it makes your code more readable and prettier at the same time.
