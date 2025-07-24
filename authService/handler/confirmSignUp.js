import {CLIENT_ID} from '../../common/constants';
import {
  ConfirmSignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';
import {client} from '../common/cognito-client';

exports.confirmSignUp = async (event) => {
    const {email, confirmationCode} = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode:confirmationCode,
    };

    try {
        const command = new ConfirmSignUpCommand(params);
        await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Signup successfully confirmed"
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "Confirmation failed",
                error: error.message
            })
        };
    }
}