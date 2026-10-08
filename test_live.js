async function run() {
  try {
    const res = await fetch('https://mvmredhills.com/api/pages/syllabus');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Body start:', text.substring(0, 100));
  } catch(e) {
    console.error(e);
  }
}
run();
