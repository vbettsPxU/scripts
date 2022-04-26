import glob
import json
import csv

directory = "./"
pathname = directory + "/**/*.json"
files = glob.glob(pathname, recursive=True)

header = ['filename', 'Setting ID', 'Property', 'Content']
dataList = []

def processSettings(settings, block=False):
    data = []
    for setting in settings:
        if "id" in setting:
            settingID = setting["id"]
            if block:
                settingID = block + " block: " + settingID
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

for file in files:
    f = open(file)
    jsonData = json.load(f)
    processedSettings = processSettings(jsonData["settings"])
    currentFile = file.split("/")[2]

    dataList.append([currentFile, "", "", ""])
    for line in processedSettings:
        dataList.append(line)

    if "blocks" in jsonData:
        blockTitle = currentFile+" blocks"
        dataList.append([blockTitle, "", "", ""])
        blocks = jsonData["blocks"]

        for block in blocks:
            if block["type"] != "@app":
                dataList.append([file, "name", "block name", block["name"]])
                if "settings" in block:
                    blockData = processSettings(block["settings"], block["name"])
                    for line in blockData:
                        dataList.append(line)

with open('settings.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(dataList)


