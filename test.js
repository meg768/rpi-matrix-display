#!/usr/bin/env node

function translateEmojiText(text) {
	var chars = text.match(/./ug);
	var result = [];
	
	chars.forEach((char) => {
		if (char.length == 2 ) {
			result.push(`:${char.codePointAt(0).toString(16).toUpperCase()}:`);
		}
		else
			result.push(char);
		
	});

	return result.join('');
}

var text = "Grinning Face 😀 Winking Face 😉 Smirking Face 😏";

console.log(`Text: ${text}`);
console.log(`Translated text: ${translateEmojiText(text)}`);