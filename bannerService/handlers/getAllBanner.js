import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({
    region: process.env.REGION,
});

exports.getAllBanner = async (event) => {
    try {
        const tableName = process.env.DYNAMO_TABLE;
        const scanCommand = new ScanCommand({
            TableName: tableName,
        });

        const scanResult = await dynamoDbClient.send(scanCommand);
        const items = scanResult.Items;

        if(!items || items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No banners found" }),
            };
        }

        const banners = items.map(item => ({
            imageUrl: item.imageUrl.S,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(banners),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error retrieving banners",
                error: error.message,
            }),
        };
    }
};