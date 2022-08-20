import RNFS from "react-native-fs";
import { File } from "./messageTransmitter";
import { FileDataMessage } from "./netMessages";

const BLOCK_LENGTH = 49152;//2**16 in base64

function createFilePath(uid: string, id: string, name: string) {
	const folder = `${RNFS.DocumentDirectoryPath}/${uid}/${id}`;
	RNFS.mkdir(folder).then(console.log).catch(console.error);
	const path = `${folder}/${name}`
	return path;
}

function sizeInBlocks(number: number) {
	let blocks = Math.ceil(number / BLOCK_LENGTH);
	return blocks;
}

async function storeFileData(file: File, data: FileDataMessage) {
	const path = file.path;
	const offset = BLOCK_LENGTH * data.block_offset;
	let res;
	try {
		res = await RNFS.write(path, data.data_base64, offset, "base64");
	} catch (e) {
		console.error("Failed to write file:", e);
		throw e;
	}
	// console.log("File write:", res);
	return res;
}

async function getFileBlock(file: File, block: number): Promise<string> {
	const path = file.path;
	const offset = BLOCK_LENGTH * block;
	const len = Math.min(BLOCK_LENGTH, file.size - offset);
	// console.log("File read", offset, block, len, file.size - offset);
	let res;
	try {
		res = await RNFS.read(path, len, offset, "base64");
	} catch (e) {
		console.error("Failed to read file:", e);
		throw e;
	}
	return res;
}

export { createFilePath, storeFileData, sizeInBlocks, getFileBlock };