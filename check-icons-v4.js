const lucide = require('lucide-react');
const keys = Object.keys(lucide);
console.log('Code:', keys.includes('Code'));
console.log('Camera:', keys.includes('Camera'));
console.log('Link:', keys.includes('Link'));
console.log('Globe:', keys.includes('Globe'));
console.log('Mail:', keys.includes('Mail'));
console.log('Heart:', keys.includes('Heart'));
console.log('Instagram:', keys.find(k => k.toLowerCase().includes('insta')));
