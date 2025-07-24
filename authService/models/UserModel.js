import { DynamoDBClient, DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {uuidv4} from "uuid";
import { REGION } from "../common/constants";

//Init DynamoDb client
const DynamoDBClient = new DynamoDBClient({
    regiqn: REGION,
});

const TABLE_NAME = "Users"
//User Model class to represent a user and handle database operations
class UserModel{
    constructor(email, fullName) {
        this.userId = uuidv4(); //Generate unique userId
        this.email = email;
        this.fullName = fullName;
        this.state = '';
        this.city = '';
        this.locality = '';
        this.createAt = new Date().toDateString(); //User creation timestamp
    }

    async save() {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                userId: {S: this.userId},
                email: {S: this.email},
                fullName: {S: this.fullName},
                state: {S: this.state},
                city: {S: this.city},
                locality: {S: this.locality},
                createAt: {S: this.createAt},
            }
        }

        try {
            const command = new PutItemCommand(params);
            await DynamoDBClient.send(command);
        } catch (error) {
            throw new Error("Could not save user data");
        }
    }   
}

module.exports = UserModel;