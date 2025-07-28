import {DynamoDBClient, UpdateItemCommand} from "@aws-sdk/client-dynamodb";


const dynamoDbClient = new DynamoDBClient({
    region: process.env.REGION,
});


exports.updateOrderStatus = async (event) => {
    try {
        // Extract order ID and new status from the event
        const {id, email, quantity, product} = event;
        
        await dynamoDbClient.send(new UpdateItemCommand({
            TableName: process.env.DYNAMO_TABLE,
            Key: {
                id: {S: id},
            },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: {
                "#status": "status",
            },
            ExpressionAttributeValues: {
                ":status": {S: "shipping"}, // Assuming the new status is "shipping"
            },
        }));

        const content = `${product.productName?.S} is now shipping.`;
        await sfnClient.send(startExecutionCommand);

        await sendOrderEmail(email, id, product.name?.S || "Unknown Product", quantity, content); // Send confirmation email

        return {
            statusCode: 200,
            body: JSON.stringify({message: "Order status updated successfully", orderId: id}),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating order status",
                error: error.message,
            }),
        };
    }   
};