import {DynamoDBClient, DeleteItemCommand, ScanCommand} from '@aws-sdk/client-dynamodb';
import {SNSClient, PublishCommand} from '@aws-sdk/client-sns';

const dynamoDBClient = new DynamoDBClient({
    region: process.env.REGION 
});
const snsClient = new SNSClient({ region: process.env.REGION });

exports.cleanupCategories = async (event) => {
    try {
        const tableName = process.env.DYNAMO_TABLE;
        const snsTopicArn = process.env.SNS_TOPIC_ARN;

        //calculate the timestamp for 1 hour ago (to filter outđate categories)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        //create scan command to find categories older than 1 hour (createAt < oneHourAgo) and don't have image url
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "attribute_not_exists(imageUrl) AND createAt < :oneHourAgo",
            ExpressionAttributeValues: {
                ":oneHourAgo": { S: oneHourAgo } //bind the oneHourAgo value
            }
        });

        //execute the scan command
        const scanResult = await dynamoDBClient.send(scanCommand);
        const itemsToDelete = scanResult.Items;

        //if there are no items to delete, return success response
        if (itemsToDelete.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    msg: "No outdated categories found"
                })
            };
        }

        //intialize counter for deleted items
        let deletedCount = 0;

        //loop through the items and delete each one
        for (const item of itemsToDelete) {
            const deleteCommand = new DeleteItemCommand({
                TableName: tableName,
                Key: {
                    'fileName': {S: item.fileName.S}, // Assuming categoryName is the primary key
                }
            });

            //execute the delete command
            await dynamoDBClient.send(deleteCommand);
            deletedCount++;
        }

        //send notification about the cleanup
        const message = `${deletedCount} outdated categories deleted successfully.`;
        await snsClient.send(new PublishCommand({
            TopicArn: snsTopicArn,
            Message: message,
        }));

        //return success response with count of deleted items
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: `${deletedCount} outdated categories deleted successfully`
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "Error cleaning up categories",
                error: error.message
            })
        };
    }
};