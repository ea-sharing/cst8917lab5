const axios = require('axios');

module.exports = async function RandomTrafficTest(context, req) {
    try {
        const { totalRequests } = req.body;

        const serverlessUrl = "https://lab2funcs.azurewebsites.net/api/httpread";
        const containerUrl = "http://20.175.163.198:3000/read-document";
        const id = "65d2a54f9ee28edfda258ac2";
        const cst8917lab2shardkey = "mykey_inAzure";
        
        const result = {
            serverless: {
                startTimes: [],
                endTimes: [],
                durations: [],
                averageRequestTime: 0
            },
            container: {
                startTimes: [],
                endTimes: [],
                durations: [],
                averageRequestTime: 0
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

        // Send random traffic to serverless function
        for (let i = 0; i < totalRequests; i++) {
            // Generate a random interval between 0 to 5000 milliseconds
            const randomInterval = Math.floor(Math.random() * 5000);
            await new Promise(resolve => setTimeout(resolve, randomInterval));

            const { startTime, endTime, duration } = await sendPostRequest(serverlessUrl, { id, cst8917lab2shardkey });
            result.serverless.startTimes.push(startTime);
            result.serverless.endTimes.push(endTime);
            result.serverless.durations.push(duration);
        }

        // Send random traffic to container function
        for (let i = 0; i < totalRequests; i++) {
            // Generate a random interval between 0 to 5000 milliseconds
            const randomInterval = Math.floor(Math.random() * 5000);
            await new Promise(resolve => setTimeout(resolve, randomInterval));

            const { startTime, endTime, duration } = await sendPostRequest(containerUrl, { id, cst8917lab2shardkey });
            result.container.startTimes.push(startTime);
            result.container.endTimes.push(endTime);
            result.container.durations.push(duration);
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
    } catch (error) {
        console.error('An error occurred while performing the test:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal Server Error' }
        };
    }
};
