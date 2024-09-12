import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../services/dynamodb";
import { success } from "../responses/success";
import { error } from "../responses/error";
import { v4 as uuidv4 } from "uuid";

const docClient = DynamoDBDocumentClient.from(db);

export const handler = async (event: any) => {
  try {
    const newEvent = JSON.parse(event.body);

    const id = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: `EVENT#${id}`,
          SK: `EVENT#${id}`,
          id,
          ...newEvent,
        },
      })
    );

    return success({ message: "Event added successfully", id });
  } catch (err) {
    console.error("Error adding event:", err);
    return error("Could not add event");
  }
};
