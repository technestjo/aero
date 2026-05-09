const fs = require('fs');
const path = require('path');

const filesToUpdate = ['public/privacy.html', 'public/terms.html'];

filesToUpdate.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Replace univr.onrender.com with www.aerotwinvr.com
        content = content.replace(/https?:\/\/univr\.onrender\.com\/?/g, 'https://www.aerotwinvr.com/');
        content = content.replace(/univr\.onrender\.com/g, 'www.aerotwinvr.com');
        
        // Update cookie policy link in footer
        content = content.replace(/<li><a href="#">Cookie Policy<\/a><\/li>/g, '<li><a href="cookies.html">Cookie Policy</a></li>');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
