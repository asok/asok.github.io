---
layout: post
title:  "Sign in user with ExUnit tag"
date:   2016-08-03 18:07:39 +0200
categories: phoenix
---
Let's say that you have a JSON API with token based authentication. Such an app is described in this great [tutorial](https://blog.codeship.com/refactoring-faster-can-spell-phoenix/).

Now you want to be able to easily tag a particular test and run it within a context where a user is signed in.

In order to achieve this you can use ExUnit's [tags](http://elixir-lang.org/docs/stable/ex_unit/ExUnit.Case.html#module-tags).

Let's take the controller test from the tutorial and tag it:

```elixir
defmodule TodoApi.TodoControllerTest do
  use TodoApi.ConnCase

  alias TodoApi.Todo
  alias TodoApi.User
  alias TodoApi.Session

  @valid_attrs %{complete: true, description: "some content"}

  setup %{conn: conn, current_user: current_user} do #MIND THE NEW KEY
    {:ok,
     conn: put_req_header(conn, "accept", "application/json"),
     current_user: user }
  end

  @tag signed_in: "jane" #THE TAG
  test "creates and renders resource when data is valid", %{conn: conn, current_user: current_user} do
    conn = post conn, todo_path(conn, :create), todo: @valid_attrs
    assert json_response(conn, 201)["data"]["id"]
    todo = Repo.get_by(Todo, @valid_attrs)
    assert todo
    assert todo.owner_id == current_user.id
  end

  test "renders 401", %{conn: conn} do
    conn = post conn, todo_path(conn, :create), todo: @valid_attrs
    assert json_response(conn, 401)
    todo = Repo.get_by(Todo, @valid_attrs)
    refute todo
  end
end
```


We've used `@tag signed_in: "jane"` to tag the test. Also observe that the `setup` method now pattern matches on `:current_user` key. This key/value will be return by the `setup` method defined in `test/support/conn_case.ex`. It can look like that:

```elixir
defmodule TodoApi.ConnCase do

  # ...
  # deleted for breviety
  # ...

  def create_user(%{name: name}) do
    User.changeset(%User{}, %{email: "#{name}@example.com"}) |> Repo.insert!
  end

  def create_session(user) do
    Session.create_changeset(%Session{user_id: user.id}, %{}) |> Repo.insert!
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(TodoApi.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(TodoApi.Repo, {:shared, self()})
    end

    conn = Phoenix.ConnTest.build_conn()

    if tags[:signed_in] do
      user = create_user(tags[:signed_in])
      session = create_session(user)
      conn = Plug.Conn.put_req_header(conn,
               "authorization", "Token token=\"#{session.token}\"")

      {:ok, conn: conn, current_user: user}
    else
      {:ok, conn: conn, current_user: nil}
    end
  end
end
```
