## Note:
You may need to install python on your machine to run these. If you use Homebrew:

```
$ brew install python
```

With `parse_schema.py` in the `theme/source/config` directory, run

```
$ python3 parse_schema.py
```

Which will generate [config_settings.csv](examples/config_settings.csv)

With `parse_section_settings.py` in `theme/source/sections` directory, run

```
$ python3 parse_section_settings.py
```

Which will generate [section_settings.csv](examples/section_settings.csv)

Move both of those files to the same directory, and run

```
$ python3 combine_csv.py
$ python3 jsonify-section-settings.py
```

These will generate `settings.csv` (a combined file of the two previous CSVs) and [en.default.schema.json](examples/en.default.schema.json), respectively

In VIM, you can add the `exclude` braces used by [gengo.com](https://gengo.com/) around all the JSON keys with the following command:

```
:%s/"\(.*\)\":/"[[[\1]]]":/g
```
