---
layout: post
title:  "FormObject with ActiveRecord type casting"
date:   2016-08-08 8:41:00 +0200
categories: rails
---

# Form Object pattern

A FormObject pattern is an interesting approach for offloading a lot of business logic from models to another objects. The idea is simple - instead of a model you assign an `ActiveModel` object in the controller. This object is then used in the views for the call to `form_for`. The validation is placed there and any extra stuff that is linked more with the way the model should be presented than persisted. This way the it gets slimmer. And its only concern is to read and write to the database.

Such form object can look like this:

```ruby
class QuickRegistration
  include FormObject

  Attributes = [
    :email,
    :password,
    :password_confirmation
  ]

  define_attributes User, *Attributes

  validates_presence_of :email, :password, :password_confirmation
  validates_confirmation_of :password

  def initialize(attributes = {})
    assign_attributes(attributes)
  end
end
```

The `FormObject` itself would be a mixin:

```ruby
module FormObject
  extend ActiveSupport::Concern

  extend  ActiveModel::Naming
  include ActiveModel::Conversion
  include ActiveModel::Validations

  included do
    class_attribute :attribute_names
    class_attribute :model

    def self.define_attributes(*names)
      self.attribute_names = (attribute_names || []) + names.map(&:intern)
      self.model = model

      attribute_names.each do |name|
        define_method name do
          @attributes ||= {}
          @attributes[name.intern]
        end

        define_method "#{name}=" do |v|
          @attributes ||= {}
          @attributes[name.intern] = v
        end
      end
    end
  end

  def persisted?
    false
  end

  def errors_for(attribute)
    errors[attribute].join(', ') if errors.has_key?(attribute)
  end

  def assign_attributes(attributes)
    @attributes = attributes.slice(*self.class.attribute_names)
  end

  def attributes
    @attributes ||= {}
  end

  def persistable_attributes
    attributes.slice(*model.column_names.map(&:intern))
  end
end
```


In your controller instead of a model you assign a form object:

```ruby
class QuickRegistrationsController < ApplicationController
  def new
    @user = QuickRegistration.new
  end

  def create
    @user = QuickRegistration.new(params[:user])

    if @user.valid?
      User.create!(@user.persistable_attributes)
      redirect_to root_path, notice: "You have been registered"
    else
      render :new
    end
  end

  protected

  def user_params
    params.require(:user).permit(*QuickRegistration::Attributes)
  end
end
```

In the view you can do:

```erb
<%= form_for @user, url: quick_registration_path, as: :user do |f| %>
  <%= f.text_field :email %>
  <%= f.object.errors_for :email %>

  <%= f.text_field :password %>
  <%= f.object.errors_for :password %>

  <%= f.text_field :password_confirmation %>
  <%= f.object.errors_for :password_confirmation %>
<% end %>
```

Now, what if you have a different registration form in your app that captures the extra date of birth and the acceptance of terms?
You can create another form object that inherits from the old one:

```ruby
class FullRegistration < QuickRegistration
  Attributes = QuickRegistration::Attributes + [
    :date_of_birth,
    :terms_accepted
  ]

  define_attributes User, *Attributes

  validates_acceptance_of :terms_accepted
  validates_presence_of :date_of_birth
  validate :date_of_birth_in_the_past

  protected

  def date_of_birth_in_the_past
    errors.add(:date_of_birth, "have to be in the past") unless date_of_birth.try(:past?)
  end
end
```

Mind that we simply defined extra validation. When `valid?` will be called on this object it'll run the validation defined in both the parent and the child class.

One last thing we have to deal with is the type casting. Since the attributes coming from the controller are strings the `date_of_birth` will not have the method `past?`. The same `terms_accepted` will be either "0" or "1". The validation for the acceptance will always pass since all it does is checking if `terms_accepted` is not nil.

# Type casting

What we need here is a type casting of the `String` values to the correct types. We could do it by hand but why not re-use what `ActiveRecord` does in this matter?

Let's refine our `FormObject::define_attributes` method:

```ruby
def self.define_attributes(model, *names)
  self.attribute_names = (attribute_names || []) + names.map(&:intern)
  self.model = model

  if Rails::VERSION::STRING > '5'
    cast_method = :cast
  else
    cast_method = :type_cast_from_user
  end

  attribute_names.each do |name|
    define_method name do
      @attributes ||= {}
      @attributes[name.intern]
    end

    define_method "#{name}=" do |v|
      @attributes ||= {}

      column = model.columns.find{ |c| c.name.intern == name }

      @attributes[name.intern] = if column
                                   model.connection.type_map.fetch(column.sql_type).send(cast_method, v)
                                 else
                                   v
                                 end
    end
  end
end
```

In ActiveRecord 4.2 the method was called `type_cast_from_user` hence the check for the rails version.

# Conclusion

Of course the type casting will only work when the attribute defined on the form object has the same name as the column in the table. But I guess it's a sensible assumption to make.

I find this way of developing rails application more flexible than using the "canonical" MVC. Especially I like the fact that each of the form object maps to a different context in which a resource can be persisted. This way I have a lot of room for putting anything that is related to that given context in a form object instead of placing everything in the model.

The full working example of this implementation can be found [here](https://github.com/asok/form-object-demo).
