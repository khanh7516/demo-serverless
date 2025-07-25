import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateItemCommand } from '@aws-sdk/lib-dynamodb';

const dynamodDbClient = new DynamoDBClient({
    region: process.env.REGION,
});

exports.updateCategoryImage = async (event) => {
    try {
        const tableName = process.env.CATEGORY_TABLE_NAME;

        const record = event.Records[0];
        const fileName = record.s3.object.key;
        const bucketName = record.s3.bucket.name;
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        const updateItemCommand = new UpdateItemCommand({
            TableName: tableName,
            Key: {
                'fileName': { S: fileName },
            },
            UpdateExpression: "SET imageUrl = :imageUrl", // Update the imageUrl attribute
            ExpressionAttributeValues: {
                ':imageUrl': { S: imageUrl },
            },
        });

        await dynamodDbClient.send(updateItemCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Category image updated successfully",
                imageUrl: imageUrl,
            }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "Error updating category image",
                error: error.message,
            }),
        };  
    }
};