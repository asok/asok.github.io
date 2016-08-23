---
layout: post
title:  "notification after finished spec run"
date:   2016-08-22 18:56:00 +0200
categories: emacs
---

Recently I've setup my emacs to make my OS display a notification when a spec run finished. This way I could fire up a long running specs using the [rspec-mode](https://github.com/pezra/rspec-mode) and switch to my browser in order to watch the stream from the Olympic games :) Once the process ended I got the notification to get back to work.

```elisp
(add-to-list 'compilation-finish-functions
               (lambda (buffer result)
                 (shell-command (concat "kdialog --passivepopup 'The compilation have ended " result "' 20"))))
```

In fact `compilation-finish-functions` is a variable used by `compilation-mode` which `rspec-mode` derives from. So this setup should work for anything that run process using `compile` function.

Also mind that this only works in KDE, if you're using something else you'll have to find command which displays a custom notifications.
