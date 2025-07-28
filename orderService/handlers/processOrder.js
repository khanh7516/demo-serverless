import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({
    region: process.env.REGION,
});

exports.processOrder = async (event) => {
    try {
        //Loop through each record in the event
        for (const record of event.Records) {
            //Parse the order from the SQS message
            const order = JSON.parse(record.body);

            //Destructure order details
            const {id, productId, quantity, email, status, createdAt} = order

            //send a command to DynamoDB to put the order in the Orders table
            const putCommand = new PutItemCommand({ 
                TableName: process.env.DYNAMO_TABLE,
                Item: {
                    id: {S: id},
                    productId: {S: productId},
                    quantity: {N: quantity.toString()},
                    email: {S: email},
                    status: {S: status},
                    createdAt: {S: createdAt},
                },
            });
            await dynamoDbClient.send(putCommand);

            return {
                statusCode: 200,
                body: JSON.stringify({message: "Order processed successfully", orderId: id}),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing order",
                error: error.message,
            }),
        };
    }
};