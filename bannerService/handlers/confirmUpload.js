import {DynamoDBClient} from '@aws-sdk/client-dynamodb';


//Init DynamoDB client
const dynamoDBClient = new DynamoDBClient({
    region: process.env.REGION
});

//lambda function to confirm banner upload
exports.confirmUpload = async (event) => {
    try {
        const tableName = process.env.BANNER_TABLE_NAME;
        const bucketName = process.env.BUCKET_NAME;
        //Extract the banner details from the event
        const record = event.Records[0];

        //Extract file name from s3 event
        const fileName = record.s3.object.key;

        //construct public URL for the uploaded banner
        const bannerUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        const PutItemCommand = new PutItemCommand({
            TableName: tableName,
            Item: {
                'fileName': {S: fileName},
                'bannerUrl': {S: bannerUrl},
                'uploadTime': {S: new Date().toISOString()}
            }
        });

        //Save banner details to DynamoDB
        await dynamoDBClient.send(PutItemCommand);

        //return success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Banner uploaded",
                bannerUrl: bannerUrl
            })
        };

    } catch (error) {
        //return error response
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: "Error confirming banner upload",
                error: error.message
            })
        };
    }
};
