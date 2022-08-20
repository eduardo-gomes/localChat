import RNFS from "react-native-fs";
import { File } from "./messageTransmitter";
import { FileDataMessage } from "./netMessages";

const BLOCK_LENGTH = 1536;//2048 in base64

function createFilePath(uid: string, id: string, name: string) {
	const folder = `${RNFS.DocumentDirectoryPath}/${uid}/${id}`;
	RNFS.mkdir(folder).then(console.log).catch(console.error);
	const path = `${folder}/${name}`
	return path;
}

async function storeFileData(file: File, data: FileDataMessage) {
	const path = file.path;
	const offset = BLOCK_LENGTH * data.block_offset;
	let res = await RNFS.write(path, data.data_base64, offset, "base64");
	console.log("File write:", res);
	return res;
}

export { createFilePath, storeFileData };