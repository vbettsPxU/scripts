TODO: FILL IN

In VIM, you can add the `exclude` braces used by [gengo.com](https://gengo.com/) around all the JSON keys with the following command:

```
:%s/"\(.*\)\":/"[[[\1]]]":/g
```

With this bit of formatting, I think we can submit a text file like [this one](examples/editions-schema-translations.txt) to Gengo for translation.
