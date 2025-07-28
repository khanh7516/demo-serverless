import {v4 as uuidv4} from "uuid";
import axios from "axios";
import {SQSClient, SendMessageCommand} from "@aws-sdk/client-sqs";
import {SFNClient, StartExecutionCommand} from "@aws-sdk/client-sfn";
import {sendOrderEmail} from "../services/sendEmail.js"; // Import the sendOrderEmail function  


const sqsClient = new SQSClient({
    region: process.env.REGION,
});

const sfnClient = new SFNClient({
    region: process.env.REGION,
});

exports.placeOrder = async (event) => {
    try {
        //extract email from JWT Claim
        const email = event.requestContext.authorizer.jwt.claims.email;

        const {id, quantity} = JSON.parse(event.body);

        if (!id || !quantity || !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "Missing required fields: id, quantity, email"}),
            };
        }
        const productResponse = await axios.get(`https://cgz6yybtca.excute-api/get-approved-products`);

        const approvedProducts = productResponse.data.products || [];

        const product = approvedProducts.find((p) => p.id?.S === id);

        if (!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({message: "Product not found or not approved"}),
            };
        }

        const availableQuantity = parseInt(product.quantity?.N || "0", 10);
        if (availableQuantity < quantity) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "Insufficient product quantity available"}),
            }; 
        }

        const orderId = uuidv4();
        const order = {
            id: orderId,
            productId: id,
            quantity,
            email,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        // Send order to SQS queue
        const sendMessageCommand = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify(order),
        });

        await sqsClient.send(sendMessageCommand);

        // Start Step Function execution
        const startExecutionCommand = new StartExecutionCommand({
            stateMachineArn: process.env.STEP_FUNCTION_ARN,
            input: JSON.stringify({...order, product}),
        });

        const content = "We will notify you once your order is shipped.";
        await sfnClient.send(startExecutionCommand);

        await sendOrderEmail(email, orderId, product.name?.S || "Unknown Product", quantity, content); // Send confirmation email
        
        return {
            statusCode: 201,
            body: JSON.stringify({message: "Order placed successfully", order}),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error placing order",
                error: error.message,
            }),
        };
    }
};