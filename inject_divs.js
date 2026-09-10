const fs = require('fs');
const path = require('path');

const files = [
  { name: 'quiz-club.html', slug: 'quiz-club' },
  { name: 'book-club.html', slug: 'book-club' },
  { name: 'learning-by-doing.html', slug: 'learning-by-doing' },
  { name: 'competitions.html', slug: 'competitions' },
  { name: 'extra-curricular.html', slug: 'extra-curricular' },
  { name: 'after-school.html', slug: 'after-school' }
];

files.forEach(f => {
  const p = path.join(__dirname, f.name);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    '<!-- Content intentionally left empty to match template placeholder layout -->',
    `<!-- Content intentionally left empty to match template placeholder layout -->\n        <div id="dynamic-page-content" data-page-slug="${f.slug}"></div>`
  );
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Updated ${f.name}`);
});

// For academics.html (syllabus)
const acaPath = path.join(__dirname, 'academics.html');
let acaContent = fs.readFileSync(acaPath, 'utf8');
if (!acaContent.includes('data-page-slug="syllabus"')) {
  acaContent = acaContent.replace(
    '<div class="container" style="max-width: 900px;">',
    '<div class="container" style="max-width: 900px;">\n        <div id="dynamic-page-content" data-page-slug="syllabus"></div>'
  );
  fs.writeFileSync(acaPath, acaContent, 'utf8');
  console.log('Updated academics.html');
}

// For admissions.html
const admPath = path.join(__dirname, 'admissions.html');
let admContent = fs.readFileSync(admPath, 'utf8');
if (!admContent.includes('data-page-slug="admissions"')) {
  admContent = admContent.replace(
    '<div class="grid-2">',
    '<div id="dynamic-page-content" data-page-slug="admissions"></div>\n        <div class="grid-2">'
  );
  fs.writeFileSync(admPath, admContent, 'utf8');
  console.log('Updated admissions.html');
}
