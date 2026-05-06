
export const toBase64 = text => {
    const buffer = new TextEncoder("utf-8").encode(text);
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export const toText = encodedText => {
    const buffer = new Uint8Array(Array.from(atob(encodedText)).map(charCode => charCode.charCodeAt(0)));
    return new TextDecoder("utf-8").decode(buffer)
}
