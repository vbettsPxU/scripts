import glob
import json
import csv


def processSettings(settings, name):
    data = []
    for setting in settings:
        if "id" in setting:
            settingID = setting["id"]
            settingLabel = setting["label"]
            settingProperty = "label"
            line = [file, settingID, settingProperty, settingLabel]
            data.append(line)

            if "info" in setting:
                settingProperty = "info"
                settingInfo = setting["info"]
                line = [file, settingID, settingProperty, settingInfo]
                data.append(line)

            if setting["type"] == "select":
                options = setting["options"]
                for option in options:
                    settingID = setting["id"]+"["+option["value"]+"]"
                    settingProperty = "option label"
                    settingLabel = option["label"]
                    line = [file, settingID, settingProperty, settingLabel]
                    data.append(line)
        else:
            settingID = setting["type"]
            settingLabel = setting["content"]
            settingProperty = "content"
            line = [file, settingID, settingProperty, settingLabel]
            data.append(line)
    return data

directory = "./"
pathname = directory + "settings_schema.json"
files = glob.glob(pathname, recursive=True)

header = ['filename', 'Setting ID', 'Property', 'Content']
dataList = []

for file in files:
    f = open(file)
    jsonData = json.load(f)
    for group in jsonData:
        if "settings" in group:
            dataList.append([group["name"], "", "", ""])
            dataList.append([file, "name", "group name", group["name"]])

            processedSettings = processSettings(group["settings"], group["name"])
            for line in processedSettings:
                dataList.append(line)


with open('settings.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(dataList)


