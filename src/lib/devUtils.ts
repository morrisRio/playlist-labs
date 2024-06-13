import { writeFileSync, existsSync } from "fs";

export const saveDummyData = async (obj: Object, title: string) => {
    if (!existsSync(`${title}.json`)) {
        writeFileSync(`${title}.json`, JSON.stringify(obj, null, 2));
        console.log("dummyData saved");
    }
    console.log("dummyData already exists");
};
