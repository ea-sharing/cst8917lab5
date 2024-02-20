const axios = require('axios');

module.exports = async function (context, req) {
    const { totalRequests, intervalSeconds } = req.body;
    const documentId = "65d234cbb7bbf66b06d53d86";
    const shardKey = "mykey_inAzure";

    const result = {
        serverless: {
            startTimes: [],
            endTimes: [],
            durations: [],
            averageRequestTime: 0,
            totalTime: 0
        },
        container: {
            startTimes: [],
            endTimes: [],
            durations: [],
            averageRequestTime: 0,
            totalTime: 0
        }
    };

    // Function to send HTTP POST request
    async function sendPostRequest(url, payload) {
        const startTime = new Date();
        const response = await axios.post(url, payload);
        const endTime = new Date();
        const duration = endTime - startTime;
        return {
            startTime,
            endTime,
            duration,
            responseData: response.data
        };
    }

    // Simulate consistent traffic for serverless function
    for (let i = 0; i < totalRequests; i++) {
        const serverlessUrl = 'https://lab2funcs.azurewebsites.net/api/httpread';
        const serverlessPayload = {
            id: documentId,
            cst8917lab2shardkey: shardKey
        };
        const { startTime, endTime, duration } = await sendPostRequest(serverlessUrl, serverlessPayload);
        result.serverless.startTimes.push(startTime);
        result.serverless.endTimes.push(endTime);
        result.serverless.durations.push(duration);

        // Wait for the specified interval before sending the next request
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    }

    // Simulate consistent traffic for container function
    for (let i = 0; i < totalRequests; i++) {
        const containerUrl = 'http://20.175.163.198:3000/read-document';
        const containerPayload = {
            id: documentId,
            cst8917lab2shardkey: shardKey
        };
        const { startTime, endTime, duration } = await sendPostRequest(containerUrl, containerPayload);
        result.container.startTimes.push(startTime);
        result.container.endTimes.push(endTime);
        result.container.durations.push(duration);

        // Wait for the specified interval before sending the next request
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    }

    // Calculate total time for each function
    result.serverless.totalTime = result.serverless.endTimes[result.serverless.endTimes.length - 1] - result.serverless.startTimes[0];
    result.container.totalTime = result.container.endTimes[result.container.endTimes.length - 1] - result.container.startTimes[0];

    // Calculate average request time for serverless function
    const serverlessTotalDuration = result.serverless.durations.reduce((total, duration) => total + duration, 0);
    result.serverless.averageRequestTime = serverlessTotalDuration / totalRequests;

    // Calculate average request time for container function
    const containerTotalDuration = result.container.durations.reduce((total, duration) => total + duration, 0);
    result.container.averageRequestTime = containerTotalDuration / totalRequests;

    context.res = {
        status: 200,
        body: result
    };
};
