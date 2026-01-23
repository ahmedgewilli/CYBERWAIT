const baseUrl = process.env.API_BASE_URL || 'http://localhost:5173';
const url = `${baseUrl.replace(/\/$/, '')}/api/test`;

try {
  const res = await fetch(url);
  const text = await res.text();
  let payload = text;
  try {
    payload = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // leave as text
  }
  console.log(`GET ${url}`);
  console.log(`Status: ${res.status}`);
  console.log(payload);
} catch (err) {
  console.error(`Smoke test failed for ${url}`);
  console.error(err);
  process.exitCode = 1;
}
