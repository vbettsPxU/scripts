import glob
import json
import csv

directory = "./"
pathname = directory + "/**/*.json"
files = glob.glob(pathname, recursive=True)

header = ['filename', 'setting_id', 'level', 'section_name', 'block_name', 'type', 'property', 'content']
dataList = []

def processSettings(settings, section, block=False):
    data = []
    for setting in settings:
        blockName = ""
        sectionName = section
        level = "sections"
        if "id" in setting:
            settingID = setting["id"]
            if block:
                level = "blocks"
                blockName = block

            settingLabel = setting["label"]
            settingProperty = "label"
            settingType = setting["type"]
            line = [file, settingID, level, sectionName, blockName, settingType, settingProperty, settingLabel]
            data.append(line)

            if "info" in setting:
                settingProperty = "info"
                settingInfo = setting["info"]
                line = [file, settingID, level, sectionName, blockName, settingType, settingProperty, settingInfo]
                data.append(line)

            if setting["type"] == "select":
                options = setting["options"]
                count = 1
                for option in options:
                    settingProperty = "option_" + str(count)
                    settingLabel = option["label"]
                    line = [file, settingID, level, sectionName, blockName, settingType, settingProperty, settingLabel]
                    data.append(line)
                    count+=1
        else:
            settingID = setting["type"]
            settingLabel = setting["content"]
            level = "sections"
            if block:
                level = "blocks"
                blockName = block
            settingProperty = "content"
            line = [file, settingID, level, sectionName, blockName, setting["type"], settingProperty, settingLabel]
            data.append(line)
    return data

for file in files:
    f = open(file)
    jsonData = json.load(f)
    currentSection = jsonData["name"].replace(" ", "_").lower()
    line = [file, "name", "sections", currentSection, "", "name", "section name", jsonData["name"]]
    dataList.append(line)

    processedSettings = processSettings(jsonData["settings"], currentSection)
    for line in processedSettings:
        dataList.append(line)

    if "blocks" in jsonData:
        blockTitle = currentSection+" blocks"
        blocks = jsonData["blocks"]

        for block in blocks:
            if block["type"] != "@app":
                formattedName = block["name"].replace(" ", "_").lower()
                dataList.append([file, "name", "block", currentSection, formattedName, "name", "block name", block["name"]])
                if "settings" in block:
                    blockData = processSettings(block["settings"], currentSection, formattedName)
                    for line in blockData:
                        dataList.append(line)
    if "presets" in jsonData:
        presetsTitle = currentSection+" presets"
        presets = jsonData["presets"]
        for preset in presets:
            line1 = [file, preset["name"], "presets", currentSection, "", "category", "category", preset["category"]]
            line2 = [file, preset["name"], "presets", currentSection, "", "name", "name", preset["name"]]
            dataList.append(line1)
            dataList.append(line2)

with open('section_settings.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(dataList)
