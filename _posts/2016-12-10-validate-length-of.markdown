---
layout: post
title:  "Smart maximum of LenghtValidator"
date:   2016-12-10 04:16:00 +0200
categories: ruby
---

`ActiveModel` comes with a handy `validates_length_of` helper which, as the name suggests, checks if the length of the attribute is correct. You pass a `maximum` option to specify the maximum length. And normally you hardcode this value. In case you change your column width in the underlying database you might forget to update this value.

Instead of a hardcoded maximum it is possible to get the width of the column and use that value. That way it is always correct.

```ruby
validates_length_of :comment_body,
                    maximum: columns.detect{ |c| c.name == "comment_body" }.limit,
                    tokenizer: -> b { b.bytes } if table_exists?
```

The `tokenizer` option is there so we make sure that we count bytes and not characters in the string (the Unicode characters can take more than 1 byte).
The `if` statement is needed so it's possible to run the rake task for creating the database (at that point there would be no table and we would get an error).
