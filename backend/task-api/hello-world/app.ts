import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {Object} context - AWS Lambda Context Object
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    // Log the event and context for debugging (optional, but helpful)
    // console.log('EVENT RECEIVED:', JSON.stringify(event));
    // console.log('CONTEXT RECEIVED:', JSON.stringify(context));

    try {
        // Special path to test the error handling (catch block)
        if (event.path === '/error-trigger' && event.httpMethod === 'GET') {
            throw new Error("Simulated internal error for testing the catch block");
        }

        // Handle /health route
        if (event.path === '/health' && event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'API is healthy and running!',
                }),
            };
        }

        // Default "hello world" response for GET requests to other paths (e.g., '/')
        if (event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'hello world',
                }),
            };
        }

        // If no other condition is met for a GET, or if it's not a GET, return Method Not Allowed
        // This handles the case from the "should return 405 Method Not Allowed for non-GET requests" test
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: 'Method Not Allowed',
            }),
        };
    } catch (err) {
        console.error('ERROR in lambdaHandler:', err); // Use console.error for errors
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'some error happened', // Generic error message
                // error: err instanceof Error ? err.message : String(err) // Optionally include error details
            }),
        };
    }
};