//import aws cognito sdk
import {
    GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new DynamoDBClient({ region: process.env.REGION });

exports.signOut = async (event) => {
    const {accessToken} = JSON.parse(event.body);

    const params = {
        AccessToken: accessToken, //from sign in response
    };

    try {
        const command = new GlobalSignOutCommand(params);
        await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Signout successfully",
                tokens: response.AuthenticationResult, //contain AccessToken, RefreshToken, IdToken
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "Signout failed",
                error: error.message
            })
        };
    }
}