---
layout: post
title:  "Living without url helpers"
date:   2018-08-12 08:38:00 +0200
categories: rails
---

# The problem

I'm doing rails development on and off for about 8 years now. And to be honest I often struggle to remember what is the url helper for such route:

```rb

resources :users do
  resources :posts do
    resources :tags do
      member do
        put :foo
      end
    end
  end
end
```

If I want to route to the `foo` action of the `tags_controller` scoped under posts and users, is it:
```rb
foo_users_posts_tag_path(params[:user_id], params[:post_id], params[:id])
```

or is it this:
```rb
users_posts_tag_foo_path(params[:user_id], params[:post_id], params[:id])
```

In such situation I have to resort to running `rake routes`.

# The solution

With use of [ActionDispatch::Routing::UrlFor#url_for](https://api.rubyonrails.org/v5.1/classes/ActionDispatch/Routing/UrlFor.html) I can write a generic helper that decodes the common rails nomenclature of the controller's actions (ie. `"users#index"` as for index action of users controller).

```rb
class ApplicationController < ActionController::Base
  helper_method :url_for!

  def url_for!(name, parameters = {})
    controller, action = name.split("#")
    url_for({controller: "/#{controller}", action: action}.merge(parameters))
  end
end

# and in the view or other controller

url_for!("tags#foo",
         user_id:   params[:user_id],
         post_id:   params[:post_id],
         id:        params[:id],
         any_other: "optional param")
```

Maybe it's a bit more to write, but it's far simpler to use.
