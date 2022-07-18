//Create an uuid, and make it persistent.
import {MMKVLoader, useMMKVStorage} from "react-native-mmkv-storage";
import generateRandomUUID from "./uuid"

const storage = new MMKVLoader().withInstanceID("settings").initialize();

const ID_KEY = "ID";
async function getId(){
	let id = await storage.getStringAsync(ID_KEY);
	if (typeof id !== "string"){
		id = generateRandomUUID();
		await storage.setStringAsync(ID_KEY, id)
	}
	return id;
}

/**@deprecated used only for debugging*/
function resetId(){
	storage.removeItem(ID_KEY)
}
const ID = {
	getId, resetId
};
Object.freeze(ID);
export {getId};
export default ID;