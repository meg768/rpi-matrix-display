#!/usr/bin/env node

require('yow/prefixConsole')();

var path = require('path');
var sprintf = require('yow/sprintf');
var once = require('yow/once');


var loadEmojis = once((folder) => {
    var fs = require('fs');
    var path = require('path');

    var images = [];

    fs.readdirSync(folder).forEach((file) => {

        var fileName = path.join(folder, file);
        var components = path.parse(fileName);

        if (components.ext == '.png') {
			var parts = components.name.split('_');

			if (parts.length == 2) {
				var name = parts[0].toLowerCase();
				var code = parts[1].toUpperCase();

				images[name] = fileName;
				images[code] = fileName;
			}
			else {
				images[components.name] = fileName;
			}
        }

    })

    return images;

});

var emojis = loadEmojis('emojis');

function translateEmojiText(text) {
	var chars = text.match(/./ug);
	var result = [];
	
	chars.forEach((char) => {
        console.log(char);
		var code = char.codePointAt(0).toString(16).toUpperCase();

		if (emojis[code] != undefined)
			result.push(`:${code}:`);
		else
			result.push(char);
		
	});

	return result.join('');
}

var text = "Grinning Face 😀 Winking Face 😉 Smirking Face 😏";
var text = "A 😀 B 😉 C 😏 :grinning-face-with-smiling-eyes:";
var text = "A – B :grinning-face-with-smiling-eyes:";
var text = "A ☁️ B";

console.log(`Text: ${text}`);
console.log(`Translated text: ${translateEmojiText(text)}`);



const facepalm = "😊"; //"🤦🏼‍♂️";
facepalm = "🌧"

const codePoints = Array.from(facepalm)
  .map((v) => v.codePointAt(0).toString(16))
  .map((hex) => "\\u{" + hex + "}");
console.log(codePoints);

//["\u{1f926}", "\u{1f3fc}", "\u{200d}", "\u{2642}", "\u{fe0f}"]