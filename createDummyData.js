const fs = require('fs');
const path = require('path');

/**
 * Generates dummy user data and writes it to a JSON file.
 * @param {number} count Number of user entries to generate.
 * @param {string} filePath Output JSON file path.
 */
function generateDummyUserData(count, filePath) {
    const data = [];

    for (let i = 1; i <= count; i++) {
        const user = {
            id: i,
            firstName: `User${i}FirstName`,
            lastName: `User${i}LastName`,
            Age: Math.floor(Math.random() * (60 - 20 + 1)) + 20, // Random age between 20 and 60
            Salary: Math.floor(Math.random() * (2000000 - 500000 + 1)) + 500000 // Random salary between 5L - 20L
        };
        data.push(user);
    }

    fs.writeFileSync(path.resolve(filePath), JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Dummy data for ${count} users has been written to ${filePath}`);
}

// Example: Generate 10 users and write to data.json
generateDummyUserData(100, 'data.json');
