import {
    InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new DynamoDBClient({ region: process.env.REGION });
const CLIENT_ID = process.env.CLIENT_ID; // The Cognito User Pool Client ID

exports.signIn = async (event) => {
    const {email, password} = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH', //auth flow for username/password
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    };

    try {
        const command = new InitiateAuthCommand(params);
        const response = await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Signup successfully",
                tokens: response.AuthenticationResult, //contain AccessToken, RefreshToken, IdToken
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "Signin failed",
                error: error.message
            })
        };
    }

}