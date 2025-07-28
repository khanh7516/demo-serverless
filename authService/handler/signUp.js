import {
    SignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new DynamoDBClient({ region: process.env.REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID; // The Cognito User Pool Client ID

//Export sign-up function
exports.signUp = async (event) => {
    const {email, password, fullName} = JSON.parse(event.body);
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
        const user = new UserModel(email, fullName);
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