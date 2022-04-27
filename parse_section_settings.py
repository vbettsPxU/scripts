import glob
import json
import csv

directory = "./"
pathname = directory + "/**/*.json"
files = glob.glob(pathname, recursive=True)

header = ['filename', 'Setting ID', 'Section/Block', 'Type', 'Property', 'Content']
dataList = []

def processSettings(settings, block=False):
    data = []
    for setting in settings:
        if "id" in setting:
            settingID = setting["id"]
            level = "sections"
            if block:
                settingID = block + " block: " + settingID
                level = "blocks"
            settingLabel = setting["label"]
            settingProperty = "label"
            settingType = setting["type"]
            line = [file, settingID, level, settingType, settingProperty, settingLabel]
            data.append(line)

            if "info" in setting:
                settingProperty = "info"
                settingInfo = setting["info"]
                line = [file, settingID, level, settingType, settingProperty, settingInfo]
                data.append(line)

            if setting["type"] == "select":
                options = setting["options"]
                for option in options:
                    settingID = setting["id"]+"["+option["value"]+"]"
                    settingProperty = "option label"
                    settingLabel = option["label"]
                    line = [file, settingID, level, settingType, settingProperty, settingLabel]
                    data.append(line)
        else:
            settingID = setting["type"]
            settingLabel = setting["content"]
            level = "sections"
            if block:
                settingID = block + " block: " + settingID
                level = "blocks"
            settingProperty = "content"
            line = [file, settingID, level, setting["type"], settingProperty, settingLabel]
            data.append(line)
    return data

for file in files:
    f = open(file)
    jsonData = json.load(f)
    processedSettings = processSettings(jsonData["settings"])
    currentSection = jsonData["name"]

    dataList.append([currentSection, "", "", ""])
    for line in processedSettings:
        dataList.append(line)

    if "blocks" in jsonData:
        blockTitle = currentSection+" blocks"
        dataList.append([blockTitle, "", "", ""])
        blocks = jsonData["blocks"]

        for block in blocks:
            if block["type"] != "@app":
                dataList.append([file, "name", "block", "name", "block name", block["name"]])
                if "settings" in block:
                    blockData = processSettings(block["settings"], block["name"])
                    for line in blockData:
                        dataList.append(line)
    if "presets" in jsonData:
        presetsTitle = currentSection+" presets"
        dataList.append([presetsTitle, "", "", ""])
        presets = jsonData["presets"]
        for preset in presets:
            line1 = [file, preset["name"], "presets", "category", "category", preset["category"]]
            line2 = [file, preset["name"], "presets", "name", "name", preset["name"]]
            dataList.append(line1)
            dataList.append(line2)

with open('settings.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(dataList)
