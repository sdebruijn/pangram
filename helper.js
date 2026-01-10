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
