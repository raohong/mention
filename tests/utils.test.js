import { regEscape } from '../src/utils';

it('test regEscape', () => {
  const specials = [
    '.',
    '?',
    '+',
    '*',
    '{',
    '}',
    '[',
    ']',
    '^',
    '$',
    '\\',
    '/',
    '-'
  ];

  specials.forEach(char => {
    expect(regEscape(char)).toEqual(`\\${char}`);
  });
});
