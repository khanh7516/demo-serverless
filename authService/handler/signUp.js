//import aws cognito sdk
import {CLIENT_ID} from '../../common/constants'
import {
  SignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';
import {client} from '../../common/cognito-client';
import UserModel from '../models/UserModel';

//Export sign-up function
exports.signUp = async (event) => {
    const {email, password, fullName} = JSON.parse(event.body);
    const username = fullName.replace(/\s+/g, '_'); //replace spaces with underscores
    //configure parameters for cognito SignupCommand
    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: //additionnal user attributes
        [ 
            {
                Name: 'email',
                Value: email
            },
            {
                Name: 'name',
                Value: fullName
            }
        ]
    };

    try {
        //Create user in Cognito user pool
        const command = new SignUpCommand(params);
        await client.send(command);

        //Create user in DynamoDB
        const user = new UserModel(email, username);
        await user.save();

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Account created. Please verify your email"
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: "Signup failed",
                error: error.message
            })
        };
    }
}