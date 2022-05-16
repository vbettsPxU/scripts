import csv
import glob
import json
import os

def process_schema_settings(file, settings, name):
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

            if "options" in setting:
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


def parse_schema_settings():
    directory = "./config/"
    pathname = directory + "settings_schema.json"
    if not os.path.exists(pathname):
        return

    files = glob.glob(pathname, recursive=True)

    header = ['filename', 'setting_id', 'level', 'section_name', 'block_type', 'type', 'property', 'content']
    dataList = []

    for file in files:
        f = open(file)
        jsonData = json.load(f)
        for group in jsonData:
            if "settings" in group:
                formattedGroupName = group["name"].replace(" ", "_").lower()
                dataList.append([file, "name", "settings_schema", formattedGroupName , "", "", "name", group["name"]])

                processedSettings = process_schema_settings(file, group["settings"], formattedGroupName)
                for line in processedSettings:
                    dataList.append(line)


    with open('config_settings.csv', 'w', encoding='UTF8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(dataList)


def process_section_settings(file, settings, section, block=False):
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

            if "options" in setting:
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

            if "info" in setting:
                settingProperty = "info"
                settingInfo = setting["info"]
                line = [file, settingID, level, sectionName, blockName, settingType, settingProperty, settingInfo]
                data.append(line)
    return data

def parse_section_settings():
    directory = "./sections/"
    pathname = directory + "/**/*.json"
    files = glob.glob(pathname, recursive=True)

    header = ['filename', 'setting_id', 'level', 'section_name', 'block_type', 'type', 'property', 'content']
    dataList = []

    for file in files:
        f = open(file)
        jsonData = json.load(f)
        currentSection = jsonData["name"].replace(" ", "_").lower()
        line = [file, "name", "sections", currentSection, "", "name", "section name", jsonData["name"]]
        dataList.append(line)

        processedSettings = process_section_settings(file, jsonData["settings"], currentSection)
        for line in processedSettings:
            dataList.append(line)

        if "blocks" in jsonData:
            blockTitle = currentSection+" blocks"
            blocks = jsonData["blocks"]

            for block in blocks:
                if block["type"] != "@app":
                    formattedType = block["type"].replace(" ", "_").lower()
                    dataList.append([file, "name", "blocks", currentSection, formattedType, "name", "block name", block["name"]])
                    if "settings" in block:
                        blockData = process_section_settings(file, block["settings"], currentSection, formattedType)
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

def combine_csv():
    with open('config_settings.csv', 'r') as f1:
        config = f1.read()

    with open('section_settings.csv', 'r') as f2:
        section = f2.read()

    with open('settings.csv', 'w') as final:
        final.write(config)
        final.write(section)

def jsonify_setting_fields():
    final_dict = {"settings_schema": {}, "sections": {}}
    with open("settings.csv", 'r') as settings:
        data = csv.DictReader(settings, delimiter=",")
        for row in data:
            sectionId = row["section_name"]
            blockId = row["block_type"]
            settingId = row["setting_id"]
            settingLevel = row["level"]
            settingType = row["type"]
            settingProperty = row["property"]
            settingContent = row["content"]

            if not settingContent:
                continue

            if settingLevel in final_dict:
                settings_dict = final_dict[settingLevel]
            else:
                settings_dict = final_dict["sections"]

            if sectionId not in settings_dict:
                headerCount = 0
                paraCount = 0
                settings_dict[sectionId] = {}

            if settingLevel in final_dict:
                if settingLevel == "settings_schema" and settingProperty == "name":
                    settings_dict[sectionId]["name"] = settingContent
                    continue

                if settingProperty == "section name":
                    settings_dict[sectionId]["name"] = settingContent
                    continue
                else:
                    if settingType == "header":
                        headerCount += 1
                        settingId = "header_"+str(headerCount)
                    if settingType == "paragraph":
                        paraCount += 1
                        settingId = "paragraph_"+str(paraCount)

                    if settingId not in settings_dict[sectionId]:
                        settings_dict[sectionId][settingId] = {}

                    settings_dict[sectionId][settingId][settingProperty] = settingContent
            elif settingLevel == "blocks":
                if "blocks" not in settings_dict[sectionId]:
                    blockHeaderCount = 0
                    blockParaCount = 0
                    settings_dict[sectionId]["blocks"] = {}

                if blockId not in settings_dict[sectionId]["blocks"]:
                    settings_dict[sectionId]["blocks"][blockId] = {}

                if settingProperty == "block name":
                    settings_dict[sectionId]["blocks"][blockId]["name"] = settingContent
                    continue

                else:
                    if settingType == "header":
                        blockHeaderCount += 1
                        settingId = "header_"+str(blockHeaderCount)

                    if settingType == "paragraph":
                        paraCount += 1
                        settingId = "paragraph_"+str(blockParaCount)

                    if settingId not in settings_dict[sectionId]["blocks"][blockId]:
                        settings_dict[sectionId]["blocks"][blockId][settingId] = {}

                    settings_dict[sectionId]["blocks"][blockId][settingId][settingProperty] = settingContent

            elif settingLevel == "presets":
                if "presets" not in settings_dict[sectionId]:
                    settings_dict[sectionId]["presets"] = {}

                settings_dict[sectionId]["presets"][settingProperty] = settingContent



    with open("en.default.schema.json", "w") as outfile:
        json.dump(final_dict, outfile, indent=2 )

def cleanup():
    os.remove("settings.csv")
    os.remove("config_settings.csv")
    os.remove("section_settings.csv")


parse_schema_settings()
parse_section_settings()
combine_csv()
jsonify_setting_fields()
cleanup()
