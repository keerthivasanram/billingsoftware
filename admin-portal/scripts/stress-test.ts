const http = require("http");

async function runStressTest() {
  const NUM_CLIENTS = 100;
  const PORT = 3001;
  const HOST = "localhost";
  const URL = `http://${HOST}:${PORT}/`;

  console.log(`Starting stress test: ${NUM_CLIENTS} simultaneous requests to ${URL}`);

  let successCount = 0;
  let errorCount = 0;
  let totalTime = 0;

  const makeRequest = (isWarmup = false) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const req = http.get(URL, (res: any) => {
        let data = '';
        res.on('data', (chunk: string) => data += chunk);
        res.on('end', () => {
          const time = Date.now() - start;
          if (!isWarmup) {
            if (res.statusCode === 200) {
              successCount++;
            } else {
              errorCount++;
              console.error(`Request failed with status code ${res.statusCode}`);
            }
          }
          resolve(time);
        });
      });

      req.on('error', (err: any) => {
        const time = Date.now() - start;
        if (!isWarmup) errorCount++;
        console.error(`Request failed: ${err.message}`);
        resolve(time);
      });

      req.setTimeout(30000, () => {
        req.destroy(new Error('Request Timeout'));
      });
    });
  };

  console.log(`Sending a warm-up request to trigger Next.js compilation...`);
  await makeRequest(true);
  console.log(`Warm-up complete. Firing 100 concurrent requests...`);

  const startTime = Date.now();
  
  // Fire off all requests simultaneously
  const requests = Array.from({ length: NUM_CLIENTS }).map(() => makeRequest());
  const times: any[] = await Promise.all(requests);
  
  const endTotalTime = Date.now() - startTime;
  
  const avgTime = times.reduce((a, b) => a + b, 0) / NUM_CLIENTS;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);

  console.log("\n--- STRESS TEST RESULTS ---");
  console.log(`Total Requests Sent: ${NUM_CLIENTS}`);
  console.log(`Successful (200 OK): ${successCount}`);
  console.log(`Failed/Errors:       ${errorCount}`);
  console.log(`Total Elapsed Time:  ${endTotalTime}ms`);
  console.log(`Avg Request Time:    ${avgTime.toFixed(2)}ms`);
  console.log(`Max Request Time:    ${maxTime}ms`);
  console.log(`Min Request Time:    ${minTime}ms`);
  
  if (errorCount > 0) {
    console.log("\nWARNING: Some requests failed. The server might be struggling under load.");
  } else if (maxTime > 3000) {
    console.log("\nWARNING: Server handled the load, but some requests took over 3 seconds. The Admin UI might need pagination.");
  } else {
    console.log("\nSUCCESS: Server handled the load efficiently!");
  }
}

runStressTest();
