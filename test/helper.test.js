import { isValidLetters, hasUniqueChars } from '../src/helper.js';

describe('hasUniqueChars', () => {
    test('should return true for a string with unique characters', () => {
        expect(hasUniqueChars('abcdefg')).toBe(true);
    });

    test('should return false for a string with duplicate characters', () => {
        expect(hasUniqueChars('abccdef')).toBe(false);
    });

    test('should return true for an empty string', () => {
        expect(hasUniqueChars('')).toBe(true);
    });

    test('should return true for a single character string', () => {
        expect(hasUniqueChars('a')).toBe(true);
    });
});

describe('isValidLetters', () => {
    test('should return true for a valid 7-character unique lowercase string', () => {
        expect(isValidLetters('abcdefg')).toBe(true);
    });

    test('should return false for null input', () => {
        expect(isValidLetters(null)).toBe(false);
    });

    test('should return false for undefined input', () => {
        expect(isValidLetters(undefined)).toBe(false);
    });

    test('should return false for input with non-alphabetic characters', () => {
        expect(isValidLetters('abcde12')).toBe(false);
        expect(isValidLetters('abcde!g')).toBe(false);
        expect(isValidLetters('aBcdefg')).toBe(false); // Uppercase
    });

    test('should return false for input with incorrect length (less than 7)', () => {
        expect(isValidLetters('abcdef')).toBe(false);
        expect(isValidLetters('a')).toBe(false);
        expect(isValidLetters('')).toBe(false);
    });

    test('should return false for input with incorrect length (more than 7)', () => {
        expect(isValidLetters('abcdefgh')).toBe(false);
    });

    test('should return false for input with duplicate characters', () => {
        expect(isValidLetters('abccdef')).toBe(false);
        expect(isValidLetters('aaaaaaa')).toBe(false);
    });

    test('should handle "ĳ" character correctly', () => {
        expect(isValidLetters('abcdefĳ')).toBe(true);
        expect(isValidLetters('abcdeffĳ')).toBe(false); // Duplicate 'f'
        expect(isValidLetters('abcde1ĳ')).toBe(false); // Non-alpha
    });

    test('should return false for string with spaces', () => {
        expect(isValidLetters('abcde f')).toBe(false);
    });
});
