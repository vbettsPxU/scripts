import glob
import json
import csv


def processSettings(settings, name):
    data = []
    for setting in settings:
        level = "settings_schema"
        settingType = setting["type"]
        sectionName = name
        if "id" in setting:
            settingID = setting["id"]
            settingLabel = setting["label"]
            settingProperty = "label"
            line = [file, settingID, level, sectionName, "", settingType, settingProperty, settingLabel]
            data.append(line)

            if "info" in setting:
                settingProperty = "info"
                settingInfo = setting["info"]
                line = [file, settingID, level, sectionName, "", settingType, settingProperty, settingInfo]
                data.append(line)

            if setting["type"] == "select":
                options = setting["options"]
                count = 1
                for option in options:
                    settingProperty = "option_" + str(count)
                    settingLabel = option["label"]
                    line = [file, settingID, level, sectionName, "", settingType, settingProperty, settingLabel]
                    data.append(line)
                    count+=1
        else:
            settingID = setting["type"]
            settingLabel = setting["content"]
            settingProperty = "content"
            line = [file, settingID, level, sectionName, "", settingType, settingProperty, settingLabel]
            data.append(line)
    return data

directory = "./"
pathname = directory + "settings_schema.json"
files = glob.glob(pathname, recursive=True)

header = ['filename', 'setting_id', 'level', 'section_name', 'block_name', 'type', 'property', 'content']
dataList = []

for file in files:
    f = open(file)
    jsonData = json.load(f)
    for group in jsonData:
        if "settings" in group:
            formattedGroupName = group["name"].replace(" ", "_").lower()
            dataList.append([file, "name", "settings_schema", formattedGroupName , "", "", "name", group["name"]])

            processedSettings = processSettings(group["settings"], formattedGroupName)
            for line in processedSettings:
                dataList.append(line)


with open('config_settings.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(dataList)


