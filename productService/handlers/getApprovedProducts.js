import {DynamoDBClient, ScanCommand} from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({
    region: process.env.REGION
});

exports.getApprovedProducts = async (event) => {
    try {
        const tableName = process.env.PRODUCT_TABLE_NAME;
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "isApproved = :trueVal",
            ExpressionAttributeValues: {
                ":trueVal": { BOOL: true }
            }
        });

        //Excute the scan command
        const scanResult = await dynamoDbClient.send(scanCommand);
        const items = scanResult.Items;

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Approved products retrieved successfully",
                products: items || []
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "Error retrieving approved products",
                error: error.message
            })
        };
    }
};