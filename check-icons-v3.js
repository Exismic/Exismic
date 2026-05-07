const lucide = require('lucide-react');
const keys = Object.keys(lucide);
console.log('Total icons:', keys.length);
console.log('Sample icons:', keys.slice(100, 110));
console.log('Twitter:', keys.find(k => k.toLowerCase().includes('twitter')));
console.log('Github:', keys.find(k => k.toLowerCase().includes('github')));
console.log('X:', keys.find(k => k.toLowerCase() === 'x' || k.toLowerCase() === 'xicon'));
