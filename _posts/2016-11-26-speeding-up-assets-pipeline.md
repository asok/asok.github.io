---
layout: post
title:  "Speeding up assets pipeline"
date:   2016-11-26 11:00:00 +0200
categories: rails
---

From some time on the project I'm working on I've observed that the compilation time of the rails assets became unbearably long. On my local machine calling `rake assets:precompile` takes 5 minutes, on the production system that was something around 10 minutes.

I've started digging into the problem, and it turned out that the minification of the javascripts takes so much time. The way the rails assets work it is using (by default) [uglifier-gem](https://github.com/lautis/uglifier). Uglifier uses ExecJS in order to evaluate the source code of [uglifier-js](https://github.com/mishoo/UglifyJS2). Then it is using it to compress the javascripts. Interesting and very handy infrastructure wise. You only need Ruby and bundler in order to install all dependencies and be able to minify the javascript files.
The big drawback is that it is very slow. Simply using `uglifier-js` command installed via npm resulted in almost 6 times faster compilation time. At least in my case.

Fortunately it's pretty easy to plugin into the processing of the assets pipeline. In your `config/production.rb` you can call `register_compressor` and pass it an object that responds to `call` and returns a processed content:

```rb
require 'open3'

class UglifiershCompressor
  #Stolen from uglifier gem
  DEFAULTS = {
    :sequences => true, # Allow statements to be joined by commas
    :properties => true, # Rewrite property access using the dot notation
    :dead_code => true, # Remove unreachable code
    :drop_debugger => true, # Remove debugger; statements
    :unsafe => false, # Apply "unsafe" transformations
    :conditionals => true, # Optimize for if-s and conditional expressions
    :comparisons => true, # Apply binary node optimizations for comparisons
    :evaluate => true, # Attempt to evaluate constant expressions
    :booleans => true, # Various optimizations to boolean contexts
    :loops => true, # Optimize loops when condition can be statically determined
    :unused => true, # Drop unreferenced functions and variables
    :hoist_funs => true, # Hoist function declarations
    :hoist_vars => false, # Hoist var declarations
    :if_return => true, # Optimizations for if/return and if/continue
    :join_vars => true, # Join consecutive var statements
    :cascade => true, # Cascade sequences
    :collapse_vars => false, # Collapse single-use var and const definitions when possible.
    :negate_iife => true, # Negate immediately invoked function expressions to avoid extra parens
    :pure_getters => false, # Assume that object property access does not have any side-effects
    :drop_console => false, # Drop calls to console.* functions
    :angular => false, # Process @ngInject annotations
    :keep_fargs => false, # Preserve unused function arguments
    :keep_fnames => false # Do not drop names in function definitions
  }.map { |(opt, val)| "#{opt}=#{val}" }.join(",")

  def self.call(input)
    Open3.capture2("uglifyjs --compress '#{DEFAULTS}' -", stdin_data: input[:data]).first
  end
end

Application.configure do
  # ...

  config.assets.configure do |env|
    env.register_compressor 'application/javascript', :uglifiersh, UglifiershCompressor
  end
  config.assets.js_compressor  = :uglifiersh
  config.assets.css_compressor = :sass

  # ...
end
```

Of course you need also `npm` and `uglifier-js` installed on your production server. On debian based linux distributions it's sufficient to do:

```sh
sudo apt-get install npm nodejs nodejs-legacy
sudo npm install --global uglifier-js
```
