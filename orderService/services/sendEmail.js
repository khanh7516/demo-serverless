import {SESClient, SendEmailCommand} from '@aws-sdk/client-ses';

const sesClient = new SESClient({
    region: process.env.REGION,
});

//export sendOrderEmail function
exports.sendOrderEmail = async (toEmail, orderId, prductName, quantity, content) => {
    //Contstruct the email parameters
    const params = {
        Destination: {
            ToAddresses: [toEmail], // The email address to send the email to
        },
        Message: {
            Body: {
                Text: {
                    Data: `Your order with ID ${orderId} for ${quantity} of ${prductName} has been placed successfully. ${content}`,
                },
            },
            Subject: {
                Data: 'Order Confirmation',
            },
        },
        Source: process.env.SENDER_EMAIL, // The email address that is sending the email
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
    } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};