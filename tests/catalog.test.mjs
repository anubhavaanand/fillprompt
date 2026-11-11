// Tests for slots() in api/_catalog.js: fill-in slot pattern extraction.
// Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slots } from '../api/_catalog.js';

test('slots: {argument name="x" default="y"} pattern', () => {
  const result = slots('Write about {argument name="topic" default="cats"} today.');
  assert.deepEqual(result, [{ name: 'topic', example: 'cats' }]);
});

test('slots: ${name} and ${name:default} patterns', () => {
  const result = slots('Hello ${name}, you have ${count:0} new messages.');
  assert.deepEqual(result, [
    { name: 'name', example: '' },
    { name: 'count', example: '0' },
  ]);
});

test('slots: [PLACEHOLDER] in capitals', () => {
  const result = slots('Buy [PRODUCT] at [STORE NAME].');
  assert.deepEqual(result, [
    { name: 'PRODUCT', example: '' },
    { name: 'STORE NAME', example: '' },
  ]);
});

test('slots: {placeholder} in lower case', () => {
  const result = slots('Your {username} has logged in from {ip address}.');
  assert.deepEqual(result, [
    { name: 'username', example: '' },
    { name: 'ip address', example: '' },
  ]);
});

test('slots: a prompt with no slots returns []', () => {
  assert.deepEqual(slots('Just a plain sentence with no fill-ins.'), []);
});

test('slots: the same slot twice is listed once', () => {
  const result = slots('Use {argument name="color" default="blue"} for the {argument name="color" default="blue"} theme.');
  assert.deepEqual(result, [{ name: 'color', example: 'blue' }]);
});

test('slots: JSON prompts do not produce slots', () => {
  assert.deepEqual(slots('{"style": "cinematic", "mood": "dark"}'), []);
  assert.deepEqual(slots('{"name": "Alice", "role": "${user}"}'), [
    { name: 'user', example: '' },
  ]);
});
