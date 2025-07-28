import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({
    region: process.env.REGION, 
});

exports.getAllCategories = async (event) => {
    try {
        const tableName = process.env.DYNAMO_TABLE;
        const scanCommand = new ScanCommand({
            TableName: tableName,
        });

        const scanResult = await dynamoDbClient.send(scanCommand);
        const items = scanResult.Items;

        if (!items || items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No categories found" }),
            };
        }
        
        const categories = items.map(item => ({
            categoryName: item.categoryName.S,
            imageUrl: item.imageUrl.S,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(categories),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error retrieving categories",
                error: error.message,
            }),
        };
    }
};