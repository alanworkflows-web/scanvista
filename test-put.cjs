async function run() {
  try {
    const res = await fetch('http://localhost:5173/api/manager/properties/my-property', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Property' })
    });
    console.log("STATUS:", res.status);
    const text = await res.text();
    console.log("BODY:", text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
