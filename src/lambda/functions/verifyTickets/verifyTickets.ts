import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "../../services/dynamodb";
import { success } from "../responses/success";
import { error } from "../responses/error";

const docClient = DynamoDBDocumentClient.from(db);

export const handler = async (event: any) => {
  try {
    const { ticketNumber, eventId } = JSON.parse(event.body);

    const ticketResult = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `TICKET#${ticketNumber}`,
        },
      })
    );

    if (!ticketResult.Item) {
      return error("Ticket not found", 404);
    }

    if (ticketResult.Item.verified) {
      return error("Ticket has already been verified", 400);
    }

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `EVENT#${eventId}`,
          SK: `TICKET#${ticketNumber}`,
        },
        UpdateExpression: "SET verified = :verified",
        ExpressionAttributeValues: {
          ":verified": true,
        },
        ConditionExpression: "attribute_exists(PK)",
      })
    );

    return success({
      message: "Ticket verified successfully",
      ticketNumber,
    });
  } catch (err) {
    console.error("Error verifying ticket:", err);
    return error("Could not verify ticket");
  }
};
