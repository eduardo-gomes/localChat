// generateRandomUUID.js
// modified from
// https://github.com/DavidAnson/generateRandomUUID
// 2019-10-27

// JavaScript code to efficiently generate a random UUID per RFC 4122
function generateRandomUUID() {
	// UUIDs have 16 byte values
	const bytes = new Uint8Array(16);
	//Pseudorandom bytes
	for(let i = 0; i < 16; ++i){
		bytes[i] = Math.random()*256;//Not the best way, TODO: replace with a proper library
	}
	// Set required fields for an RFC 4122 random UUID
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	// Convert bytes to hex and format appropriately
	const uuid = Array.prototype.map.call(bytes, (b, i) => {
		// Left-pad single-character values with 0,
		// Convert to hexadecimal,
		// Add dashes
		return ((b < 16) ? "0" : "") +
			b.toString(16) +
			(((i % 2) && (i < 10) && (i > 2)) ? "-" : "");
	}).join("");
	// Return the string
	return uuid as string;
}

export default generateRandomUUID;