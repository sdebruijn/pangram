function encode(string) {
    return btoa(string)
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
}

function decode(string) {
    string = string.replaceAll('-', '+').replaceAll('_', '/');
    let padding = string.length % 4;
    if (padding === 1) {
        // Invalid Base64 string
        console.error("Invalid base64 string for decoding");
        return "";
    }
    if (padding > 0) {
        string += '='.repeat(4 - padding);
    }
    return atob(string);
}

function isValidLetters(letters) {
    if (letters === null) {
        return false;
    }
    if (/[^a-z]/.test(letters)) {
        console.log('letters contains non-alpha characters');
        return false;
    }
    if (letters.length !== 7) {
        console.log('letters does not contain exactly 7 characters');
        return false;
    }
    if (!hasUniqueChars(letters)) {
        console.log('letters does not contain 7 unique characters');
        return false;
    }
    return true;
}

function hasUniqueChars(string) {
    return new Set(string).size === string.length;
}

function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}