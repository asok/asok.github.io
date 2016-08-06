---
layout: post
title:  "evil-open-below for smartparens"
date:   2016-08-03 18:07:39 +0200
categories: emacs
---
There's an vim/evil command that I use often and is named `evil-open-below`. It's bound to `o` in normal state. What it does it starts a new line below the current one, moves the point at the beginning of it and switches to the inster state. Really simple and really useful. Often when writing lisp I wanted to open the new line but stay inside the current expression. Using smartparens it was quite easy to achieve what I wanted. Look at this:

```elisp
(defun sp-open-below ()
    (interactive)
    (sp-end-of-sexp)
    (newline-and-indent)
    (evil-insert-state))
```

Also it's a good idea to defing it as an evil command so you can use the dot for repeating it:

```elisp
(evil-define-command sp-open-below-command ()
         :repeat t
         (sp-open-below))
```

And bind it to "M-o":

```elisp
(evil-define-key 'normal smartparens-mode-map
         (kbd "M-o") #'asok/sp-open-line-below-sexp-command)
```

The command in action:

![Command in action gif](/images/open-below.gif)
