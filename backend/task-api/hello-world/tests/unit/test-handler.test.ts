// No import for describe or it from 'node:test' - Jest provides these globally
// No manual import for expect - Jest provides this globally

// Corrected import path assuming app.ts is in the parent directory of 'tests/unit/'
// If app.ts is in 'hello-world/app.ts' and this test is in 'hello-world/tests/unit/test-handler.test.ts',
// then '../../app' is correct.
import { lambdaHandler } from '../../app';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

describe('Unit test for app handler', () => {
    // Define a reusable mock context
    const mockContext: Context = {
        callbackWaitsForEmptyEventLoop: false,
        functionName: 'test-lambda',
        functionVersion: '$LATEST',
        invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-lambda',
        memoryLimitInMB: '128',
        awsRequestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
        logGroupName: '/aws/lambda/test-lambda',
        logStreamName: '2022/01/01/[$LATEST]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        getRemainingTimeInMillis: () => 3000, // Mock remaining time
        done: () => {},
        fail: () => {},
        succeed: () => {},
    };

    // Helper function to create mock API Gateway events
    const createMockEvent = (httpMethod: string = 'GET', path: string = '/'): APIGatewayProxyEvent => ({
        httpMethod,
        path,
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
            accountId: '123456789012',
            apiId: 'api-id',
            authorizer: undefined,
            protocol: 'HTTP/1.1',
            httpMethod, // Reflects the method being tested
            identity: {
                accessKey: null, accountId: null, apiKey: null, apiKeyId: null, caller: null, clientCert: null,
                cognitoAuthenticationProvider: null, cognitoAuthenticationType: null, cognitoIdentityId: null,
                cognitoIdentityPoolId: null, principalOrgId: null, sourceIp: '127.0.0.1', user: null,
                userAgent: 'Custom User Agent String', userArn: null,
            },
            path, // Reflects the path being tested
            stage: 'dev',
            requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
            requestTimeEpoch: 1428582896000,
            resourceId: '123456',
            resourcePath: path, // Reflects the path being tested
        },
        body: null,
        isBase64Encoded: false,
        resource: path, // Reflects the path being tested
    });

    it('should return 200 OK and hello world message for default path', async () => {
        const event = createMockEvent('GET', '/'); // Test default path
        const result: APIGatewayProxyResult = await lambdaHandler(event, mockContext);

        expect(result.statusCode).toEqual(200);
        expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(typeof result.body).toBe('string');
        const responseBody = JSON.parse(result.body);
        expect(responseBody).toEqual({ message: 'hello world' });
    });

    it('should return 200 OK and healthy message for /health path', async () => {
        const event = createMockEvent('GET', '/health');
        const result: APIGatewayProxyResult = await lambdaHandler(event, mockContext);

        expect(result.statusCode).toEqual(200);
        expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(typeof result.body).toBe('string');
        const responseBody = JSON.parse(result.body);
        expect(responseBody).toEqual({ message: 'API is healthy and running!' });
    });

    it('should return 405 Method Not Allowed for non-GET requests to default path', async () => {
        const event = createMockEvent('POST', '/'); // Test with POST to default path
        const result: APIGatewayProxyResult = await lambdaHandler(event, mockContext);

        expect(result.statusCode).toEqual(405);
        expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(typeof result.body).toBe('string');
        const responseBody = JSON.parse(result.body);
        expect(responseBody).toEqual({ error: 'Method Not Allowed' });
    });

    it('should handle errors gracefully (triggering the catch block)', async () => {
        // Mock console.error to avoid noise in test output and to verify it's called
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Use the specific path that triggers an error in app.ts
        const event = createMockEvent('GET', '/error-trigger');
        
        const result: APIGatewayProxyResult = await lambdaHandler(event, mockContext);

        expect(result.statusCode).toEqual(500);
        expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(typeof result.body).toBe('string');
        const responseBody = JSON.parse(result.body);
        expect(responseBody).toEqual({ message: 'some error happened' });
        
        // Verify that console.error was called (optional, but good for error logging)
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        // Restore console.error
        consoleErrorSpy.mockRestore();
    });
});