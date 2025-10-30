import { SeededRandom, sha256, generateCombinedSeed } from '../src/utils/crypto';
import { generatePegMap, simulateDrop } from '../src/game/engine';

console.log('Testing Deterministic Engine...\n');

const seed1 = 'test-seed-123';
const rng1 = new SeededRandom(seed1);
const rng2 = new SeededRandom(seed1);

const pegMap1 = generatePegMap(rng1);
const pegMap2 = generatePegMap(rng2);

console.log('Test 1: Same seed produces same peg map');
console.log('Peg Map 1 Hash:', pegMap1.hash.substring(0, 16));
console.log('Peg Map 2 Hash:', pegMap2.hash.substring(0, 16));
console.log('Match:', pegMap1.hash === pegMap2.hash ? 'PASS' : 'FAIL');
console.log('');

const serverSeed = 'abc123';
const clientSeed = 'player-seed';
const nonce = 12345;
const dropColumn = 6;

const combined1 = generateCombinedSeed(serverSeed, clientSeed, nonce);
const combined2 = generateCombinedSeed(serverSeed, clientSeed, nonce);

const rng3 = new SeededRandom(combined1);
const rng4 = new SeededRandom(combined2);

const map1 = generatePegMap(rng3);
const map2 = generatePegMap(rng4);

const result1 = simulateDrop(map1, dropColumn, rng3);
const result2 = simulateDrop(map2, dropColumn, rng4);

console.log('Test 2: Same inputs produce same outcome');
console.log('Result 1 - Bin:', result1.finalBin, 'Path:', result1.path.join(','));
console.log('Result 2 - Bin:', result2.finalBin, 'Path:', result2.path.join(','));
console.log('Match:', result1.finalBin === result2.finalBin ? 'PASS' : 'FAIL');
console.log('');

const rng5 = new SeededRandom('different-seed');
const map3 = generatePegMap(rng5);
const result3 = simulateDrop(map3, dropColumn, rng5);

console.log('Test 3: Different seed produces different outcome');
console.log('Original Bin:', result1.finalBin);
console.log('Different Seed Bin:', result3.finalBin);
console.log('Different:', result1.finalBin !== result3.finalBin ? 'PASS' : 'WARNING (might match by chance)');
console.log('');

console.log('All tests completed');

