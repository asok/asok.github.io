---
layout: post
title:  "Configuring Magithub"
date:   2018-05-09 14:47:00 +0200
categories: emacs
---

Literally few minutes ago I've managed to setup [magithub](https://github.com/vermiculus/magithub). And I love it!
Had a little time to play with it more but creating/editing/deleting issues work excellently. This was the feature I was lacking the most from my Emacs experience.

But before playing with it more I want stop and blog how to configure it. Since I'm using 2 factor authentication on github and I'm on OSX things might not be so simple.
Those instructions might prove to be useful in future.

## Generate a personal token in github

First, as the magithub's documentation instructs, generate a personal token in https://github.com/settings/tokens. The required scopes are `repo`, `notifications` and `user`.

Store it as a plain text under `~/.authinfo`:

```
machine api.github.com login YOUR_GITHUB_USERNAME^magithub password YOUR_GITHUB_TOKEN
```

Replace `YOUR_GITHUB_USERNAME` the github's login and `YOUR_GITHUB_TOKEN` with the just generated token.

## Install magithub

```
(package-install 'magithub)

(use-package magithub
  :after magit
  :ensure t
  :config (magithub-feature-autoinject t))
```

Now it is possible to use magithub. Open the magit status buffer in a any repo that has origin pointing to [github.com](https://github.com). The list of issue should be visible from the magit's status buffer:

![Magithub](/images/magithub.png)

## Encrypting the token

# GPG setup

For security reasons the token should not be stored in a plain text file.
I've managed to encrypt it and have it manually decrypted using `gpg2` package from Homebrew.

```
brew install gpg2
```

Generate a key:

```
gpg --gen-key
```

You'll need to provide some data and a password. Note: if there's an error "Inappropriate ioctl for device" at this step try the workaround mentioned [here](https://github.com/Homebrew/homebrew-core/issues/14737#issuecomment-309547412).


# Encryption

In Emacs do `M-x epa-encrypt-file` and point to the file `~/.authinfo`. A new buffer with the list of keys will open:

![epa-encrypt-file](/images/epa-encrypt-file.png)

Put the cursor at the key's line and call `epa-mark-key` command. To finish hit `RET` on the OK button.

A pop up window asking for the password should show. Just input the password that was used when generating this key and you're good to go.

A new encrypted file `~/.authinfo.gpg` should be created.

# Tidy up

Remove the old `~/.authinfo`.
