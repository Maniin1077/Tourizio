const fs = require('fs');

// Read your JSON file
const data = JSON.parse(fs.readFileSync('src/assets/data/dummydata.json', 'utf8'));

// Reduce all prices by 25%
data.forEach(place => {
  if (place.price) {
    place.price = Math.round(place.price * 0.75);
  }
});

// Save back the updated data
fs.writeFileSync('src/assets/data/dummydata.json', JSON.stringify(data, null, 2));
console.log('✅ Prices reduced by 25% successfully!');
