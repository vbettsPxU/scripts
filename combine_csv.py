
with open('config_settings.csv', 'r') as f1:
    config = f1.read()

with open('section_settings.csv', 'r') as f2:
    section = f2.read()

with open('settings.csv', 'w') as final:
    final.write(config)
    final.write(section)
