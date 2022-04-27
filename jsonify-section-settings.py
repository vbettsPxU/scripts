import csv
import json


final_dict = {"settings_schema": {}, "sections": {}}
with open("settings.csv", 'r') as settings:
    data = csv.DictReader(settings, delimiter=",")
    for row in data:
        sectionId = row["section_name"]
        blockId = row["block_name"]
        settingId = row["setting_id"]
        settingLevel = row["level"]
        settingType = row["type"]
        settingProperty = row["property"]
        settingContent = row["content"]

        if settingLevel in final_dict:
            settings_dict = final_dict[settingLevel]
        else:
            settings_dict = final_dict["sections"]

        if sectionId not in settings_dict:
            headerCount = 0
            settings_dict[sectionId] = {}

        if settingLevel in final_dict:
            if settingProperty == "section name":
                settings_dict[sectionId]["name"] = settingContent
                continue
            else:
                if settingType == "header":
                    headerCount += 1
                    settingId = "header_"+str(headerCount)

                if settingId not in settings_dict[sectionId]:
                    settings_dict[sectionId][settingId] = {}

                settings_dict[sectionId][settingId][settingProperty] = settingContent
        elif settingLevel == "blocks":
            if "blocks" not in settings_dict[sectionId]:
                blockHeaderCount = 0
                settings_dict[sectionId]["blocks"] = {}

            if settingProperty == "block name":
                settings_dict[sectionId]["name"] = settingContent
                continue
            else:
                if settingType == "header":
                    blockHeaderCount += 1
                    settingId = "header_"+str(blockHeaderCount)

                if settingId not in settings_dict[sectionId]["blocks"]:
                    settings_dict[sectionId]["blocks"][settingId] = {}

                settings_dict[sectionId]["blocks"][settingId][settingProperty] = settingContent

        elif settingLevel == "presets":
            if "presets" not in settings_dict[sectionId]:
                settings_dict[sectionId]["presets"] = {}

            settings_dict[sectionId]["presets"][settingProperty] = settingContent



with open("sample.json", "w") as outfile:
    json.dump(final_dict, outfile, indent=2 )
